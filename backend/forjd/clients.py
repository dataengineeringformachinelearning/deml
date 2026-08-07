"""FORJD HTTP clients with an obvious product vs platform boundary.

Never use a bare ``ForjdClient()`` for product-account work — that binds the
platform ``FORJD_SERVICE_TOKEN`` / ``FORJD_TENANT_ID`` dogfood credential.

| Helper | Auth | Allowed callers |
|--------|------|-----------------|
| ``product_forjd_client`` | Account ``fjsvc_`` | Settings / owned status / headless product |
| ``public_forjd_client`` | None | Explore directory, public slug |
| ``platform_forjd_client`` | Platform env token | Ops, widget tenant resolve, sealed heartbeat |
"""

from __future__ import annotations

from forjd.tenancy import ForjdTenantCredential
from forjd.client import ForjdClient


def product_forjd_client(credential: ForjdTenantCredential) -> ForjdClient:
  """Tenant-bound client for a DEML product account — never platform."""
  return ForjdClient(
    tenant_id=credential.tenant_id,
    service_token=credential.service_token,
  )


def public_forjd_client() -> ForjdClient:
  """Unauthenticated client for published directory / public slug reads."""
  return ForjdClient(use_service_auth=False)


def platform_forjd_client() -> ForjdClient:
  """Platform dogfood credential (``FORJD_TENANT_ID`` + ``env:FORJD_SERVICE_TOKEN``).

  Only for ops paths that intentionally touch tenant0. Product adapters must
  not call this.
  """
  return ForjdClient()
