"""Explicit Django BFF adapters for FORJD's currently shipped native routes."""

from __future__ import annotations

import asyncio
import json
import logging
import re
from dataclasses import dataclass
from typing import Any, Final, Literal
from urllib.parse import quote
from uuid import UUID

logger = logging.getLogger(__name__)

from asgiref.sync import sync_to_async
from deml_contracts import ErrorCode
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pydantic import ValidationError

from config.csrf_header_auth import (
  authorization_header_required,
)
from forjd.angular_compat import (
  deml_status_incident,
  deml_status_incidents,
  deml_status_page,
  deml_status_pages,
  deml_status_service,
  deml_status_services,
  match_published_status_page,
  public_status_slug_candidates,
)
from forjd.api import (
  SealedEvent,
  SealedEventBatch,
  request_id_from,
  rewrite_forjd_workflow_body,
  rewrite_forjd_workflow_query,
  sealed_batch_for_forjd,
  sealed_event_for_forjd,
)
from forjd.body_limit import IngestBodyError, read_limited_ingest_body
from forjd.client import ForjdClient, ForjdError, ForjdResponse
from forjd.cutover import (
  contract_version_is_compatible,
  empty_read_envelope,
  empty_read_fallback_enabled,
  is_read_fallback_path,
  log_forjd_mode_event,
  reads_from_forjd,
  required_contract_version,
  shadow_writes_enabled,
  writes_enabled,
)
from forjd.limits import MAX_INGEST_BODY_BYTES
from forjd.policy import (
  ForjdActorContext,
  ForjdPolicyError,
  action_for_native_request,
  authorize_forjd_action,
  is_privileged_action,
  policy_error_response,
  record_forjd_audit,
  require_forjd_action,
)
from forjd.shadow import record_shadow_batch, record_shadow_receipt_async
from forjd.tenancy import (
  ForjdTenantConfigurationError,
  ForjdTenantCredential,
  resolve_forjd_tenant_credential,
)

TenantBinding = Literal[
  "none",
  "query",
  "body",
  "sealed",
  "sealed_batch",
  "method",
  "sealed_method",
]
SUPPORTED_METHODS: Final[frozenset[str]] = frozenset({"GET", "POST", "PUT", "PATCH", "DELETE"})


@dataclass(frozen=True, slots=True)
class AdapterError(RuntimeError):
  status: int
  detail: str


async def _credential_for_request(request: HttpRequest) -> ForjdTenantCredential:
  try:
    actor = await authorize_forjd_action(request, "read")
  except ForjdPolicyError as exc:
    raise AdapterError(exc.status, exc.detail) from exc

  try:
    return await sync_to_async(resolve_forjd_tenant_credential)(actor.account_id)
  except ForjdTenantConfigurationError:
    # Auto-provision a FORJD tenant for this DEML account (users never see FORJD).
    try:
      from forjd.client import ForjdError
      from forjd.provision import ForjdProvisionError, ensure_forjd_tenant_credential

      return await ensure_forjd_tenant_credential(actor.account_id)
    except (ForjdTenantConfigurationError, ForjdProvisionError, ForjdError) as exc:
      raise AdapterError(503, "FORJD tenant service credential is unavailable") from exc


async def _read_credential_or_none(request: HttpRequest) -> ForjdTenantCredential | None:
  """Resolve a read credential; only cutover modes may mask mapping outages."""
  try:
    return await _credential_for_request(request)
  except AdapterError as exc:
    if exc.status == 503 and empty_read_fallback_enabled():
      return None
    raise


def _client_for_credential(credential: ForjdTenantCredential) -> ForjdClient:
  """Product-account client — never the platform dogfood credential."""
  from forjd.clients import product_forjd_client

  return product_forjd_client(credential)


# Platform / tenant0 status page — public directory only, never account "My Sites".
from forjd.isolation import is_platform_status_page, is_platform_status_slug

# --- Status page write boundary ---
_STATUS_SLUG_RE: Final[re.Pattern[str]] = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def _validate_status_page_write(payload: dict[str, Any]) -> JsonResponse | None:
  """Schema/business checks before proxying status page create/update."""
  title = str(payload.get("title") or "").strip()
  slug = str(payload.get("slug") or "").strip().lower()
  if not title:
    return JsonResponse({"detail": "title is required", "code": "validation_error"}, status=400)
  if not slug:
    return JsonResponse({"detail": "slug is required", "code": "validation_error"}, status=400)
  if not _STATUS_SLUG_RE.fullmatch(slug):
    return JsonResponse(
      {
        "detail": "slug must be lowercase letters, numbers, and hyphens",
        "code": "validation_error",
      },
      status=400,
    )
  if is_platform_status_slug(slug):
    return JsonResponse(
      {"detail": "Platform status slug is reserved", "code": "platform_status_immutable"},
      status=403,
    )
  return None


def _request_has_end_user_auth(request: HttpRequest) -> bool:
  """True when Firebase/API-key identity terminated on this request."""
  has_token = bool(
    getattr(request, "firebase_token", None) or getattr(request, "deml_api_key", None)
  )
  return bool(
    has_token
    and getattr(request.user, "is_authenticated", False)
    and getattr(request.user, "is_active", False)
  )


def _owned_status_pages(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
  """Account-scoped list: never include DEML platform / tenant0 status."""
  return [page for page in pages if not is_platform_status_page(page)]


async def _require_owned_status_page(
  client: ForjdClient,
  *,
  page_id: str,
  tenant_id: object,
  request_id: str | None,
) -> dict[str, Any] | JsonResponse:
  """Re-validate client-supplied page_id against the product tenant list.

  Fail closed: unknown IDs → 404 (not proxied); platform-status → 403;
  list unavailable → 503. Never trust the client ID alone.
  """
  existing = await client.proxy(
    "GET",
    "/api/v1/status/pages",
    body=None,
    query_string=f"tenant_id={tenant_id}",
    content_type="application/json",
    request_id=request_id,
  )
  if existing.status >= 400:
    logger.warning(
      "forjd_owned_page_preflight_failed page_id=%s status=%s",
      page_id,
      existing.status,
    )
    return _upstream_error_response(existing)
  try:
    listed = json.loads(existing.body)
    pages = listed.get("pages") if isinstance(listed, dict) else None
    if not isinstance(pages, list):
      raise TypeError("pages envelope missing")
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError) as exc:
    logger.warning(
      "forjd_owned_page_preflight_malformed page_id=%s error=%s",
      page_id,
      type(exc).__name__,
    )
    return _adapter_error_response(
      AdapterError(503, "Unable to verify status page ownership")
    )

  match: dict[str, Any] | None = None
  for page in pages:
    if isinstance(page, dict) and str(page.get("id") or "") == str(page_id):
      match = page
      break
  if match is None:
    return JsonResponse(
      {
        "detail": "Status page not found in this account",
        "code": "status_page_not_owned",
      },
      status=404,
    )
  if is_platform_status_page(match):
    return JsonResponse(
      {
        "detail": "Platform status page is immutable",
        "code": "platform_status_immutable",
      },
      status=403,
    )
  return match


