"""Focused contract gates for remaining BFF surface + retired facades."""

from __future__ import annotations

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
@pytest.mark.usecase("UC-INGEST-003")
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_crypto_sessions_list_requires_mapping(mock_proxy: AsyncMock, client: Client) -> None:
  _pro_user("cryptogate")
  response = client.get("/api/v1/sessions", HTTP_AUTHORIZATION=_auth("cryptogate"))
  assert response.status_code == 503
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
def test_retired_siem_facade_is_unavailable(client: Client) -> None:
  """SIEM/ML/exports facades are unmounted — partners call FORJD directly."""
  _pro_user("siemgate")
  response = client.get("/api/v1/siem/signals", HTTP_AUTHORIZATION=_auth("siemgate"))
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200


@pytest.mark.django_db
def test_retired_workflows_facade_is_unavailable(client: Client) -> None:
  _pro_user("pipegate")
  response = client.get("/api/v1/workflows", HTTP_AUTHORIZATION=_auth("pipegate"))
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200


@pytest.mark.django_db
def test_retired_endpoints_list_is_unavailable(client: Client) -> None:
  _pro_user("endgate")
  response = client.get(
    "/api/v1/system-status/endpoints",
    HTTP_AUTHORIZATION=_auth("endgate"),
  )
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200
