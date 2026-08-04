import base64
import hashlib
import hmac
import logging
import re
import secrets

from deml_contracts import (
  APIKeyGenerateIn,
  APIKeyGenerateOut,
  APIKeyOut,
  DeleteAccountOut,
  DesktopAuthOut,
  DesktopSessionIn,
  HandoffGenerateIn,
  HandoffGenerateOut,
  HandoffVerifyIn,
  LogoutIn,
  SessionOut,
  SessionRegisterIn,
  SessionRegisterOut,
  SuccessSchema,
)
from django.core import signing
from django.db import IntegrityError
from monitor.models import APIKey
from ninja import Router
from ninja.errors import HttpError
from utils.structured_log import log_usecase

router = Router()
logger = logging.getLogger(__name__)


# --- UC-AUTH-001 identity probe ---
@router.get("/register", response=SuccessSchema, auth=None)
def api_register_health(request):
  """Health probe for monitors; user registration is handled client-side via Firebase."""
  return {"status": "ok", "user": None, "user_id": None, "role": None}


@router.get("/user", response=SuccessSchema)
def api_user(request):
  if request.user.is_authenticated:
    role = "Viewer"
    if hasattr(request.user, "profile"):
      role = request.user.profile.role
    log_usecase(
      logger,
      "UC-AUTH-001",
      "auth_identity_ok",
      user_id=request.user.id,
      role=role,
    )
    return {
      "status": "success",
      "user": request.user.first_name or request.user.username,
      "user_id": request.user.id,
      "role": role,
    }
  raise HttpError(401, "Not authenticated")


# --- UC-AUTH-006 account deletion ---
@router.delete("/delete-account", response=DeleteAccountOut)
def api_delete_account(request):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")

  from account.lifecycle import request_account_deletion
  from monitor.models import UserLifecycleJob

  firebase_uid = None
  if hasattr(request, "firebase_token") and request.firebase_token:
    firebase_uid = request.firebase_token.get("uid")

  job = request_account_deletion(request.user, firebase_uid=firebase_uid)
  completed = job.state == UserLifecycleJob.State.COMPLETED
  if not completed:
    raise HttpError(503, job.last_error or "Account deletion is blocked on FORJD tenant erasure")
  return {
    "status": "success",
    "job_id": str(job.id),
    "completed": True,
  }


# --- UC-AUTH-005 API keys ---
@router.post("/api-keys/generate", response=APIKeyGenerateOut, summary="Generate API Key")
def generate_api_key(request, payload: APIKeyGenerateIn):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")

  api_key = None
  raw_key = ""
  for _attempt in range(5):
    prefix = secrets.token_hex(4)
    # Prefixing makes the credential unambiguous in Authorization: Bearer while
    # keeping the stored lookup prefix and one-time secret semantics unchanged.
    raw_key = f"deml_{prefix}_{secrets.token_urlsafe(32)}"
    candidate = APIKey(user=request.user, name=payload.name, prefix=prefix)
    candidate.set_key(raw_key)
    try:
      candidate.save()
    except IntegrityError:
      continue
    api_key = candidate
    break
  if api_key is None:
    raise HttpError(503, "Unable to allocate a unique API key; retry the request")

  log_usecase(
    logger,
    "UC-AUTH-005",
    "api_key_generated",
    user_id=request.user.id,
    prefix=api_key.prefix,
  )
  return {"status": "success", "name": api_key.name, "key": raw_key, "prefix": api_key.prefix}


@router.get("/api-keys", response=list[APIKeyOut], summary="List API Keys")
def list_api_keys(request):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")

  keys = APIKey.objects.filter(user=request.user, is_active=True).order_by("-created_at")
  return [
    {
      "id": str(key.id),
      "name": key.name,
      "prefix": key.prefix,
      "created_at": key.created_at.isoformat(),
    }
    for key in keys
  ]


@router.delete("/api-keys/{key_id}", response=SuccessSchema, summary="Revoke API Key")
def delete_api_key(request, key_id: str):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")

  import uuid

  try:
    key_uuid = uuid.UUID(key_id)
    api_key = APIKey.objects.get(id=key_uuid, user=request.user, is_active=True)
    api_key.is_active = False
    api_key.save()
    log_usecase(
      logger,
      "UC-AUTH-005",
      "api_key_revoked",
      user_id=request.user.id,
      prefix=api_key.prefix,
    )
    return {"status": "success"}
  except (ValueError, APIKey.DoesNotExist) as e:
    raise HttpError(404, "API Key not found") from e


_PKCE_PATTERN = re.compile(r"^[A-Za-z0-9_-]{43,128}$")
_DESKTOP_SESSION_SALT = "deml.desktop-session.v1"
_DESKTOP_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30


@router.post(
  "/handoff/generate", response=HandoffGenerateOut, summary="Generate cross-domain handoff token"
)
def generate_handoff_token(request, payload: HandoffGenerateIn):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")

  from utils.session_registry import store_handoff

  challenge = (payload.code_challenge or "").strip()
  if challenge and not _PKCE_PATTERN.fullmatch(challenge):
    raise HttpError(400, "Invalid PKCE code challenge")

  token = secrets.token_urlsafe(32)
  # One-time codes live in Postgres (TTL).
  if not store_handoff(
    token,
    user_id=request.user.id,
    code_challenge=challenge,
    client_name=payload.client_name[:64],
    ttl_seconds=120,
  ):
    raise HttpError(503, "Handoff store unavailable")

  log_usecase(
    logger,
    "UC-AUTH-003",
    "handoff_generated",
    user_id=request.user.id,
    has_pkce=bool(challenge),
  )
  return {"status": "success", "token": token}


