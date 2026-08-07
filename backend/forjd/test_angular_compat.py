"""Angular response-shape mappers for FORJD-backed BFF routes."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from django.contrib.auth import get_user_model
from django.test import Client, override_settings
from forjd.testing import create_product_forjd_mapping

from forjd.angular_compat import (
  deml_status_incidents,
  deml_status_pages,
  deml_status_services,
  match_published_status_page,
  public_status_slug_candidates,
)
from forjd.client import ForjdError, ForjdResponse

User = get_user_model()


def test_deml_status_pages_sets_deml_user_id() -> None:
  pages = deml_status_pages(
    {
      "pages": [
        {
          "id": "p1",
          "title": "Ops",
          "slug": "ops",
          "description": "",
          "is_published": True,
          "created_at": "2026-07-18T00:00:00Z",
        }
      ]
    },
    deml_user_id=7,
  )
  assert pages[0]["user_id"] == 7


def test_deml_status_pages_require_pages_key_fail_closed() -> None:
  """Missing pages must not silently become [] when honesty is required."""
  assert deml_status_pages({}, deml_user_id=None) == []
  try:
    deml_status_pages({}, deml_user_id=None, require_pages_key=True)
    raise AssertionError("expected ValueError")
  except ValueError:
    pass


def test_public_status_slug_candidates_domain_and_stem() -> None:
  assert public_status_slug_candidates("joealongi.dev") == ["joealongi-dev", "joealongi"]
  assert public_status_slug_candidates("joealongi-dev") == ["joealongi-dev"]


def test_match_published_status_page_unique_prefix() -> None:
  pages = [
    {"id": "1", "slug": "joealongi-dev", "title": "joealongi.dev", "is_published": True},
    {"id": "2", "slug": "platform-status", "title": "Platform", "is_published": True},
  ]
  assert match_published_status_page(pages, identifier="joealongi")["slug"] == "joealongi-dev"
  assert match_published_status_page(pages, identifier="missing") is None


def test_deml_status_page_passes_through_overall_status() -> None:
  from forjd.angular_compat import deml_status_page

  page = deml_status_page(
    {
      "id": "p1",
      "title": "Ops",
      "slug": "ops",
      "description": "",
      "is_published": True,
      "created_at": "2026-07-18T00:00:00Z",
      "overall_status": "operational",
      "overall_uptime": 99.5,
    },
    deml_user_id=None,
  )
  assert page["overall_status"] == "operational"
  assert page["cumulative_sla"] == 99.5

  missing = deml_status_page(
    {
      "id": "p2",
      "title": "Empty",
      "slug": "empty",
      "is_published": True,
      "created_at": "2026-07-18T00:00:00Z",
    },
    deml_user_id=None,
  )
  assert missing["overall_status"] == "unknown"


def test_deml_status_page_passes_through_uptime_history() -> None:
  from forjd.angular_compat import deml_status_page

  page = deml_status_page(
    {
      "id": "p1",
      "title": "Ops",
      "slug": "ops",
      "description": "",
      "is_published": True,
      "created_at": "2026-07-18T00:00:00Z",
      "overall_status": "operational",
      "overall_uptime": 99.5,
      "cumulative_sla": 99.5,
      "p99_latency": 12.5,
      "total_requests": 42,
      "predicted_sla": 97.25,
      "spiking_temporal_forecast": 0,
      "temporal_status": "ready",
      "temporal_backend": "gru_mlp",
      "temporal_sample_count": 64,
      "temporal_scored_at": "2026-07-23T00:00:00Z",
      "uptime_history": [
        {"date": "2026-07-18", "status": "up", "uptime": 100},
        {"date": "2026-07-19", "status": "no_data", "uptime": None},
      ],
    },
    deml_user_id=None,
  )
  assert page["overall_uptime"] == 99.5
  assert page["p99_latency"] == 12.5
  assert page["total_requests"] == 42
  assert page["predicted_sla"] == 97.25
  assert page["spiking_temporal_forecast"] == 0
  assert page["temporal_status"] == "ready"
  assert page["temporal_backend"] == "gru_mlp"
  assert page["temporal_sample_count"] == 64
  assert page["temporal_scored_at"] == "2026-07-23T00:00:00Z"
  assert page["uptime_history"] == [
    {"date": "2026-07-18", "status": "up", "uptime": 100.0},
    {"date": "2026-07-19", "status": "no_data", "uptime": None},
  ]


def test_deml_status_services_passes_through_sla_and_history() -> None:
  rows = deml_status_services(
    {
      "services": [
        {
          "id": "s1",
          "name": "Site",
          "status": "operational",
          "description": "https://example.com",
          "sla": 99.9,
          "p99_latency": 14,
          "uptime_history": [{"date": "2026-07-18", "status": "up", "uptime": 100}],
        }
      ]
    }
  )
  assert rows[0]["sla"] == 99.9
  assert rows[0]["p99_latency"] == 14.0
  assert rows[0]["uptime_history"][0]["status"] == "up"


def test_deml_status_services_maps_forjd_enums_to_legacy_labels() -> None:
  rows = deml_status_services(
    {
      "services": [
        {"id": "s1", "name": "Site", "status": "operational"},
        {"id": "s2", "name": "API", "status": "degraded"},
        {"id": "s3", "name": "Edge", "status": "partial_outage"},
        {"id": "s4", "name": "Core", "status": "major_outage"},
        {"id": "s5", "name": "Jobs", "status": "maintenance"},
        {"id": "s6", "name": "Legacy", "status": "Outage"},
      ]
    }
  )
  assert [row["status"] for row in rows] == [
    "Operational",
    "Degraded",
    "Degraded",
    "Outage",
    "Maintenance",
    "Outage",
  ]


def test_deml_status_incidents_title_cases_statuses() -> None:
  rows = deml_status_incidents(
    {
      "incidents": [
        {"id": "i1", "title": "A", "status": "resolved", "started_at": "2026-07-18T00:00:00Z"},
        {"id": "i2", "title": "B", "status": "investigating", "started_at": None},
        {"id": "i3", "title": "C", "status": None, "started_at": None},
      ]
    }
  )
  # Missing status must stay Unknown — never invent Investigating.
  assert [row["status"] for row in rows] == ["Resolved", "Investigating", "Unknown"]


def test_deml_status_page_coerces_legacy_bare_zero_forecast() -> None:
  from forjd.angular_compat import deml_status_page

  page = deml_status_page(
    {
      "id": "p1",
      "title": "joealongi.dev",
      "slug": "joealongi-dev",
      "description": "Public status for joealongi.dev and related services.",
      "is_published": True,
      "created_at": "2026-07-19T00:00:00Z",
      "spiking_temporal_forecast": 0.0,
      "uses_norse": False,
      "threat_anomaly_score": 0.62,
      "threat_suspicious_ratio": 0.32,
    },
    deml_user_id=None,
  )
  assert page["spiking_temporal_forecast"] is None
  assert page["temporal_status"] == "insufficient_data"
  assert page["temporal_backend"] is None
  assert page["temporal_sample_count"] == 0
  assert page["uses_norse"] is False
  assert page["threat_anomaly_score"] == 0.62
  assert page["threat_suspicious_ratio"] == 0.32


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="1",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
def test_retired_analytics_overview_is_unavailable(client: Client) -> None:
  user = User.objects.create_user(username="overview")
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  with override_settings(FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099"):
    response = client.get(
      "/api/v1/analytics/overview",
      HTTP_AUTHORIZATION="Bearer mock-token-overview-overview@example.com",
    )
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="0",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
def test_retired_endpoints_facade_is_unavailable(client: Client) -> None:
  user = User.objects.create_user(username="emptyget")
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  with override_settings(FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099"):
    response = client.get(
      "/api/v1/system-status/endpoints",
      HTTP_AUTHORIZATION="Bearer mock-token-emptyget-emptyget@example.com",
    )
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="1",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
def test_status_pages_owned_list_fails_closed_on_outage(client: Client) -> None:
  """Owned Settings list must not mask FORJD outages as an empty site list."""
  user = User.objects.create_user(username="pages")
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  with (
    override_settings(FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099"),
    patch(
      "forjd.clients.ForjdClient.proxy",
      new_callable=AsyncMock,
      side_effect=ForjdError(503, "down"),
    ),
  ):
    response = client.get(
      "/api/v1/system-status/status_pages",
      HTTP_AUTHORIZATION="Bearer mock-token-pages-pages@example.com",
    )
  assert response.status_code == 503
  body = response.json()
  assert body.get("detail")


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="1",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
def test_status_pages_public_directory_no_empty_on_outage(client: Client) -> None:
  """Anonymous explore must not invent an empty directory when FORJD is down."""
  with patch(
    "forjd.views._fetch_published_directory",
    new_callable=AsyncMock,
    side_effect=ForjdError(503, "down"),
  ):
    response = client.get("/api/v1/system-status/status_pages")
  assert response.status_code == 503
  body = response.json()
  assert body.get("detail")


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="1",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
def test_status_pages_owned_list_malformed_envelope_fails_closed(client: Client) -> None:
  """A 200 without ``pages`` must not look like zero owned sites."""
  user = User.objects.create_user(username="badpages")
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  upstream = ForjdResponse(
    status=200,
    body=b'{"ok": true}',
    content_type="application/json",
  )
  with (
    override_settings(FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099"),
    patch(
      "forjd.clients.ForjdClient.proxy",
      new_callable=AsyncMock,
      return_value=upstream,
    ),
  ):
    response = client.get(
      "/api/v1/system-status/status_pages",
      HTTP_AUTHORIZATION="Bearer mock-token-badpages-badpages@example.com",
    )
  # AdapterError ≥500 is mapped to 503 FORJD_DEGRADED — never invent [].
  assert response.status_code == 503
  body = response.json()
  assert body.get("detail")
  assert body.get("code") == "forjd_degraded"


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="1",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
def test_retired_vulnerabilities_facade_is_unavailable(client: Client) -> None:
  user = User.objects.create_user(username="vulns")
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  with override_settings(FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099"):
    response = client.get(
      "/api/v1/agent/vulnerabilities",
      HTTP_AUTHORIZATION="Bearer mock-token-vulns-vulns@example.com",
    )
  assert response.status_code in {501, 503, 404}
  assert response.status_code != 200
