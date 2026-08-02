"""User-owned interaction endpoints retained in DEML."""

import logging
from typing import Any

from deml_contracts import ConsentIn, ConsentRecordOut, NewsletterIn, NewsletterSubscribeOut
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from ninja import Router
from ninja.errors import HttpError
from utils.structured_log import log_usecase

from monitor.models import CookieConsent, NewsletterSubscription

router = Router(tags=["Users"])
logger = logging.getLogger(__name__)


# --- UC-CONSENT-001 cookie consent ---
@router.post("/consent", auth=None, response=ConsentRecordOut)
def record_consent(request: Any, payload: ConsentIn) -> dict[str, str]:
  user = request.user if request.user.is_authenticated else None
  forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
  ip_address = forwarded_for.split(",")[0].strip() or request.META.get("REMOTE_ADDR")
  consent = CookieConsent.objects.create(
    user=user,
    is_platform=user is None,
    necessary=True,
    analytical=payload.analytical,
    marketing=payload.marketing,
    ip_address=ip_address,
    user_agent=(request.META.get("HTTP_USER_AGENT", "") or "")[:512],
  )
  log_usecase(
    logger,
    "UC-CONSENT-001",
    "consent_recorded",
    analytical=payload.analytical,
    marketing=payload.marketing,
    path="users",
  )
  return ConsentRecordOut(status="recorded", id=str(consent.id)).model_dump()


# --- UC-CONSENT-002 newsletter ---
@router.post("/newsletter", auth=None, response=NewsletterSubscribeOut)
def subscribe(request: Any, payload: NewsletterIn) -> dict[str, str]:
  if not payload.consent_accepted:
    raise HttpError(400, "Consent is required")
  email = (payload.email or "").strip()
  if not email or len(email) > 254:
    raise HttpError(400, "Valid email is required")
  try:
    validate_email(email)
  except ValidationError as exc:
    raise HttpError(400, "Valid email is required") from exc
  subscription, _ = NewsletterSubscription.objects.update_or_create(
    email=email,
    defaults={"consent_accepted": True},
  )
  # Count-only — never log email.
  log_usecase(logger, "UC-CONSENT-002", "newsletter_subscribed", path="users")
  return NewsletterSubscribeOut(status="subscribed", id=str(subscription.id)).model_dump()
