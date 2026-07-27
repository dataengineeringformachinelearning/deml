"""UC-INGEST-001/002 sealed telemetry wire contracts (DEML product-local ids)."""

from __future__ import annotations

import base64
import binascii
import hashlib
import re
from typing import Any, Final, Literal
from urllib.parse import parse_qsl, unquote_plus, urlencode
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

# --- Wire constants ---
TELEMETRY_CONTENT_TYPE: Final[str] = "application/forjd-telemetry+v1"
TELEMETRY_WORKFLOW_ID: Final[str] = "deml_telemetry"
FORJD_TELEMETRY_WORKFLOW_ID: Final[str] = "threat_telemetry"
MAX_INGEST_BATCH_EVENTS: Final[int] = 25
MAX_INGEST_BODY_BYTES: Final[int] = 8 * 1024 * 1024

EVENT_TYPE_TO_FORJD: Final[dict[str, str]] = {
  "deml.metric": "threat.metric",
  "deml.alert": "threat.alert",
}
WORKFLOW_ID_TO_FORJD: Final[dict[str, str]] = {
  "deml_telemetry": FORJD_TELEMETRY_WORKFLOW_ID,
}
ALLOWED_METADATA_KEYS: Final[frozenset[str]] = frozenset(
  {
    "source",
    "channel",
    "region",
    "env",
    "environment",
    "product",
    "component",
    "namespace",
    "device_id",
    "series_id",
    "label",
    "labels",
    "tags",
  }
)
LIST_METADATA_KEYS: Final[frozenset[str]] = frozenset({"labels", "tags"})
ROUTING_TAG_PATTERN: Final[re.Pattern[str]] = re.compile(r"\A[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}\Z")


# --- Models ---
class StrictModel(BaseModel):
  model_config = ConfigDict(extra="forbid")


class EncryptionOptions(StrictModel):
  mode: Literal["e2ee"] = "e2ee"
  algo: Literal["aes-256-gcm"] = "aes-256-gcm"


class EncryptedEnvelope(StrictModel):
  algo: Literal["aes-256-gcm"] = "aes-256-gcm"
  key_id: str = Field(min_length=1, max_length=256)
  nonce: str = Field(min_length=8, max_length=64)
  ciphertext: str = Field(min_length=24, max_length=1_048_576)
  ciphertext_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
  ratchet_header: str | None = Field(default=None, max_length=8192)

  @model_validator(mode="after")
  def validate_wire_envelope(self) -> EncryptedEnvelope:
    try:
      nonce = base64.b64decode(self.nonce, validate=True)
      ciphertext = base64.b64decode(self.ciphertext, validate=True)
    except (binascii.Error, ValueError) as exc:
      raise ValueError("nonce and ciphertext must be valid base64") from exc
    if len(nonce) != 12:
      raise ValueError("nonce must decode to 12 bytes")
    if len(ciphertext) < 17:
      raise ValueError("ciphertext must include an AES-GCM tag and encrypted body")
    if hashlib.sha256(ciphertext).hexdigest() != self.ciphertext_sha256:
      raise ValueError("ciphertext_sha256 does not match ciphertext")
    return self


class SealedEvent(StrictModel):
  tenant_id: UUID
  client_event_id: str = Field(min_length=1, max_length=128)
  content_type: Literal["application/forjd-telemetry+v1"] = TELEMETRY_CONTENT_TYPE
  event_type: Literal["deml.metric", "deml.alert"] = "deml.metric"
  schema_version: int = Field(default=1, ge=1, le=1000)
  workflow_id: Literal["deml_telemetry"] = TELEMETRY_WORKFLOW_ID
  encryption: EncryptionOptions = Field(default_factory=EncryptionOptions)
  envelope: EncryptedEnvelope
  metadata: dict[str, Any] = Field(default_factory=dict)

  @field_validator("metadata")
  @classmethod
  def validate_routing_metadata(cls, metadata: dict[str, Any]) -> dict[str, Any]:
    if len(metadata) > 32 or len(str(metadata)) > 4096:
      raise ValueError("metadata exceeds the FORJD routing-tag limits")
    invalid_keys = sorted(
      str(key) for key in metadata if not isinstance(key, str) or key not in ALLOWED_METADATA_KEYS
    )
    if invalid_keys:
      raise ValueError(f"metadata contains non-routing keys: {', '.join(invalid_keys)}")
    for key, value in metadata.items():
      if key in LIST_METADATA_KEYS:
        if not isinstance(value, list) or not value or len(value) > 32:
          raise ValueError(f"metadata.{key} must be a non-empty list of routing tags")
        values: list[object] = value
      else:
        values = [value]
      if any(
        not isinstance(item, str) or ROUTING_TAG_PATTERN.fullmatch(item) is None for item in values
      ):
        raise ValueError(
          f"metadata.{key} contains a non-routing value; plaintext and identifiers are forbidden"
        )
    return metadata


class SealedEventBatch(StrictModel):
  events: list[SealedEvent] = Field(min_length=1, max_length=MAX_INGEST_BATCH_EVENTS)


# --- FORJD wire rewrite (product-local → canonical) ---
def sealed_event_for_forjd(event: SealedEvent) -> dict[str, Any]:
  """Map DEML wire ids onto universal FORJD threat_telemetry names."""
  payload = event.model_dump(mode="json")
  payload["workflow_id"] = WORKFLOW_ID_TO_FORJD.get(
    str(payload.get("workflow_id", "")),
    FORJD_TELEMETRY_WORKFLOW_ID,
  )
  event_type = str(payload.get("event_type", ""))
  payload["event_type"] = EVENT_TYPE_TO_FORJD.get(event_type, event_type)
  return payload


def sealed_batch_for_forjd(batch: SealedEventBatch) -> dict[str, Any]:
  return {"events": [sealed_event_for_forjd(event) for event in batch.events]}


def rewrite_forjd_workflow_query(query: str) -> str:
  """Rewrite product-local workflow_id query params to the canonical family."""
  if not query:
    return query
  pairs = []
  for key, value in parse_qsl(query, keep_blank_values=True):
    if key == "workflow_id":
      decoded = unquote_plus(value)
      value = WORKFLOW_ID_TO_FORJD.get(decoded, decoded)
    pairs.append((key, value))
  return urlencode(pairs)


def rewrite_forjd_workflow_body(payload: dict[str, Any]) -> dict[str, Any]:
  """Rewrite product-local workflow/event ids in JSON bodies."""
  workflow_id = payload.get("workflow_id")
  if isinstance(workflow_id, str):
    payload["workflow_id"] = WORKFLOW_ID_TO_FORJD.get(workflow_id, workflow_id)
  event_type = payload.get("event_type")
  if isinstance(event_type, str):
    payload["event_type"] = EVENT_TYPE_TO_FORJD.get(event_type, event_type)
  return payload
