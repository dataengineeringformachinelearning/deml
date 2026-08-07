"""Headless BFF contract — capabilities + status + retired facade gates."""

from __future__ import annotations

import json
from typing import Any
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from django.contrib.auth import get_user_model
from django.test import Client, override_settings
from forjd.client import ForjdResponse
from forjd.testing import create_product_forjd_mapping

User = get_user_model()
SERVICE_TOKEN = "fjsvc_deadbeef_test-secret"  # pragma: allowlist secret


def _mapped_actor(username: str, role: str) -> tuple[Any, str]:
  user = User.objects.create_user(username=username)
  user.profile.role = role
  user.profile.tier = "Pro"
  user.profile.subscription_active = True
  user.profile.save(update_fields=["role", "tier", "subscription_active"])
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  return user, str(tenant_id)


def _authorization(username: str) -> str:
  return f"Bearer mock-token-{username}-{username}@example.com"


@pytest.mark.django_db
@pytest.mark.parametrize(("received", "expected_status"), [("1.0", 200), ("2.0", 503)])
@override_settings(FORJD_REQUIRED_CONTRACT_VERSION="1.0")
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_capability_probe_enforces_contract_version(
  mock_proxy: AsyncMock,
  client: Client,
  received: str,
  expected_status: int,
) -> None:
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=json.dumps(
      {
        "contract_version": received,
        "service": "forjd",
        "service_version": "2026.7",
        "authentication": {"service_tokens": True},
        "capabilities": {"status": True},
        "limits": {"max_page_size": 500},
        "reliability": {"request_id": True},
      }
    ).encode(),
    content_type="application/json",
    headers={"X-Request-ID": "forjd-probe-0001"},
  )
  mock_proxy.side_effect = [
    mock_proxy.return_value,
    ForjdResponse(
      status=200,
      body=b'{"status":"ready","checks":{"database":true}}',
      content_type="application/json",
      headers={"X-Request-ID": "forjd-ready-0001"},
    ),
  ]

  response = client.get("/api/v1/forjd/capabilities")

  assert response.status_code == expected_status
  assert response.json()["contract_version"] == received
  assert response["X-FORJD-Request-ID"] == "forjd-probe-0001"


@pytest.mark.django_db
@override_settings(FORJD_REQUIRED_CONTRACT_VERSION="1.0")
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_capability_probe_does_not_report_ready_when_runtime_is_degraded(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  mock_proxy.side_effect = [
    ForjdResponse(
      status=200,
      body=b'{"contract_version":"1.0","service":"forjd","capabilities":{}}',
      content_type="application/json",
      headers={"X-Request-ID": "forjd-probe-0002"},
    ),
    ForjdResponse(
      status=503,
      body=b'{"status":"not_ready","checks":{"database":false}}',
      content_type="application/json",
      headers={"X-Request-ID": "forjd-ready-0002"},
    ),
  ]

  response = client.get("/api/v1/forjd/capabilities")

  assert response.status_code == 503
  assert response.json()["status"] == "degraded"
  assert response.json()["runtime"]["checks"]["database"] is False


@pytest.mark.django_db
@pytest.mark.parametrize(
  "path",
  [
    "/api/v1/analytics/overview",
    "/api/v1/analytics/live",
    "/api/v1/siem/signals",
    "/api/v1/exports/",
    "/api/v1/ml/latest",
    "/api/v1/agent/vulnerabilities",
    "/api/v1/projections",
    "/api/v1/workflows",
    "/api/v1/system-status/endpoints",
  ],
)
def test_retired_headless_facades_are_unavailable(client: Client, path: str) -> None:
  username = f"retire{uuid4().hex[:8]}"
  _mapped_actor(username, "Security Admin")
  response = client.get(path, HTTP_AUTHORIZATION=_authorization(username))
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200


@pytest.mark.django_db
@pytest.mark.parametrize(
  ("method", "path", "role"),
  [
    ("put", "/api/v1/system-status/status_pages/page-1", "Security Admin"),
    ("patch", "/api/v1/system-status/status_pages/page-1", "Security Admin"),
    ("delete", "/api/v1/system-status/status_pages/page-1", "Security Admin"),
  ],
)
@override_settings(FORJD_WRITE_MODE="off", FORJD_CUTOVER_PHASE="")
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_status_write_gate_covers_mutating_verbs(
  mock_proxy: AsyncMock,
  client: Client,
  method: str,
  path: str,
  role: str,
) -> None:
  username = f"writegate{method}"
  _user, tenant_id = _mapped_actor(username, role)

  with override_settings(FORJD_TENANT_ID=tenant_id, FORJD_SERVICE_TOKEN=SERVICE_TOKEN):
    response = getattr(client, method)(
      path,
      data={},
      content_type="application/json",
      HTTP_AUTHORIZATION=_authorization(username),
    )

  assert response.status_code == 503
  assert response.json()["code"] == "forjd_writes_disabled"
  mock_proxy.assert_not_awaited()
