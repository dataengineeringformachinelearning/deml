"""Firebase-authenticated handoff of sealed telemetry to FORJD.

Wire schemas and deml_* → threat_* rewrites live in ``deml_contracts`` (SoT).
"""

from __future__ import annotations

from typing import Any
from uuid import UUID

from asgiref.sync import sync_to_async
from deml_contracts import (
  EVENT_TYPE_TO_FORJD,
  FORJD_TELEMETRY_WORKFLOW_ID,
  TELEMETRY_CONTENT_TYPE,
  TELEMETRY_WORKFLOW_ID,
  WORKFLOW_ID_TO_FORJD,
  SealedEvent,
  SealedEventBatch,
  rewrite_forjd_workflow_body,
  rewrite_forjd_workflow_query,
  sealed_batch_for_forjd,
  sealed_event_for_forjd,
)
from ninja import Router
from ninja.errors import HttpError

from forjd.client import ForjdClient, ForjdError
from forjd.cutover import log_forjd_mode_event, writes_enabled
from forjd.policy import (
  ForjdPolicyError,
  actor_for_request,
  authorize_forjd_action,
  record_forjd_audit,
)
from forjd.shadow import record_shadow_batch, record_shadow_receipt_async
from forjd.tenancy import (
  ForjdTenantConfigurationError,
  ForjdTenantCredential,
  resolve_forjd_tenant_credential,
)

router = Router(tags=["FORJD"])

# --- Re-exports for existing forjd.* importers (canonical SoT is deml_contracts) ---
__all__ = [
  "EVENT_TYPE_TO_FORJD",
  "FORJD_TELEMETRY_WORKFLOW_ID",
  "TELEMETRY_CONTENT_TYPE",
  "TELEMETRY_WORKFLOW_ID",
  "WORKFLOW_ID_TO_FORJD",
  "SealedEvent",
  "SealedEventBatch",
  "request_id_from",
  "require_mapped_tenant",
  "resolve_request_credential",
  "rewrite_forjd_workflow_body",
  "rewrite_forjd_workflow_query",
  "router",
  "sealed_batch_for_forjd",
  "sealed_event_for_forjd",
]


def request_id_from(request: Any) -> str | None:
  value = str(getattr(request, "correlation_id", "")).strip()
  return value or None


async def resolve_request_credential(request: Any) -> ForjdTenantCredential:
  """Resolve the caller's DEML account to its tenant-scoped FORJD secret."""
  try:
    actor = await authorize_forjd_action(request, "ingest.write", resource_id=request.path)
  except ForjdPolicyError as exc:
    raise HttpError(exc.status, exc.detail) from exc

  try:
    return await sync_to_async(resolve_forjd_tenant_credential)(actor.account_id)
  except ForjdTenantConfigurationError:
    try:
      from forjd.client import ForjdError
      from forjd.provision import ForjdProvisionError, ensure_forjd_tenant_credential

      return await ensure_forjd_tenant_credential(actor.account_id)
    except (ForjdTenantConfigurationError, ForjdProvisionError, ForjdError) as exc:
      raise HttpError(503, "FORJD tenant service credential is unavailable") from exc


def require_mapped_tenant(payload_tenant_id: UUID, credential: ForjdTenantCredential) -> None:
  if payload_tenant_id != credential.tenant_id:
    raise HttpError(403, "Event tenant does not match the account's FORJD tenant")


@router.get("/health", auth=None)
async def health(request: Any) -> dict[str, Any]:
  try:
    return await ForjdClient(use_service_auth=False).health(request_id=request_id_from(request))
  except ForjdError as exc:
    raise HttpError(exc.status, str(exc)) from exc


