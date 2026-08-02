"""Legacy user-interaction paths retained for the unchanged Angular UI."""

import json
import logging

from deml_contracts import ConsentIn, ConsentRecordOut, NewsletterIn, NewsletterSubscribeOut
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pydantic import ValidationError as PydanticValidationError
from utils.structured_log import log_usecase

from monitor.models import CookieConsent, NewsletterSubscription

logger = logging.getLogger(__name__)


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
def cookie_consent(request: HttpRequest) -> JsonResponse:
  if request.method != "POST":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    raw = json.loads(request.body or b"{}")
  except json.JSONDecodeError:
    return JsonResponse({"detail": "Invalid JSON"}, status=400)
  if not isinstance(raw, dict):
    return JsonResponse({"detail": "Invalid JSON"}, status=400)
  try:
    payload = ConsentIn.model_validate(raw)
  except PydanticValidationError:
    return JsonResponse({"detail": "Invalid consent payload"}, status=422)
  # This cross-site JSON endpoint derives no authority from a session cookie.
  user = (
    request.user
    if request.user.is_authenticated and getattr(request, "firebase_token", None)
    else None
  )
  forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
  consent = CookieConsent.objects.create(
    user=user,
    is_platform=user is None,
    necessary=True,
    analytical=payload.analytical,
    marketing=payload.marketing,
    ip_address=forwarded_for.split(",")[0].strip() or request.META.get("REMOTE_ADDR"),
    user_agent=(request.META.get("HTTP_USER_AGENT", "") or "")[:512],
  )
  log_usecase(
    logger,
    "UC-CONSENT-001",
    "consent_recorded",
    analytical=payload.analytical,
    marketing=payload.marketing,
    path="telemetry",
  )
  body = ConsentRecordOut(status="success", id=str(consent.id)).model_dump()
  return JsonResponse(body)


@csrf_exempt  # nosemgrep: python.django.security.audit.csrf-exempt.no-csrf-exempt
def newsletter(request: HttpRequest) -> JsonResponse:
  if request.method != "POST":
    return JsonResponse({"detail": "Method not allowed"}, status=405)
  try:
    raw = json.loads(request.body or b"{}")
  except json.JSONDecodeError:
    return JsonResponse({"detail": "Invalid JSON"}, status=400)
  if not isinstance(raw, dict):
    return JsonResponse({"detail": "Invalid JSON"}, status=400)
  try:
    payload = NewsletterIn.model_validate(raw)
  except PydanticValidationError:
    return JsonResponse({"detail": "Invalid newsletter payload"}, status=422)
  if not payload.consent_accepted:
    return JsonResponse({"detail": "Consent is required"}, status=400)
  email = str(payload.email or "").strip()
  if not email or len(email) > 254:
    return JsonResponse({"detail": "Valid email is required"}, status=400)
  try:
    validate_email(email)
  except ValidationError:
    return JsonResponse({"detail": "Valid email is required"}, status=400)
  subscription, _ = NewsletterSubscription.objects.update_or_create(
    email=email,
    defaults={"consent_accepted": True},
  )
  log_usecase(logger, "UC-CONSENT-002", "newsletter_subscribed", path="telemetry")
  body = NewsletterSubscribeOut(status="success", id=str(subscription.id)).model_dump()
  return JsonResponse(body)
