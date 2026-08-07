"""Widget telemetry adapters."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from django.test import Client, override_settings


@pytest.mark.django_db
@override_settings(FORJD_WRITE_MODE="forjd", FORJD_READ_MODE="forjd")
def test_widget_telemetry_requires_slug() -> None:
  client = Client()
  response = client.post(
    "/api/v1/system-status/widget-telemetry",
    data=json.dumps({"response_time_ms": 120}),
    content_type="application/json",
  )
  assert response.status_code == 400


@pytest.mark.django_db
@override_settings(FORJD_WRITE_MODE="forjd", FORJD_READ_MODE="forjd")
def test_widget_telemetry_accepts_when_page_unmapped() -> None:
  client = Client()
  with patch("forjd.widget_telemetry._resolve_page_tenant", new=AsyncMock(return_value=None)):
    response = client.post(
      "/api/v1/system-status/widget-telemetry",
      data=json.dumps({"slug": "platform-status", "response_time_ms": 90}),
      content_type="application/json",
    )
  assert response.status_code == 202
  body = response.json()
  assert body["ok"] is True
  assert body["accepted"] is False


@pytest.mark.django_db
@override_settings(FORJD_WRITE_MODE="forjd", FORJD_READ_MODE="forjd")
def test_widget_telemetry_seals_when_mapped() -> None:
  tenant_id = uuid4()
  credential = MagicMock()
  credential.tenant_id = tenant_id
  credential.service_token = "fjsvc_abcd1234_test-secret"  # pragma: allowlist secret

  client = Client()
  with (
    patch("forjd.widget_telemetry._resolve_page_tenant", new=AsyncMock(return_value=tenant_id)),
    patch(
      "forjd.widget_telemetry._credential_for_tenant",
      new=AsyncMock(return_value=credential),
    ),
    patch(
      "forjd.widget_telemetry.send_widget_telemetry",
      new=AsyncMock(return_value={"ok": True, "event_id": "evt-1"}),
    ) as send,
  ):
    response = client.post(
      "/api/v1/system-status/widget-telemetry",
      data=json.dumps(
        {
          "slug": "demo-status",
          "response_time_ms": 210,
          "status_code": 200,
          "device_id": "w-test",
        }
      ),
      content_type="application/json",
    )
  assert response.status_code == 202
  body = response.json()
  assert body["accepted"] is True
  send.assert_awaited_once()