@router.post("/ingest")
async def ingest(request: Any, payload: SealedEvent) -> dict[str, Any]:
  credential = await resolve_request_credential(request)
  actor = await actor_for_request(request)
  await record_forjd_audit(
    actor=actor,
    request=request,
    action="ingest.write",
    outcome="attempted",
    tenant_id=credential.tenant_id,
    resource_id=request.path,
  )
  if not writes_enabled():
    await record_forjd_audit(
      actor=actor,
      request=request,
      action="ingest.write",
      outcome="failed",
      tenant_id=credential.tenant_id,
      status=503,
      resource_id=request.path,
    )
    raise HttpError(503, "FORJD writes are disabled")
  try:
    require_mapped_tenant(payload.tenant_id, credential)
  except HttpError as exc:
    await record_forjd_audit(
      actor=actor,
      request=request,
      action="ingest.write",
      outcome="failed",
      tenant_id=credential.tenant_id,
      status=exc.status_code,
      resource_id=request.path,
    )
    raise
  wire = sealed_event_for_forjd(payload)
  request_id = request_id_from(request)
  account_id = await sync_to_async(
    lambda: getattr(getattr(request.user, "profile", None), "account_id", None)
  )()

  try:
    result = await ForjdClient(
      tenant_id=credential.tenant_id,
      service_token=credential.service_token,
    ).ingest(wire, request_id=request_id)
  except ForjdError as exc:
    await record_shadow_receipt_async(
      forjd_tenant_id=credential.tenant_id,
      payload=wire,
      forjd_status=exc.status,
      forjd_ok=False,
      request_id=request_id,
      deml_account_id=account_id,
    )
    await record_forjd_audit(
      actor=actor,
      request=request,
      action="ingest.write",
      outcome="failed",
      tenant_id=credential.tenant_id,
      status=exc.status,
      resource_id=request.path,
      upstream_request_id=exc.upstream_request_id,
    )
    raise HttpError(exc.status, str(exc)) from exc

  await record_shadow_receipt_async(
    forjd_tenant_id=credential.tenant_id,
    payload=wire,
    forjd_status=200,
    forjd_ok=True,
    request_id=request_id,
    deml_account_id=account_id,
  )
  log_forjd_mode_event(
    "ingest_ok", tenant_id=credential.tenant_id, workflow_id=wire.get("workflow_id")
  )
  await record_forjd_audit(
    actor=actor,
    request=request,
    action="ingest.write",
    outcome="succeeded",
    tenant_id=credential.tenant_id,
    status=200,
    resource_id=request.path,
  )
  return result


@router.post("/ingest/events:batch")
async def ingest_batch(request: Any, payload: SealedEventBatch) -> dict[str, Any]:
  credential = await resolve_request_credential(request)
  actor = await actor_for_request(request)
  await record_forjd_audit(
    actor=actor,
    request=request,
    action="ingest.write",
    outcome="attempted",
    tenant_id=credential.tenant_id,
    resource_id=request.path,
  )
  if not writes_enabled():
    await record_forjd_audit(
      actor=actor,
      request=request,
      action="ingest.write",
      outcome="failed",
      tenant_id=credential.tenant_id,
      status=503,
      resource_id=request.path,
    )
    raise HttpError(503, "FORJD writes are disabled")
  try:
    for event in payload.events:
      require_mapped_tenant(event.tenant_id, credential)
  except HttpError as exc:
    await record_forjd_audit(
      actor=actor,
      request=request,
      action="ingest.write",
      outcome="failed",
      tenant_id=credential.tenant_id,
      status=exc.status_code,
      resource_id=request.path,
    )
    raise
  wire = sealed_batch_for_forjd(payload)
  request_id = request_id_from(request)
  account_id = await sync_to_async(
    lambda: getattr(getattr(request.user, "profile", None), "account_id", None)
  )()

  try:
    result = await ForjdClient(
      tenant_id=credential.tenant_id,
      service_token=credential.service_token,
    ).request_json(
      "POST",
      "/api/v1/ingest/events:batch",
      payload=wire,
      request_id=request_id,
    )
  except ForjdError as exc:
    await sync_to_async(record_shadow_batch)(
      forjd_tenant_id=credential.tenant_id,
      events=list(wire.get("events") or []),
      forjd_status=exc.status,
      forjd_ok=False,
      request_id=request_id,
      deml_account_id=account_id,
    )
    await record_forjd_audit(
      actor=actor,
      request=request,
      action="ingest.write",
      outcome="failed",
      tenant_id=credential.tenant_id,
      status=exc.status,
      resource_id=request.path,
      upstream_request_id=exc.upstream_request_id,
    )
    raise HttpError(exc.status, str(exc)) from exc

  await sync_to_async(record_shadow_batch)(
    forjd_tenant_id=credential.tenant_id,
    events=list(wire.get("events") or []),
    forjd_status=200,
    forjd_ok=True,
    request_id=request_id,
    deml_account_id=account_id,
  )
  await record_forjd_audit(
    actor=actor,
    request=request,
    action="ingest.write",
    outcome="succeeded",
    tenant_id=credential.tenant_id,
    status=200,
    resource_id=request.path,
  )
  return result
