"""Test/factory helpers that emit wire shapes matching deml_contracts models.

Import in pytest/Vitest fixtures — do not hand-roll SealedEvent/Consent dicts.
"""

from __future__ import annotations

import base64
import hashlib
from typing import Any, Literal
from uuid import uuid4

from deml_contracts.billing import BillingSyncOut, SubscriptionMutateOut
from deml_contracts.consent import ConsentIn, ConsentRecordOut, NewsletterIn, NewsletterSubscribeOut
from deml_contracts.ingest import (
  TELEMETRY_CONTENT_TYPE,
  TELEMETRY_WORKFLOW_ID,
  EncryptedEnvelope,
  EncryptionOptions,
  SealedEvent,
  SealedEventBatch,
)

# AES-GCM ciphertext must decode to ≥17 bytes (body + tag).
_DEFAULT_CIPHERTEXT = b"sealed-event-body-1"


def make_consent_in(*, analytical: bool = False, marketing: bool = False) -> ConsentIn:
  return ConsentIn(necessary=True, analytical=analytical, marketing=marketing)


def make_consent_record_out(
  *,
  status: Literal["success", "recorded"] = "success",
  record_id: str | None = None,
) -> ConsentRecordOut:
  return ConsentRecordOut(status=status, id=record_id or str(uuid4()))


def make_newsletter_in(
  *, email: str = "reader@example.com", consent_accepted: bool = True
) -> NewsletterIn:
  return NewsletterIn(email=email, consent_accepted=consent_accepted)


def make_newsletter_out(
  *,
  status: Literal["success", "subscribed"] = "subscribed",
  record_id: str | None = None,
) -> NewsletterSubscribeOut:
  return NewsletterSubscribeOut(status=status, id=record_id or str(uuid4()))


def make_sealed_event(
  tenant_id: str,
  *,
  index: int = 0,
  ciphertext: bytes = _DEFAULT_CIPHERTEXT,
  event_type: Literal["deml.metric", "deml.alert"] = "deml.metric",
) -> SealedEvent:
  encoded = base64.b64encode(ciphertext).decode()
  return SealedEvent(
    tenant_id=tenant_id,
    client_event_id=f"contract-event-{index}",
    content_type=TELEMETRY_CONTENT_TYPE,  # type: ignore[arg-type]
    event_type=event_type,
    schema_version=1,
    workflow_id=TELEMETRY_WORKFLOW_ID,  # type: ignore[arg-type]
    encryption=EncryptionOptions(mode="e2ee", algo="aes-256-gcm"),
    envelope=EncryptedEnvelope(
      algo="aes-256-gcm",
      key_id="contract-key-1",
      nonce=base64.b64encode(b"0123456789ab").decode(),
      ciphertext=encoded,
      ciphertext_sha256=hashlib.sha256(ciphertext).hexdigest(),
    ),
    metadata={"source": "deml-web", "channel": "telemetry"},
  )


def make_sealed_event_dict(
  tenant_id: str,
  *,
  index: int = 0,
  ciphertext: bytes = _DEFAULT_CIPHERTEXT,
) -> dict[str, Any]:
  return make_sealed_event(tenant_id, index=index, ciphertext=ciphertext).model_dump(
    mode="json",
    exclude_none=True,
  )


def make_sealed_batch_dict(
  tenant_id: str,
  *,
  count: int = 2,
  ciphertext: bytes = _DEFAULT_CIPHERTEXT,
) -> dict[str, Any]:
  events = [make_sealed_event(tenant_id, index=i, ciphertext=ciphertext) for i in range(count)]
  return SealedEventBatch(events=events).model_dump(mode="json", exclude_none=True)


def make_billing_sync_out(*, active: bool = False) -> BillingSyncOut:
  return BillingSyncOut(status="synced", active=active, cancel_at_period_end=False)


def make_subscription_mutate_out(
  *,
  status: Literal["cancelled", "resumed"] = "cancelled",
  cancel_at_period_end: bool = True,
) -> SubscriptionMutateOut:
  return SubscriptionMutateOut(status=status, cancel_at_period_end=cancel_at_period_end)