async def _status_directory_read_client(
  request: HttpRequest,
) -> tuple[ForjdClient | None, int | None, bool]:
  """Resolve a FORJD client for status directory GETs.

  Authenticated product users use their mapped tenant credential.
  Anonymous explore uses an **unauthenticated** public client (published
  directory only) — never the platform credential + foreign page_id.
  """
  from forjd.clients import public_forjd_client

  if _request_has_end_user_auth(request):
    deml_user_id = await sync_to_async(lambda: getattr(request.user, "id", None))()
    if not reads_from_forjd():
      return None, deml_user_id, False
    # Owned-list path must never mask credential/provision 503 as empty [].
    # Raise AdapterError → caller returns forjd_degraded (not “no sites”).
    credential = await _credential_for_request(request)
    return _client_for_credential(credential), deml_user_id, False

  if not reads_from_forjd():
    return None, None, True
  try:
    return public_forjd_client(), None, True
  except ForjdError:
    return None, None, True


def _published_directory_pages(pages: list[dict[str, Any]]) -> list[dict[str, Any]]:
  return [page for page in pages if page.get("is_published") or is_platform_status_page(page)]


async def _fetch_published_directory(
  *,
  request_id: str | None,
) -> list[dict[str, Any]]:
  """Cross-tenant published status directory (each page keeps its own tenant KPIs)."""
  from forjd.clients import public_forjd_client

  client = public_forjd_client()
  response = await client.proxy(
    "GET",
    "/api/v1/status/pages/published",
    body=None,
    query_string="",
    content_type="application/json",
    request_id=request_id,
  )
  if response.status >= 400:
    raise AdapterError(response.status, "FORJD published status directory unavailable")
  upstream = json.loads(response.body)
  if not isinstance(upstream, dict):
    raise AdapterError(502, "FORJD returned an invalid published status directory")
  try:
    return deml_status_pages(upstream, deml_user_id=None, require_pages_key=True)
  except ValueError as exc:
    raise AdapterError(502, "FORJD returned an invalid published status directory") from exc


async def _ensure_published_status_page(
  client: ForjdClient,
  page_id: str,
  *,
  request_id: str | None,
) -> HttpResponse | None:
  """For anonymous directory reads, refuse unpublished page detail proxies."""
  try:
    pages = _published_directory_pages(await _fetch_published_directory(request_id=request_id))
  except AdapterError as exc:
    # Never mask dependency failure as 404 (would look like "unpublished").
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return _adapter_error_response(
      AdapterError(502, "FORJD returned an invalid published status directory")
    )
  if not any(str(page.get("id") or "") == str(page_id) for page in pages):
    return JsonResponse({"detail": "Not found"}, status=404)
  return None


def _require_payload_tenant(payload_tenant_id: UUID, tenant_id: UUID) -> None:
  if payload_tenant_id != tenant_id:
    raise AdapterError(403, "Request tenant does not match the account's FORJD tenant")


def _bind_query(request: HttpRequest, tenant_id: UUID) -> str:
  query = request.GET.copy()
  supplied_tenants = query.getlist("tenant_id")
  if supplied_tenants and any(value != str(tenant_id) for value in supplied_tenants):
    raise AdapterError(403, "Request tenant does not match the account's FORJD tenant")
  query.setlist("tenant_id", [str(tenant_id)])
  return rewrite_forjd_workflow_query(query.urlencode())


def _json_object(request: HttpRequest) -> dict[str, object]:
  try:
    payload = json.loads(request.body or b"{}")
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError) as exc:
    raise AdapterError(400, "Request body must be a JSON object") from exc
  if not isinstance(payload, dict):
    raise AdapterError(400, "Request body must be a JSON object")
  return payload


# Shared gate for CSRF-exempt SOAR controls (see config.csrf_header_auth).
_authorization_header_required = authorization_header_required


def _uuid_path(value: str, field_name: str) -> str:
  try:
    return str(UUID(value))
  except (AttributeError, TypeError, ValueError) as exc:
    raise AdapterError(400, f"{field_name} must be a valid UUID") from exc


def _bind_body(request: HttpRequest, tenant_id: UUID) -> bytes:
  payload = _json_object(request)
  supplied_tenant = payload.get("tenant_id")
  if supplied_tenant is not None and str(supplied_tenant) != str(tenant_id):
    raise AdapterError(403, "Request tenant does not match the account's FORJD tenant")
  payload["tenant_id"] = str(tenant_id)
  rewrite_forjd_workflow_body(payload)
  return json.dumps(payload, separators=(",", ":")).encode()


def _validate_sealed_body(request: HttpRequest, tenant_id: UUID) -> bytes:
  try:
    payload = SealedEvent.model_validate_json(_read_limited_ingest_body(request))
  except ValidationError as exc:
    raise AdapterError(422, "Invalid sealed FORJD telemetry event") from exc
  _require_payload_tenant(payload.tenant_id, tenant_id)
  return json.dumps(sealed_event_for_forjd(payload), separators=(",", ":")).encode()


def _validate_sealed_batch_body(request: HttpRequest, tenant_id: UUID) -> bytes:
  try:
    payload = SealedEventBatch.model_validate_json(_read_limited_ingest_body(request))
  except ValidationError as exc:
    raise AdapterError(422, "Invalid sealed FORJD telemetry batch") from exc
  for event in payload.events:
    _require_payload_tenant(event.tenant_id, tenant_id)
  return json.dumps(sealed_batch_for_forjd(payload), separators=(",", ":")).encode()


