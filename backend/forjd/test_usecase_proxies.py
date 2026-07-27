"""Focused contract gates for UC-SIEM/COMPLY/INGEST-003/PIPE/INTEG-002."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, patch

import pytest
from django.contrib.auth import get_user_model
from django.test import Client

User = get_user_model()


def _auth(username: str) -> str:
  return f"Bearer mock-token-{username}-{username}@example.com"


def _pro_user(username: str) -> None:
  user = User.objects.create_user(username=username)
  user.profile.role = "Security Admin"
  user.profile.tier = "Pro"
  user.profile.subscription_active = True
  user.profile.save(update_fields=["role", "tier", "subscription_active"])


@pytest.mark.django_db
@pytest.mark.usecase("UC-SIEM-001")
@patch("forjd.views.ForjdClient.proxy", new_callable=AsyncMock)
def test_siem_signals_require_tenant_mapping(mock_proxy: AsyncMock, client: Client) -> None:
  _pro_user("siemgate")
  response = client.get("/api/v1/siem/signals", HTTP_AUTHORIZATION=_auth("siemgate"))
  assert response.status_code == 503
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.usecase("UC-COMPLY-001")
@patch("forjd.views.ForjdClient.proxy", new_callable=AsyncMock)
def test_soc_status_requires_mapping(mock_proxy: AsyncMock, client: Client) -> None:
  _pro_user("complygate")
  response = client.get(
    "/api/v1/ml/compliance/soc-status",
    HTTP_AUTHORIZATION=_auth("complygate"),
  )
  assert response.status_code in {503, 501}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.usecase("UC-INGEST-003")
@patch("forjd.views.ForjdClient.proxy", new_callable=AsyncMock)
def test_crypto_sessions_list_requires_mapping(mock_proxy: AsyncMock, client: Client) -> None:
  _pro_user("cryptogate")
  response = client.get("/api/v1/sessions", HTTP_AUTHORIZATION=_auth("cryptogate"))
  assert response.status_code == 503
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.usecase("UC-PIPE-001")
@patch("forjd.views.ForjdClient.proxy", new_callable=AsyncMock)
def test_workflows_list_proxy(mock_proxy: AsyncMock, client: Client) -> None:
  """Unmapped accounts fail closed before FORJD is contacted."""
  _pro_user("pipegate")
  response = client.get("/api/v1/workflows", HTTP_AUTHORIZATION=_auth("pipegate"))
  assert response.status_code == 503
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.usecase("UC-INTEG-002")
@patch("forjd.views.ForjdClient.proxy", new_callable=AsyncMock)
def test_security_alert_requires_tenant_mapping(mock_proxy: AsyncMock, client: Client) -> None:
  User.objects.create_user(username="alertgate")
  response = client.post(
    "/api/v1/integrations/security-alert",
    data=json.dumps({"title": "ping"}),
    content_type="application/json",
    HTTP_AUTHORIZATION=_auth("alertgate"),
  )
  assert response.status_code in {403, 503}
  mock_proxy.assert_not_awaited()
