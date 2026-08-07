"""Test helpers that bind product accounts to isolated FORJD tenants.

Never use ``env:FORJD_SERVICE_TOKEN`` / ``FORJD_TENANT_ID`` (platform) here.
Tests that call this must set ``SECRET_KEY`` (Django test settings usually do).
"""

from __future__ import annotations

from uuid import UUID, uuid4

from monitor.models import ForjdServiceCredential, ForjdTenantMapping

from forjd.secrets import seal_service_token, sealed_ref

# Test-only opaque token shape — not a production secret.
_TEST_SERVICE_TOKEN = "fjsvc_testhash_product-isolation-secret"  # pragma: allowlist secret


def create_product_forjd_mapping(
  *,
  deml_account_id: UUID,
  forjd_tenant_id: UUID | None = None,
  service_token: str = _TEST_SERVICE_TOKEN,
) -> ForjdTenantMapping:
  """Create a sealed product mapping that cannot collide with platform tenant0."""
  tenant_id = forjd_tenant_id or uuid4()
  credential_id = uuid4()
  ciphertext, encrypted_dek = seal_service_token(service_token)
  ForjdServiceCredential.objects.create(
    id=credential_id,
    deml_account_id=deml_account_id,
    forjd_tenant_id=tenant_id,
    ciphertext=ciphertext,
    encrypted_dek=encrypted_dek,
  )
  return ForjdTenantMapping.objects.create(
    deml_account_id=deml_account_id,
    forjd_tenant_id=tenant_id,
    service_token_secret_ref=sealed_ref(str(credential_id)),
    is_active=True,
  )