@router.post(
  "/handoff/verify", response=DesktopAuthOut, auth=None, summary="Verify one-time handoff token"
)
def verify_handoff_token(request, payload: HandoffVerifyIn):
  from utils.session_registry import consume_handoff

  # Consume before PKCE so a failed attempt cannot be retried.
  handoff = consume_handoff(payload.token)
  if not handoff:
    raise HttpError(401, "Invalid or expired token")

  try:
    user_id = int(handoff["user_id"])
    expected_challenge = str(handoff.get("code_challenge") or "")
  except (TypeError, ValueError, KeyError) as exc:
    raise HttpError(401, "Invalid handoff payload") from exc

  if expected_challenge:
    verifier = (payload.code_verifier or "").strip()
    if not _PKCE_PATTERN.fullmatch(verifier):
      raise HttpError(401, "PKCE verification failed")
    digest = hashlib.sha256(verifier.encode("ascii")).digest()
    actual_challenge = base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
    if not hmac.compare_digest(expected_challenge, actual_challenge):
      raise HttpError(401, "PKCE verification failed")

  from django.contrib.auth import get_user_model

  User = get_user_model()
  try:
    user = User.objects.get(id=user_id, is_active=True)
    role = "Viewer"
    if hasattr(user, "profile"):
      role = user.profile.role
    desktop_token = None
    if expected_challenge:
      desktop_token = signing.dumps({"user_id": user.id}, salt=_DESKTOP_SESSION_SALT, compress=True)
    return {
      "status": "success",
      "user": user.first_name or user.username,
      "email": user.email,
      "user_id": user.id,
      "role": role,
      "desktop_token": desktop_token,
    }
  except User.DoesNotExist:
    raise HttpError(404, "User not found") from None


@router.post(
  "/desktop/session",
  response=DesktopAuthOut,
  auth=None,
  summary="Validate a native desktop session",
)
def validate_desktop_session(request, payload: DesktopSessionIn):
  try:
    session = signing.loads(
      payload.desktop_token,
      salt=_DESKTOP_SESSION_SALT,
      max_age=_DESKTOP_SESSION_MAX_AGE_SECONDS,
    )
    user_id = int(session["user_id"])
  except (signing.BadSignature, signing.SignatureExpired, TypeError, ValueError, KeyError) as exc:
    raise HttpError(401, "Invalid or expired desktop session") from exc

  from django.contrib.auth import get_user_model

  User = get_user_model()
  try:
    user = User.objects.get(id=user_id, is_active=True)
  except User.DoesNotExist:
    raise HttpError(401, "Desktop session user is unavailable") from None
  role = user.profile.role if hasattr(user, "profile") else "Viewer"
  return {
    "status": "success",
    "user": user.first_name or user.username,
    "email": user.email,
    "user_id": user.id,
    "role": role,
    "desktop_token": None,
  }


@router.post("/sessions", response=SessionRegisterOut, summary="Register browser session")
def register_session_endpoint(request, payload: SessionRegisterIn):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")
  firebase_uid = getattr(request, "firebase_token", {}).get("uid")
  if not firebase_uid:
    raise HttpError(400, "Missing Firebase UID")

  from utils.session_registry import register_session

  ip = request.META.get("REMOTE_ADDR", "")
  if not register_session(
    payload.session_id,
    firebase_uid,
    request.user.id,
    user_agent=payload.user_agent,
    ip=ip,
  ):
    raise HttpError(503, "Session registry unavailable")
  log_usecase(
    logger,
    "UC-AUTH-002",
    "session_registered",
    user_id=request.user.id,
  )
  return {"status": "success", "session_id": payload.session_id}


@router.get("/sessions", response=list[SessionOut], summary="List active sessions")
def list_sessions_endpoint(request):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")
  firebase_uid = getattr(request, "firebase_token", {}).get("uid")
  if not firebase_uid:
    return []

  from utils.session_registry import list_sessions

  return list_sessions(firebase_uid)


@router.delete("/sessions/{session_id}", response=SuccessSchema, summary="Revoke session")
def revoke_session_endpoint(request, session_id: str):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")
  firebase_uid = getattr(request, "firebase_token", {}).get("uid")
  if not firebase_uid:
    raise HttpError(400, "Missing Firebase UID")

  from utils.session_registry import notify_force_logout, revoke_session

  if not revoke_session(session_id, firebase_uid):
    raise HttpError(404, "Session not found")
  notify_force_logout(firebase_uid, session_id=session_id, reason="revoked")
  return {"status": "success"}


@router.post("/logout", response=SuccessSchema, summary="Sign out server session")
def logout_session_endpoint(request, payload: LogoutIn):
  if not request.user.is_authenticated:
    raise HttpError(401, "Not authenticated")
  firebase_uid = getattr(request, "firebase_token", {}).get("uid")
  if not firebase_uid:
    return {"status": "success"}

  from utils.session_registry import notify_force_logout, revoke_all_sessions, revoke_session

  if payload.revoke_all:
    revoke_all_sessions(firebase_uid)
    notify_force_logout(firebase_uid, reason="logout_all")
    try:
      auth_mod = __import__("firebase_admin.auth", fromlist=["auth"])
      auth_mod.revoke_refresh_tokens(firebase_uid)
    except Exception:
      # Session registry already revoked; Firebase revoke is best-effort.
      logger.exception("Firebase session revoke failed uid_prefix=%s", firebase_uid[:8])
  elif payload.session_id:
    revoke_session(payload.session_id, firebase_uid)
    notify_force_logout(firebase_uid, session_id=payload.session_id, reason="logout")

  log_usecase(
    logger,
    "UC-AUTH-004",
    "logout_completed",
    user_id=request.user.id,
    revoke_all=bool(payload.revoke_all),
  )
  return {"status": "success"}