def _read_limited_ingest_body(request: HttpRequest) -> bytes:
  """Read canonical ingest JSON with FORJD's 8 MiB cap.

  Django's lower global body limit remains unchanged for every other route.
  Canonical sealed-ingest adapters use this bounded stream reader so the BFF
  accepts the complete FORJD contract without globally relaxing upload safety.
  """
  try:
    return read_limited_ingest_body(request)
  except IngestBodyError as exc:
    raise AdapterError(exc.status, exc.detail) from exc


def _bound_request(
  request: HttpRequest,
  tenant_id: UUID,
  binding: TenantBinding,
) -> tuple[bytes | None, str]:
  resolved_binding = binding
  if binding == "method":
    resolved_binding = "query" if request.method == "GET" else "body"
  elif binding == "sealed_method":
    resolved_binding = "query" if request.method == "GET" else "sealed"

  if resolved_binding == "query":
    return request.body or None, _bind_query(request, tenant_id)
  if resolved_binding == "body":
    # Rewrite any workflow_id on the query string as well as the JSON body.
    query = rewrite_forjd_workflow_query(request.META.get("QUERY_STRING", ""))
    return _bind_body(request, tenant_id), query
  if resolved_binding == "sealed":
    return _validate_sealed_body(request, tenant_id), ""
  if resolved_binding == "sealed_batch":
    return _validate_sealed_batch_body(request, tenant_id), ""
  return request.body or None, rewrite_forjd_workflow_query(request.META.get("QUERY_STRING", ""))


def _is_write_path(method: str, target_path: str) -> bool:
  del target_path
  return method.upper() in {"POST", "PUT", "PATCH", "DELETE"}


def _adapter_error_response(exc: AdapterError) -> JsonResponse:
  if exc.status >= 500:
    return JsonResponse(
      {
        "detail": exc.detail,
        "code": ErrorCode.FORJD_DEGRADED.value,
        "source": "forjd",
      },
      status=503,
    )
  if exc.status == 413:
    response = JsonResponse(
      {
        "detail": exc.detail,
        "code": "ingest_body_too_large",
        "limit_bytes": MAX_INGEST_BODY_BYTES,
      },
      status=413,
    )
    response["X-Max-Body-Bytes"] = str(MAX_INGEST_BODY_BYTES)
    return response
  return JsonResponse({"detail": exc.detail}, status=exc.status)


def _forjd_error_response(exc: ForjdError) -> JsonResponse:
  if exc.status >= 500:
    logger.warning(
      "FORJD adapter 5xx status=%s request_id=%s",
      exc.status,
      exc.upstream_request_id or "-",
    )
    result = JsonResponse(
      {
        "detail": "FORJD is temporarily unavailable",
        "code": ErrorCode.FORJD_DEGRADED.value,
        "source": "forjd",
      },
      status=503,
    )
  else:
    result = JsonResponse(
      {"detail": str(exc), "code": "forjd_request_rejected", "source": "forjd"},
      status=exc.status,
    )
  if exc.upstream_request_id:
    result["X-FORJD-Request-ID"] = exc.upstream_request_id
  return result


def _upstream_error_response(response: ForjdResponse) -> JsonResponse:
  if response.status >= 500:
    upstream_id = ""
    if isinstance(getattr(response, "headers", None), dict):
      upstream_id = str(response.headers.get("X-Request-ID") or "")
    logger.warning(
      "FORJD upstream 5xx status=%s request_id=%s",
      response.status,
      upstream_id or "-",
    )
    result = JsonResponse(
      {
        "detail": "FORJD is temporarily unavailable",
        "code": ErrorCode.FORJD_DEGRADED.value,
        "source": "forjd",
      },
      status=503,
    )
  else:
    try:
      payload = json.loads(response.body or b"{}")
    except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
      payload = {}
    detail = payload.get("detail") if isinstance(payload, dict) else None
    result = JsonResponse(
      {
        "detail": str(detail or "FORJD rejected the request"),
        "code": "forjd_request_rejected",
        "source": "forjd",
      },
      status=response.status,
    )
  _copy_safe_upstream_headers(response, result)
  return result


def _copy_safe_upstream_headers(response: ForjdResponse, target: HttpResponse) -> None:
  for name, value in response.headers.items():
    target["X-FORJD-Request-ID" if name.lower() == "x-request-id" else name] = value


