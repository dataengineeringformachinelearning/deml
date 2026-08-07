"""Absolute boundaries between DEML product accounts and platform FORJD data.

Platform (tenant0 / ``FORJD_TENANT_ID`` + ``env:FORJD_SERVICE_TOKEN``) is for
DEML dogfood (``platform-status``) and ops clients only. Product accounts must
use partner-provisioned sealed tenants — never the platform credential or UUID.
"""

from __future__ import annotations

from uuid import UUID

from django.conf import settings

from forjd.tenancy import (
  DEFAULT_SERVICE_TOKEN_SECRET_REF,
  ForjdTenantConfigurationError,
  validate_service_token_secret_ref,
)

# --- Platform status sentinel (shared slug namespace; never a product site) ---
PLATFORM_STATUS_SLUG: str = "platform-status"


def platform_forjd_tenant_id() -> UUID | None:
  """Configured DEML platform / tenant0 FORJD UUID, if set."""
  raw = str(getattr(settings, "FORJD_TENANT_ID", "") or "").strip()
  if not raw:
    return None
  try:
    return UUID(raw)
  except ValueError:
    return None


def assert_product_tenant_isolation(tenant_id: UUID, secret_ref: str) -> None:
  """Fail closed when a product account would share platform storage.

  Call on every product mapping resolve / persist / ops map command.
  """
  normalized = validate_service_token_secret_ref(secret_ref)
  if normalized == DEFAULT_SERVICE_TOKEN_SECRET_REF:
    raise ForjdTenantConfigurationError(
      "Product accounts cannot use env:FORJD_SERVICE_TOKEN (platform credential)"
    )
  platform_id = platform_forjd_tenant_id()
  if platform_id is not None and tenant_id == platform_id:
    raise ForjdTenantConfigurationError(
      "Product accounts cannot map to the DEML platform FORJD tenant"
    )


def is_platform_status_slug(slug: str | None) -> bool:
  return str(slug or "").strip().lower() == PLATFORM_STATUS_SLUG
