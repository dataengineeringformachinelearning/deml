"""Product vs platform FORJD isolation invariants."""

from __future__ import annotations

from uuid import UUID, uuid4

import pytest
from django.test import override_settings

from forjd.isolation import (
  assert_product_tenant_isolation,
  is_platform_status_page,
  is_platform_status_slug,
)
from forjd.tenancy import DEFAULT_SERVICE_TOKEN_SECRET_REF, ForjdTenantConfigurationError


def test_platform_status_slug_helper() -> None:
  assert is_platform_status_slug("platform-status")
  assert is_platform_status_slug(" Platform-Status ")
  assert not is_platform_status_slug("joealongi-dev")
  assert is_platform_status_page({"slug": "platform-status"})
  assert not is_platform_status_page({"slug": "acme"})


@override_settings(
  FORJD_TENANT_ID="00000000-0000-0000-0000-000000000001",
)
def test_rejects_platform_default_credential() -> None:
  with pytest.raises(ForjdTenantConfigurationError, match="platform credential"):
    assert_product_tenant_isolation(uuid4(), DEFAULT_SERVICE_TOKEN_SECRET_REF)


@override_settings(
  FORJD_TENANT_ID="00000000-0000-0000-0000-000000000001",
)
def test_rejects_product_tenant_equal_to_platform() -> None:
  platform = UUID("00000000-0000-0000-0000-000000000001")
  with pytest.raises(ForjdTenantConfigurationError, match="platform FORJD tenant"):
    assert_product_tenant_isolation(platform, "env:FORJD_SERVICE_TOKEN_CUSTOMER_A")


@override_settings(FORJD_TENANT_ID="")
def test_allows_customer_env_ref_when_platform_unset() -> None:
  assert_product_tenant_isolation(uuid4(), "env:FORJD_SERVICE_TOKEN_CUSTOMER_A")