async def _maybe_shadow_sealed(
  *,
  request: HttpRequest,
  credential: ForjdTenantCredential,
  tenant_binding: TenantBinding,
  body: bytes | None,
  response: ForjdResponse | None,
  error_status: int | None,
) -> None:
  if not shadow_writes_enabled() or tenant_binding not in {"sealed", "sealed_batch"}:
    return
  if not body:
    return
  try:
    payload = json.loads(body)
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return
  account_id = await sync_to_async(
    lambda: getattr(getattr(request.user, "profile", None), "account_id", None)
  )()
  status = response.status if response is not None else error_status
  ok = bool(response is not None and response.status < 400)
  if tenant_binding == "sealed_batch" and isinstance(payload.get("events"), list):
    await sync_to_async(record_shadow_batch)(
      forjd_tenant_id=credential.tenant_id,
      events=payload["events"],
      forjd_status=status,
      forjd_ok=ok,
      request_id=request_id_from(request),
      deml_account_id=account_id,
    )
    return
  if isinstance(payload, dict):
    await record_shadow_receipt_async(
      forjd_tenant_id=credential.tenant_id,
      payload=payload,
      forjd_status=status,
      forjd_ok=ok,
      request_id=request_id_from(request),
      deml_account_id=account_id,
    )


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
async def native_forjd_proxy(
  request: HttpRequest,
  *,
  target_path: str,
  allowed_methods: tuple[str, ...],
  tenant_binding: TenantBinding = "none",
  public: bool = False,
) -> HttpResponse:
  """Call one allowlisted FORJD path with a service token, never Firebase auth."""
  if request.method not in allowed_methods or request.method not in SUPPORTED_METHODS:
    return JsonResponse({"detail": "Method not allowed"}, status=405)

  is_get = request.method == "GET"
  is_write = _is_write_path(request.method, target_path)
  action = action_for_native_request(request.method, target_path)

  credential: ForjdTenantCredential | None = None
  actor: ForjdActorContext | None = None
  body: bytes | None = None
  query_string = ""
  privileged = False

  try:
    if public:
      from forjd.clients import public_forjd_client

      client = public_forjd_client()
      body = request.body or None
      query_string = request.META.get("QUERY_STRING", "")
    else:
      actor = await authorize_forjd_action(request, action, resource_id=target_path)
      privileged = is_privileged_action(action)
      if privileged:
        await record_forjd_audit(
          actor=actor,
          request=request,
          action=action,
          outcome="attempted",
          resource_id=target_path,
        )
      if is_write and not writes_enabled():
        result = JsonResponse(
          {
            "detail": "FORJD writes are disabled",
            "code": ErrorCode.FORJD_WRITES_DISABLED.value,
          },
          status=503,
        )
        if privileged:
          await record_forjd_audit(
            actor=actor,
            request=request,
            action=action,
            outcome="failed",
            status=503,
            resource_id=target_path,
          )
        return result
      # In explicit read=off cutover mode, authentication and RBAC still run,
      # but tenant mapping is not a dependency for declared fallback routes.
      if is_get and is_read_fallback_path(target_path) and not reads_from_forjd():
        log_forjd_mode_event("read_skipped", path=target_path, mode="off")
        return JsonResponse(empty_read_envelope(target_path), status=200)
      credential = await _credential_for_request(request)
      client = _client_for_credential(credential)
      body, query_string = _bound_request(request, credential.tenant_id, tenant_binding)

    response = await client.proxy(
      request.method,
      target_path,
      body=body,
      query_string=query_string,
      content_type=request.content_type or "application/json",
      request_id=request_id_from(request),
    )
    request._forjd_upstream_request_id = response.headers.get("X-Request-ID", "")
    if credential is not None:
      await _maybe_shadow_sealed(
        request=request,
        credential=credential,
        tenant_binding=tenant_binding,
        body=body,
        response=response,
        error_status=None,
      )
    result = HttpResponse(
      response.body,
      status=response.status,
      content_type=response.content_type,
    )
    _copy_safe_upstream_headers(response, result)
    if privileged and actor is not None:
      await record_forjd_audit(
        actor=actor,
        request=request,
        action=action,
        outcome="succeeded" if response.status < 400 else "failed",
        tenant_id=credential.tenant_id if credential is not None else None,
        status=response.status,
        resource_id=target_path,
        upstream_request_id=response.headers.get("X-Request-ID"),
      )
    if response.status >= 400:
      if (
        is_get
        and response.status >= 500
        and empty_read_fallback_enabled()
        and is_read_fallback_path(target_path)
      ):
        log_forjd_mode_event("read_fallback", path=target_path, status=response.status)
        return JsonResponse(empty_read_envelope(target_path), status=200)
      return _upstream_error_response(response)
    return result
  except ForjdPolicyError as exc:
    return policy_error_response(exc)
  except AdapterError as exc:
    if privileged and actor is not None:
      await record_forjd_audit(
        actor=actor,
        request=request,
        action=action,
        outcome="failed",
        tenant_id=credential.tenant_id if credential is not None else None,
        status=exc.status,
        resource_id=target_path,
      )
    return _adapter_error_response(exc)
  except ForjdError as exc:
    if credential is not None:
      await _maybe_shadow_sealed(
        request=request,
        credential=credential,
        tenant_binding=tenant_binding,
        body=body,
        response=None,
        error_status=exc.status,
      )
    # Dual-read: keep Angular list pages alive when FORJD is down.
    if (
      is_get
      and empty_read_fallback_enabled()
      and is_read_fallback_path(target_path)
      and exc.status >= 500
    ):
      log_forjd_mode_event("read_fallback", path=target_path, status=exc.status)
      return JsonResponse(empty_read_envelope(target_path), status=200)
    if privileged and actor is not None:
      await record_forjd_audit(
        actor=actor,
        request=request,
        action=action,
        outcome="failed",
        tenant_id=credential.tenant_id if credential is not None else None,
        status=exc.status,
        resource_id=target_path,
        upstream_request_id=exc.upstream_request_id,
      )
    return _forjd_error_response(exc)


def _reshape_public_status_page(page: dict[str, Any], *, status_code: int = 200) -> JsonResponse:
  """Angular-stable public slug payload (ciphertext-free; no tenant_id)."""
  # Anonymous visitors cannot hit the authed services/incidents adapters, so
  # reshape the embedded FORJD arrays into the Angular contracts inline.
  # Never echo FORJD tenant_id on the public Angular surface (enumeration risk).
  # Service-auth slug responses may include tenant_id for BFF widget routing only.
  page = dict(page)
  page.pop("tenant_id", None)
  page_id = str(page.get("id") or "")
  services = deml_status_services(page)
  incidents = deml_status_incidents(page)
  for row in (*services, *incidents):
    row["status_page_id"] = row["status_page_id"] or page_id
  page["services"] = services
  page["incidents"] = incidents
  # Normalize KPI / history / intelligence fields Angular binds on IsolatedStatus.
  compat = deml_status_page(page, deml_user_id=None)
  # Explicit SoT fields — never rely on leftover FORJD keys after reshape.
  page["overall_status"] = compat["overall_status"]
  page["overall_uptime"] = compat["overall_uptime"]
  page["cumulative_sla"] = compat["cumulative_sla"]
  page["uptime_history"] = compat["uptime_history"]
  page["p99_latency"] = compat["p99_latency"]
  page["total_requests"] = compat["total_requests"]
  page["threats_detected_24h"] = compat["threats_detected_24h"]
  page["predicted_sla"] = compat.get("predicted_sla")
  page["spiking_temporal_forecast"] = compat["spiking_temporal_forecast"]
  page["temporal_status"] = compat["temporal_status"]
  page["temporal_backend"] = compat["temporal_backend"]
  page["temporal_sample_count"] = compat["temporal_sample_count"]
  page["temporal_scored_at"] = compat["temporal_scored_at"]
  page["threat_anomaly_score"] = compat["threat_anomaly_score"]
  page["threat_suspicious_ratio"] = compat["threat_suspicious_ratio"]
  page["uses_norse"] = compat["uses_norse"]
  return JsonResponse(page, status=status_code)


