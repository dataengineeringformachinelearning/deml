"""Retired analytics integrations (GA / Clarity / Cloudflare) — unmounted."""

from __future__ import annotations

import pytest
from django.contrib.auth import get_user_model
from django.test import Client

User = get_user_model()


def _auth(username: str) -> str:
  return f"Bearer mock-token-{username}-{username}@example.com"


@pytest.mark.django_db
def test_analytics_integrations_are_unmounted() -> None:
  user = User.objects.create_user(username="integgate")
  user.profile.role = "Security Admin"
  user.profile.tier = "Pro"
  user.profile.subscription_active = True
  user.profile.save(update_fields=["role", "tier", "subscription_active"])
  client = Client()
  listed = client.get(
    "/api/v1/system-status/integrations",
    HTTP_AUTHORIZATION=_auth("integgate"),
  )
  assert listed.status_code in {501, 503, 404}
  clarity = client.post(
    "/api/v1/system-status/integrations/clarity",
    data={"project_id": "x"},
    content_type="application/json",
    HTTP_AUTHORIZATION=_auth("integgate"),
  )
  assert clarity.status_code in {501, 503, 404, 405}
