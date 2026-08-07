"""Bearer present + verify failure must 401 — never AnonymousUser."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from django.test import Client, override_settings


@pytest.mark.django_db
@override_settings(DEBUG=False)
def test_invalid_bearer_returns_401_not_anonymous(client: Client) -> None:
  with patch(
    "config.middleware.auth.verify_id_token",
    side_effect=ValueError("bad token"),
  ):
    response = client.get(
      "/api/v1/system-status/status_pages",
      HTTP_AUTHORIZATION="Bearer clearly-invalid-token",
    )

  assert response.status_code == 401
  body = response.json()
  assert "Invalid or expired" in body.get("detail", "")


@pytest.mark.django_db
@override_settings(DEBUG=False)
def test_missing_bearer_still_allows_public_status_get(client: Client) -> None:
  """Unauthenticated public directory remains reachable (FORJD may 503 separately)."""
  with patch(
    "forjd.views._fetch_published_directory",
    return_value=[],
  ):
    response = client.get("/api/v1/system-status/status_pages")
  # May be 200 empty-filtered or 503 depending on cutover — must not be 401.
  assert response.status_code != 401