async def native_status_page_proxy(request: HttpRequest, slug: str) -> HttpResponse:
  # Try exact + slugified + domain-stem candidates so legacy embeds
  # (``joealongi`` / ``joealongi.dev``) resolve to ``joealongi-dev``.
  candidates = public_status_slug_candidates(slug) or [slug.strip().lower()]
  last_error: HttpResponse | None = None
  for candidate in candidates:
    response = await native_forjd_proxy(
      request,
      target_path=f"/api/v1/status/pages/slug/{quote(candidate, safe='')}",
      allowed_methods=("GET",),
      public=True,
    )
    if response.status_code < 400:
      try:
        upstream = json.loads(response.content)
        page = upstream["page"]
      except (KeyError, TypeError, UnicodeDecodeError, json.JSONDecodeError):
        return _adapter_error_response(
          AdapterError(502, "FORJD returned an invalid public status-page response")
        )
      if not isinstance(page, dict):
        return _adapter_error_response(
          AdapterError(502, "FORJD returned an invalid public status-page response")
        )
      return _reshape_public_status_page(page, status_code=response.status_code)
    last_error = response

  # Directory unique-prefix self-heal when FORJD exact slug still 404s
  # (pre-deploy FORJD or stem-only embeds like data-page-id="joealongi").
  if last_error is not None and last_error.status_code == 404:
    try:
      pages = _published_directory_pages(
        await _fetch_published_directory(request_id=request_id_from(request))
      )
      matched = match_published_status_page(pages, identifier=slug)
      canonical = str((matched or {}).get("slug") or "")
      if canonical and canonical not in candidates:
        response = await native_forjd_proxy(
          request,
          target_path=f"/api/v1/status/pages/slug/{quote(canonical, safe='')}",
          allowed_methods=("GET",),
          public=True,
        )
        if response.status_code < 400:
          try:
            page_body = json.loads(response.content)
            page = page_body["page"]
          except (KeyError, TypeError, UnicodeDecodeError, json.JSONDecodeError):
            return _adapter_error_response(
              AdapterError(502, "FORJD returned an invalid public status-page response")
            )
          if isinstance(page, dict):
            return _reshape_public_status_page(page, status_code=response.status_code)
    except (TypeError, UnicodeDecodeError, json.JSONDecodeError, AdapterError, ForjdError) as exc:
      logger.warning(
        "forjd_status_slug_self_heal_failed slug=%s error=%s",
        slug,
        type(exc).__name__,
      )
      return _adapter_error_response(
        AdapterError(503, "Status directory unavailable while resolving slug")
      )

  return last_error or _adapter_error_response(AdapterError(404, "status page not found"))


async def forjd_capabilities_proxy(request: HttpRequest) -> HttpResponse:
  """Public compatibility *and runtime readiness* probe for the headless contract."""
  if request.method != "GET":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    from forjd.clients import public_forjd_client

    client = public_forjd_client()
    request_id = request_id_from(request)
    response, readiness = await asyncio.gather(
      client.proxy("GET", "/api/v1/capabilities", request_id=request_id),
      client.proxy("GET", "/ready", request_id=request_id),
    )
  except ForjdError as exc:
    return _forjd_error_response(exc)
  if response.status >= 400:
    return _upstream_error_response(response)
  try:
    upstream = json.loads(response.body or b"{}")
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return _adapter_error_response(AdapterError(502, "FORJD returned invalid capabilities"))
  if not isinstance(upstream, dict):
    return _adapter_error_response(AdapterError(502, "FORJD returned invalid capabilities"))

  contract_version = str(upstream.get("contract_version") or "")
  compatible = contract_version_is_compatible(contract_version)
  try:
    ready_body = json.loads(readiness.body or b"{}")
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    ready_body = {}
  runtime_ready = (
    readiness.status < 400
    and isinstance(ready_body, dict)
    and str(ready_body.get("status") or "").lower() == "ready"
  )
  probe_ready = compatible and runtime_ready
  result = JsonResponse(
    {
      "status": "ready" if probe_ready else ("incompatible" if not compatible else "degraded"),
      "source": "forjd",
      "contract_version": contract_version,
      "required_contract_version": required_contract_version(),
      "service": upstream.get("service"),
      "service_version": upstream.get("service_version"),
      "authentication": upstream.get("authentication", {}),
      "capabilities": upstream.get("capabilities", {}),
      "limits": upstream.get("limits", {}),
      "reliability": upstream.get("reliability", {}),
      "runtime": {
        "status": str(ready_body.get("status") or "unavailable")
        if isinstance(ready_body, dict)
        else "unavailable",
        "checks": ready_body.get("checks", {}) if isinstance(ready_body, dict) else {},
      },
    },
    status=200 if probe_ready else 503,
  )
  _copy_safe_upstream_headers(response, result)
  if "X-FORJD-Request-ID" not in result:
    _copy_safe_upstream_headers(readiness, result)
  return result


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
@require_forjd_action({"GET": "public", "POST": "status.admin"})
async def status_pages_list_proxy(request: HttpRequest) -> HttpResponse:
  """GET list / POST create — Angular ``/api/v1/system-status/status_pages``.

  GET is public for the explore directory (platform credential, published-only).
  """
  if request.method == "GET":
    try:
      client, deml_user_id, published_only = await _status_directory_read_client(request)
      # Anonymous explore: cross-tenant published directory so platform-status
      # (DEML/tenant0) and customer pages (e.g. joealongi.dev) stay distinct.
      # Authenticated Settings: tenant-scoped only — never fall back to the
      # public directory (fail closed) and never include platform-status.
      if _request_has_end_user_auth(request) and not published_only:
        # Settings owned-list must stay honest: never mask FORJD outages as [].
        if client is None:
          # Authed owned-list: None only means reads disabled (credential
          # failures raise above). Never return [] for an outage.
          return JsonResponse(
            {
              "detail": "FORJD reads are disabled",
              "code": ErrorCode.FORJD_READS_DISABLED.value,
            },
            status=503,
          )
        try:
          query_string = f"tenant_id={client.tenant_id}"
          response = await client.proxy(
            "GET",
            "/api/v1/status/pages",
            body=None,
            query_string=query_string,
            content_type="application/json",
            request_id=request_id_from(request),
          )
          if response.status >= 400:
            logger.warning(
              "forjd_owned_status_pages_failed status=%s request_id=%s",
              response.status,
              request_id_from(request),
            )
            return _upstream_error_response(response)
          upstream = json.loads(response.body)
          if not isinstance(upstream, dict):
            raise AdapterError(502, "FORJD returned an invalid status pages list")
          try:
            pages = _owned_status_pages(
              deml_status_pages(upstream, deml_user_id=deml_user_id, require_pages_key=True)
            )
          except ValueError as exc:
            raise AdapterError(502, "FORJD returned an invalid status pages list") from exc
          return JsonResponse(pages, status=200, safe=False)
        except AdapterError as exc:
          return _adapter_error_response(exc)
        except ForjdError as exc:
          logger.warning(
            "forjd_owned_status_pages_error status=%s request_id=%s",
            exc.status,
            request_id_from(request),
          )
          return _forjd_error_response(exc)
        except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
          return _adapter_error_response(
            AdapterError(502, "FORJD returned an invalid status pages list")
          )

      if published_only or client is None:
        try:
          pages = _published_directory_pages(
            await _fetch_published_directory(request_id=request_id_from(request))
          )
        except AdapterError as exc:
          # Never invent an empty directory — Explore would show "Nothing published".
          return _adapter_error_response(exc)
        except ForjdError as exc:
          return _forjd_error_response(exc)
        return JsonResponse(pages, status=200, safe=False)

      return JsonResponse([], status=200, safe=False)
    except AdapterError as exc:
      return _adapter_error_response(exc)
    except ForjdError as exc:
      # Outer catch is for owned-list transport errors already handled above;
      # public directory errors are handled in the inner try.
      return _forjd_error_response(exc)
    except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
      return _adapter_error_response(
        AdapterError(502, "FORJD returned an invalid status pages list")
      )

  if request.method != "POST":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    if not writes_enabled():
      return JsonResponse(
        {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
        status=503,
      )
    credential = await _credential_for_request(request)
    deml_user_id = await sync_to_async(lambda: getattr(request.user, "id", None))()
    payload = _json_object(request)
    denied = _validate_status_page_write(payload)
    if denied is not None:
      return denied
    slug = str(payload.get("slug") or "").strip().lower()
    title = str(payload.get("title") or "").strip()
    body = json.dumps(
      {
        "tenant_id": str(credential.tenant_id),
        "slug": slug,
        "title": title,
        "description": str(payload.get("description") or "").strip(),
        "is_published": bool(payload.get("is_published")),
      }
    ).encode()
    client = _client_for_credential(credential)
    # Prefer client Idempotency-Key for correlation; writes are never auto-replayed.
    create_request_id = (
      str(request.META.get("HTTP_IDEMPOTENCY_KEY") or "").strip() or request_id_from(request)
    )
    response = await client.proxy(
      "POST",
      "/api/v1/status/pages",
      body=body,
      content_type="application/json",
      request_id=create_request_id,
    )
    if response.status >= 400:
      logger.warning(
        "forjd_status_page_create_failed status=%s slug=%s request_id=%s",
        response.status,
        slug,
        create_request_id,
      )
      return _upstream_error_response(response)
    upstream = json.loads(response.body)
    page = upstream.get("page") if isinstance(upstream, dict) else None
    if not isinstance(page, dict):
      raise AdapterError(502, "FORJD returned an invalid status page")
    logger.info(
      "forjd_status_page_created slug=%s request_id=%s",
      slug,
      create_request_id,
    )
    return JsonResponse(deml_status_page(page, deml_user_id=deml_user_id), status=200)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return _adapter_error_response(AdapterError(502, "FORJD returned an invalid status page"))


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
@require_forjd_action("status.admin")
async def status_page_detail_proxy(request: HttpRequest, page_id: str) -> HttpResponse:
  """PUT update / DELETE — Angular ``/status_pages/{id}``."""
  if request.method not in {"PUT", "PATCH", "DELETE"}:
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    if not writes_enabled():
      return JsonResponse(
        {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
        status=503,
      )
    credential = await _credential_for_request(request)
    deml_user_id = await sync_to_async(lambda: getattr(request.user, "id", None))()
    client = _client_for_credential(credential)
    # --- Never trust client page_id — must belong to this product tenant ---
    owned = await _require_owned_status_page(
      client,
      page_id=page_id,
      tenant_id=credential.tenant_id,
      request_id=request_id_from(request),
    )
    if isinstance(owned, JsonResponse):
      return owned

    if request.method == "DELETE":
      response = await client.proxy(
        "DELETE",
        f"/api/v1/status/pages/{quote(page_id, safe='')}",
        query_string=f"tenant_id={credential.tenant_id}",
        request_id=request_id_from(request),
      )
      if response.status >= 400:
        return _upstream_error_response(response)
      return JsonResponse({"ok": True}, status=200)

    payload = _json_object(request)
    denied = _validate_status_page_write(payload)
    if denied is not None:
      return denied
    slug = str(payload.get("slug") or "").strip().lower()
    title = str(payload.get("title") or "").strip()
    body = json.dumps(
      {
        "tenant_id": str(credential.tenant_id),
        "slug": slug,
        "title": title,
        "description": str(payload.get("description") or "").strip(),
        "is_published": bool(payload.get("is_published")),
      }
    ).encode()
    response = await client.proxy(
      "PATCH",
      f"/api/v1/status/pages/{quote(page_id, safe='')}",
      body=body,
      content_type="application/json",
      request_id=request_id_from(request),
    )
    if response.status >= 400:
      return _upstream_error_response(response)
    upstream = json.loads(response.body)
    page = upstream.get("page") if isinstance(upstream, dict) else None
    if not isinstance(page, dict):
      raise AdapterError(502, "FORJD returned an invalid status page")
    return JsonResponse(deml_status_page(page, deml_user_id=deml_user_id), status=200)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return _adapter_error_response(AdapterError(502, "FORJD returned an invalid status page"))


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
@require_forjd_action({"GET": "public", "POST": "status.admin"})
async def status_page_services_proxy(request: HttpRequest, page_id: str) -> HttpResponse:
  """GET list / POST create — ``/status_pages/{id}/services``."""
  try:
    if request.method == "GET":
      client, _deml_user_id, published_only = await _status_directory_read_client(request)
      if published_only:
        # Public clients must use the embedded slug payload. Never call FORJD
        # with the platform tenant_id + a foreign page_id (cross-tenant pattern).
        if client is None:
          return JsonResponse(
            {"detail": "Status directory unavailable", "code": ErrorCode.FORJD_DEGRADED.value},
            status=503,
          )
        denied = await _ensure_published_status_page(
          client, page_id, request_id=request_id_from(request)
        )
        if denied is not None:
          return denied
        return JsonResponse([], status=200, safe=False)
      if client is None:
        # Authed enrichment without a tenant credential must not invent [].
        return JsonResponse(
          {
            "detail": "FORJD tenant credential unavailable",
            "code": ErrorCode.FORJD_READS_DISABLED.value,
          },
          status=503,
        )
      owned = await _require_owned_status_page(
        client,
        page_id=page_id,
        tenant_id=client.tenant_id,
        request_id=request_id_from(request),
      )
      if isinstance(owned, JsonResponse):
        return owned
      response = await client.proxy(
        "GET",
        f"/api/v1/status/pages/{quote(page_id, safe='')}/services",
        query_string=f"tenant_id={client.tenant_id}",
        request_id=request_id_from(request),
      )
      if response.status >= 400:
        logger.warning(
          "forjd_status_services_failed status=%s page_id=%s published_only=%s",
          response.status,
          page_id,
          published_only,
        )
        return _upstream_error_response(response)
      upstream = json.loads(response.body)
      if not isinstance(upstream, dict):
        raise AdapterError(502, "FORJD returned invalid services")
      return JsonResponse(deml_status_services(upstream), status=200, safe=False)

    if request.method != "POST":
      return JsonResponse({"detail": "Method not allowed"}, status=405)
    if not writes_enabled():
      return JsonResponse(
        {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
        status=503,
      )
    credential = await _credential_for_request(request)
    client = _client_for_credential(credential)
    owned = await _require_owned_status_page(
      client,
      page_id=page_id,
      tenant_id=credential.tenant_id,
      request_id=request_id_from(request),
    )
    if isinstance(owned, JsonResponse):
      return owned
    payload = _json_object(request)
    # Angular sends {name, url}; map url → description + probe_url so the
    # FORJD health pinger can accumulate uptime history. FORJD requires
    # lowercase status enums, so normalize legacy Title Case inputs.
    # Default unknown — never invent Operational before a probe exists.
    service_status = str(payload.get("status") or "unknown").strip().lower().replace(" ", "_")
    if service_status not in {
      "operational",
      "degraded",
      "partial_outage",
      "major_outage",
      "maintenance",
      "unknown",
    }:
      raise AdapterError(400, f"Invalid service status: {service_status}")
    service_url = str(payload.get("url") or payload.get("description") or "").strip()
    probe_url = None
    if service_url:
      from forjd.public_url import validate_public_https_url

      try:
        probe_url = validate_public_https_url(service_url)
      except ValueError as exc:
        raise AdapterError(400, f"Invalid probe URL: {exc}") from exc
    body = json.dumps(
      {
        "tenant_id": str(credential.tenant_id),
        "name": str(payload.get("name") or ""),
        "description": service_url[:2048],
        "probe_url": probe_url,
        "status": service_status,
      }
    ).encode()
    response = await client.proxy(
      "POST",
      f"/api/v1/status/pages/{quote(page_id, safe='')}/services",
      body=body,
      content_type="application/json",
      request_id=request_id_from(request),
    )
    if response.status >= 400:
      return _upstream_error_response(response)
    upstream = json.loads(response.body)
    if not isinstance(upstream, dict):
      raise AdapterError(502, "FORJD returned invalid service")
    return JsonResponse(deml_status_service(upstream), status=200)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return _adapter_error_response(AdapterError(502, "FORJD returned invalid service"))


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
@require_forjd_action("status.admin")
async def status_service_delete_proxy(request: HttpRequest, service_id: str) -> HttpResponse:
  if request.method != "DELETE":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    if not writes_enabled():
      return JsonResponse(
        {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
        status=503,
      )
    credential = await _credential_for_request(request)
    client = _client_for_credential(credential)
    response = await client.proxy(
      "DELETE",
      f"/api/v1/status/services/{quote(service_id, safe='')}",
      query_string=f"tenant_id={credential.tenant_id}",
      request_id=request_id_from(request),
    )
    if response.status >= 400:
      return _upstream_error_response(response)
    return JsonResponse({"ok": True}, status=200)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
@require_forjd_action({"GET": "public", "POST": "status.admin"})
async def status_page_incidents_proxy(request: HttpRequest, page_id: str) -> HttpResponse:
  """GET list / POST create — ``/status_pages/{id}/incidents``."""
  try:
    if request.method == "GET":
      client, _deml_user_id, published_only = await _status_directory_read_client(request)
      if published_only:
        # Same isolation rule as services: public uses embedded slug payload only.
        if client is None:
          return JsonResponse(
            {"detail": "Status directory unavailable", "code": ErrorCode.FORJD_DEGRADED.value},
            status=503,
          )
        denied = await _ensure_published_status_page(
          client, page_id, request_id=request_id_from(request)
        )
        if denied is not None:
          return denied
        return JsonResponse([], status=200, safe=False)
      if client is None:
        return JsonResponse(
          {
            "detail": "FORJD tenant credential unavailable",
            "code": ErrorCode.FORJD_READS_DISABLED.value,
          },
          status=503,
        )
      owned = await _require_owned_status_page(
        client,
        page_id=page_id,
        tenant_id=client.tenant_id,
        request_id=request_id_from(request),
      )
      if isinstance(owned, JsonResponse):
        return owned
      response = await client.proxy(
        "GET",
        f"/api/v1/status/pages/{quote(page_id, safe='')}/incidents",
        query_string=f"tenant_id={client.tenant_id}",
        request_id=request_id_from(request),
      )
      if response.status >= 400:
        logger.warning(
          "forjd_status_incidents_failed status=%s page_id=%s published_only=%s",
          response.status,
          page_id,
          published_only,
        )
        return _upstream_error_response(response)
      upstream = json.loads(response.body)
      if not isinstance(upstream, dict):
        raise AdapterError(502, "FORJD returned invalid incidents")
      return JsonResponse(deml_status_incidents(upstream), status=200, safe=False)

    if request.method != "POST":
      return JsonResponse({"detail": "Method not allowed"}, status=405)
    if not writes_enabled():
      return JsonResponse(
        {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
        status=503,
      )
    credential = await _credential_for_request(request)
    client = _client_for_credential(credential)
    owned = await _require_owned_status_page(
      client,
      page_id=page_id,
      tenant_id=credential.tenant_id,
      request_id=request_id_from(request),
    )
    if isinstance(owned, JsonResponse):
      return owned
    payload = _json_object(request)
    # Angular sends {title, message, status} with legacy Title Case statuses.
    status_val = str(payload.get("status") or "investigating").strip().lower()
    if status_val not in {"investigating", "identified", "monitoring", "resolved"}:
      status_val = "investigating"
    body = json.dumps(
      {
        "tenant_id": str(credential.tenant_id),
        "title": str(payload.get("title") or ""),
        "body": str(payload.get("message") or payload.get("body") or ""),
        "status": status_val,
        "severity": str(payload.get("severity") or "minor"),
      }
    ).encode()
    response = await client.proxy(
      "POST",
      f"/api/v1/status/pages/{quote(page_id, safe='')}/incidents",
      body=body,
      content_type="application/json",
      request_id=request_id_from(request),
    )
    if response.status >= 400:
      return _upstream_error_response(response)
    upstream = json.loads(response.body)
    if not isinstance(upstream, dict):
      raise AdapterError(502, "FORJD returned invalid incident")
    return JsonResponse(deml_status_incident(upstream), status=200)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)
  except (TypeError, UnicodeDecodeError, json.JSONDecodeError):
    return _adapter_error_response(AdapterError(502, "FORJD returned invalid incident"))


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
@require_forjd_action("status.admin")
async def status_incident_delete_proxy(request: HttpRequest, incident_id: str) -> HttpResponse:
  if request.method != "DELETE":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    if not writes_enabled():
      return JsonResponse(
        {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
        status=503,
      )
    credential = await _credential_for_request(request)
    client = _client_for_credential(credential)
    response = await client.proxy(
      "DELETE",
      f"/api/v1/status/incidents/{quote(incident_id, safe='')}",
      query_string=f"tenant_id={credential.tenant_id}",
      request_id=request_id_from(request),
    )
    if response.status >= 400:
      return _upstream_error_response(response)
    return JsonResponse({"ok": True}, status=200)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  except ForjdError as exc:
    return _forjd_error_response(exc)


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
async def ingest_processing_status_proxy(request: HttpRequest, batch_id: str) -> HttpResponse:
  """Expose FORJD's durable ingest receipt through the tenant-bound BFF."""
  try:
    normalized_batch_id = _uuid_path(batch_id, "batch_id")
  except AdapterError as exc:
    return _adapter_error_response(exc)
  return await native_forjd_proxy(
    request,
    target_path=f"/api/v1/ingest/processing/{quote(normalized_batch_id, safe='')}",
    allowed_methods=("GET",),
    tenant_binding="query",
  )


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
async def session_revoke_proxy(request: HttpRequest, session_id: str) -> HttpResponse:
  """DELETE /api/v1/sessions/{session_id} with tenant-bound query."""
  return await native_forjd_proxy(
    request,
    target_path=f"/api/v1/sessions/{quote(session_id, safe='')}",
    allowed_methods=("DELETE",),
    tenant_binding="query",
  )


@require_forjd_action("read")
async def forjd_tenant_proxy(request: HttpRequest) -> HttpResponse:
  """GET /api/v1/forjd/tenant — mapped FORJD tenant for browser seal clients."""
  if request.method != "GET":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    credential = await _credential_for_request(request)
  except AdapterError as exc:
    return _adapter_error_response(exc)
  return JsonResponse(
    {"status": "success", "tenant_id": str(credential.tenant_id), "source": "forjd"},
    status=200,
  )


async def unsupported_forjd_proxy(
  request: HttpRequest,
  capability: str,
  **_path_parameters: str,
) -> HttpResponse:
  """Retired BFF facades always fail closed (501) — never empty-200 SoT lies."""
  actor: ForjdActorContext | None = None
  action = action_for_native_request(request.method, request.path)
  if capability != "system-status":
    try:
      actor = await authorize_forjd_action(request, action, resource_id=request.path)
    except ForjdPolicyError as exc:
      return policy_error_response(exc)
  if actor is not None and is_privileged_action(action):
    await record_forjd_audit(
      actor=actor,
      request=request,
      action=action,
      outcome="attempted",
      resource_id=request.path,
    )
  if _is_write_path(request.method, request.path) and not writes_enabled():
    if actor is not None and is_privileged_action(action):
      await record_forjd_audit(
        actor=actor,
        request=request,
        action=action,
        outcome="failed",
        status=503,
        resource_id=request.path,
      )
    return JsonResponse(
      {"detail": "FORJD writes are disabled", "code": ErrorCode.FORJD_WRITES_DISABLED.value},
      status=503,
    )
  response = JsonResponse(
    {
      "detail": (
        f"The {capability} capability is not mounted on the DEML control plane; "
        "call FORJD directly with a tenant-bound service token"
      ),
      "code": "forjd_capability_unavailable",
    },
    status=501,
  )
  if actor is not None and is_privileged_action(action):
    await record_forjd_audit(
      actor=actor,
      request=request,
      action=action,
      outcome="failed",
      status=501,
      resource_id=request.path,
    )
  return response
