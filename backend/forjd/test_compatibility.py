from forjd.testing import create_product_forjd_mapping
import json
from unittest.mock import AsyncMock, MagicMock, patch
from urllib.parse import parse_qs
from uuid import UUID, uuid4

import pytest
from django.contrib.auth import get_user_model
from django.test import Client, override_settings
from monitor.models import ForjdTenantMapping

from forjd.client import ForjdResponse

User = get_user_model()


def _mapped_user(username: str = "learner") -> UUID:
  user = User.objects.create_user(username=username)
  user.profile.role = "Operator"
  user.profile.tier = "Pro"
  user.profile.subscription_active = True
  user.profile.save(update_fields=["role", "tier", "subscription_active"])
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  return tenant_id


def _sealed_event(tenant_id: UUID) -> dict[str, object]:
  return {
    "tenant_id": str(tenant_id),
    "client_event_id": "metric-event-1",
    "content_type": "application/forjd-telemetry+v1",
    "event_type": "deml.metric",
    "schema_version": 1,
    "workflow_id": "deml_telemetry",
    "encryption": {"mode": "e2ee", "algo": "aes-256-gcm"},
    "envelope": {
      "algo": "aes-256-gcm",
      "key_id": "key-1",
      "nonce": "AAAAAAAAAAAAAAAA",
      "ciphertext": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
      "ciphertext_sha256": "9d908ecfb6b256def8b49a7c504e6c889c4b0e41fe6ce3e01863dd7b61a20aa0",  # pragma: allowlist secret
    },
    "metadata": {"source": "deml-web", "channel": "telemetry"},
  }


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_private_native_route_requires_authentication(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  response = client.get("/api/v1/projections")

  assert response.status_code == 401
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_private_native_route_rejects_cookie_session_without_firebase_bearer(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  user = User.objects.create_user(username="session-only")
  client.force_login(user)

  response = client.get("/api/v1/projections")

  assert response.status_code == 401
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_authenticated_status_adapter_uses_mapped_tenant(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  tenant_id = _mapped_user()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=json.dumps({"ok": True, "pages": []}).encode(),
    content_type="application/json",
  )

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.get(
      "/api/v1/system-status/status_pages",
      HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
    )

  assert response.status_code == 200
  call = mock_proxy.await_args
  assert call.args[:2] == ("GET", "/api/v1/status/pages")
  assert f"tenant_id={tenant_id}" in (call.kwargs.get("query_string") or "")
  assert UUID(call.kwargs["request_id"])


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_retired_ml_threat_report_is_unavailable(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  _mapped_user("threatreader")

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.get(
      "/api/v1/ml/threat-intel/report",
      HTTP_AUTHORIZATION="Bearer mock-token-threatreader-threatreader@example.com",
    )

  assert response.status_code in {501, 503, 404}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_retired_ml_threat_train_is_unavailable(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  _mapped_user("threattrainer")

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.post(
      "/api/v1/ml/threat-intel/train",
      data={},
      content_type="application/json",
      HTTP_AUTHORIZATION="Bearer mock-token-threattrainer-threattrainer@example.com",
    )

  assert response.status_code in {403, 501, 503, 404}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_retired_projections_facade_is_unavailable(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  _mapped_user()

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.get(
      f"/api/v1/projections?tenant_id={uuid4()}",
      HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
    )

  assert response.status_code in {501, 503, 404}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_stable_ingest_path_forwards_only_valid_sealed_telemetry(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  tenant_id = _mapped_user()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=b'{"ok": true, "accepted": 1}',
    content_type="application/json",
  )

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.post(
      "/api/v1/ingest",
      data=_sealed_event(tenant_id),
      content_type="application/json",
      HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
    )

  assert response.status_code == 200
  call = mock_proxy.await_args
  assert call.args == ("POST", "/api/v1/ingest")
  forwarded = json.loads(call.kwargs["body"])
  assert forwarded["tenant_id"] == str(tenant_id)
  assert forwarded["workflow_id"] == "threat_telemetry"
  assert forwarded["event_type"] == "threat.metric"
  assert "actor_headers" not in call.kwargs


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_retired_projections_run_is_unavailable(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  tenant_id = _mapped_user()

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.post(
      "/api/v1/projections/run",
      data={"tenant_id": str(tenant_id), "workflow_id": "deml_telemetry"},
      content_type="application/json",
      HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
    )

  assert response.status_code in {501, 503, 404}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.parametrize("path", ["/api/v1/ingest", "/api/v1/ingest/events"])
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_stable_ingest_path_rejects_unshipped_learning_contract(
  mock_proxy: AsyncMock,
  client: Client,
  path: str,
) -> None:
  tenant_id = _mapped_user()
  payload = {
    **_sealed_event(tenant_id),
    "content_type": "application/vnd.deml.learning-event+json;version=1",
    "event_type": "lesson.started",
    "workflow_id": "deml_learning_v1",
  }

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.post(
      path,
      data=payload,
      content_type="application/json",
      HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
    )

  assert response.status_code == 422
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.parametrize(
  ("path", "target_path"),
  [
    ("/api/v1/system-status/health", "/health"),
    ("/api/v1/system-status/ready", "/ready"),
  ],
)
@patch("forjd.clients.ForjdClient")
def test_public_probes_use_shipped_forjd_paths_without_tenant_credentials(
  mock_client: MagicMock,
  client: Client,
  path: str,
  target_path: str,
) -> None:
  mock_proxy = AsyncMock()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=b'{"status": "operational"}',
    content_type="application/json",
  )
  mock_client.return_value.proxy = mock_proxy

  with override_settings(FORJD_SERVICE_TOKEN="", FORJD_TENANT_ID=""):
    response = client.get(path)

  assert response.status_code == 200
  mock_client.assert_called_once_with(use_service_auth=False)
  assert mock_proxy.await_args.args == ("GET", target_path)


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="2",
  FORJD_READ_MODE="forjd",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
  FORJD_TENANT_ID="ded3e76a-64ca-44c9-aa90-cb6a4868fc4f",
)
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_anonymous_status_services_require_published_page(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  """Anonymous service reads must not leak unpublished page detail.

  Public clients use the embedded slug payload — BFF never calls FORJD with the
  platform tenant_id + a foreign page_id after the published check.
  """
  pages_body = json.dumps(
    {
      "ok": True,
      "pages": [
        {
          "id": "page-draft",
          "slug": "draft-page",
          "title": "Draft",
          "is_published": False,
        },
        {
          "id": "page-public",
          "slug": "public-page",
          "title": "Public",
          "is_published": True,
        },
      ],
    }
  ).encode()

  async def _proxy(method: str, path: str, **_kwargs: object) -> ForjdResponse:
    if path == "/api/v1/status/pages/published":
      return ForjdResponse(status=200, body=pages_body, content_type="application/json")
    raise AssertionError(f"unexpected FORJD path for anonymous services: {path}")

  mock_proxy.side_effect = _proxy

  denied = client.get("/api/v1/system-status/status_pages/page-draft/services")
  allowed = client.get("/api/v1/system-status/status_pages/page-public/services")

  assert denied.status_code == 404
  assert allowed.status_code == 200
  assert allowed.json() == []
  assert mock_proxy.await_count == 2  # published check only (denied + allowed)


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="2",
  FORJD_READ_MODE="forjd",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
  FORJD_TENANT_ID="ded3e76a-64ca-44c9-aa90-cb6a4868fc4f",
)
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_anonymous_status_pages_list_returns_published_directory(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  """Explore directory must work without Firebase auth (cross-tenant published)."""
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=json.dumps(
      {
        "ok": True,
        "pages": [
          {
            "id": "page-public",
            "slug": "joealongi-dev",
            "title": "joealongi.dev",
            "description": "Personal site status",
            "is_published": True,
            "created_at": "2026-07-19T00:00:00Z",
            "total_requests": 12,
            "p99_latency": 42.0,
          },
          {
            "id": "page-draft",
            "slug": "draft-page",
            "title": "Draft",
            "description": "",
            "is_published": False,
            "created_at": "2026-07-19T00:00:00Z",
          },
          {
            "id": "page-platform",
            "slug": "platform-status",
            "title": "Platform Status",
            "description": "",
            "is_published": True,
            "created_at": "2026-07-19T00:00:00Z",
            "total_requests": 4953,
            "p99_latency": 5.0,
          },
        ],
      }
    ).encode(),
    content_type="application/json",
  )

  response = client.get("/api/v1/system-status/status_pages")
  slash_response = client.get("/api/v1/system-status/status_pages/")

  assert response.status_code == 200
  assert slash_response.status_code == 200
  pages = response.json()
  assert {page["slug"] for page in pages} == {"joealongi-dev", "platform-status"}
  by_slug = {page["slug"]: page for page in pages}
  assert by_slug["joealongi-dev"]["total_requests"] == 12
  assert by_slug["platform-status"]["total_requests"] == 4953
  assert slash_response.json() == pages
  assert mock_proxy.await_args.args[:2] == ("GET", "/api/v1/status/pages/published")
  assert mock_proxy.await_args.kwargs.get("query_string") in ("", None)


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="2",
  FORJD_READ_MODE="forjd",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
)
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_authenticated_status_pages_list_excludes_platform_and_skips_directory(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  """Settings sites must be tenant-scoped and never include platform-status."""
  tenant_id = _mapped_user("sitesowner")
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=json.dumps(
      {
        "ok": True,
        "pages": [
          {
            "id": "page-mine",
            "slug": "joealongi-dev",
            "title": "joealongi.dev",
            "description": "",
            "is_published": True,
            "created_at": "2026-07-19T00:00:00Z",
          },
          {
            "id": "page-platform",
            "slug": "platform-status",
            "title": "Platform Status",
            "description": "",
            "is_published": True,
            "created_at": "2026-07-19T00:00:00Z",
          },
        ],
      }
    ).encode(),
    content_type="application/json",
  )

  with override_settings(FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099"):
    response = client.get(
      "/api/v1/system-status/status_pages",
      HTTP_AUTHORIZATION="Bearer mock-token-sitesowner-sitesowner@example.com",
    )

  assert response.status_code == 200
  pages = response.json()
  assert {page["slug"] for page in pages} == {"joealongi-dev"}
  assert mock_proxy.await_args.args[:2] == ("GET", "/api/v1/status/pages")
  assert f"tenant_id={tenant_id}" in (mock_proxy.await_args.kwargs.get("query_string") or "")


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient")
def test_public_status_page_unwraps_forjd_response_for_existing_angular_shape(
  mock_client: MagicMock,
  client: Client,
) -> None:
  mock_proxy = AsyncMock()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=(
      b'{"ok":true,"page":{"id":"page-1","tenant_id":"ded3e76a-64ca-44c9-aa90-cb6a4868fc4f",'
      b'"slug":"public-page","title":"Public"}}'
    ),
    content_type="application/json",
  )
  mock_client.return_value.proxy = mock_proxy

  with override_settings(FORJD_SERVICE_TOKEN="", FORJD_TENANT_ID=""):
    response = client.get("/api/v1/system-status/status_pages/slug/public-page")

  assert response.status_code == 200
  body = response.json()
  assert body["id"] == "page-1"
  assert body["slug"] == "public-page"
  assert body["title"] == "Public"
  assert body["services"] == []
  assert body["incidents"] == []
  assert body["uptime_history"] == []
  assert "tenant_id" not in body
  mock_client.assert_called_once_with(use_service_auth=False)
  assert mock_proxy.await_args.args == ("GET", "/api/v1/status/pages/slug/public-page")


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient")
def test_public_status_page_reshapes_embedded_services_for_angular(
  mock_client: MagicMock,
  client: Client,
) -> None:
  """Anonymous visitors get Angular-shaped services/incidents inline."""
  mock_proxy = AsyncMock()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=json.dumps(
      {
        "ok": True,
        "page": {
          "id": "page-1",
          "slug": "public-page",
          "title": "Public",
          "spiking_temporal_forecast": 0,
          "temporal_status": "ready",
          "temporal_backend": "gru_mlp",
          "temporal_sample_count": 128,
          "temporal_scored_at": "2026-07-23T00:00:00Z",
          "uses_norse": False,
          "services": [
            {
              "id": "svc-1",
              "name": "deml.app",
              "status": "operational",
              "description": "Angular application",
              "sort_order": 1,
              "updated_at": "2026-07-19T00:00:00+00:00",
            }
          ],
          "incidents": [],
        },
      }
    ).encode(),
    content_type="application/json",
  )
  mock_client.return_value.proxy = mock_proxy

  with override_settings(FORJD_SERVICE_TOKEN="", FORJD_TENANT_ID=""):
    response = client.get("/api/v1/system-status/status_pages/slug/public-page")

  assert response.status_code == 200
  payload = response.json()
  assert payload["services"] == [
    {
      "id": "svc-1",
      "name": "deml.app",
      "url": "Angular application",
      "status_page_id": "page-1",
      "created_at": "2026-07-19T00:00:00+00:00",
      "status": "Operational",
      "sla": None,
      "uptime_history": [],
      "p99_latency": None,
    }
  ]
  assert payload["incidents"] == []
  assert payload["spiking_temporal_forecast"] == 0
  assert payload["temporal_status"] == "ready"
  assert payload["temporal_backend"] == "gru_mlp"
  assert payload["temporal_sample_count"] == 128
  assert payload["temporal_scored_at"] == "2026-07-23T00:00:00Z"
  assert payload["uses_norse"] is False
  assert "tenant_id" not in payload


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient")
def test_public_status_page_maps_forjd_status_enums_to_legacy_labels(
  mock_client: MagicMock,
  client: Client,
) -> None:
  """FORJD lowercase enums must surface as the legacy Angular/widget labels."""
  mock_proxy = AsyncMock()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=json.dumps(
      {
        "ok": True,
        "page": {
          "id": "page-1",
          "slug": "joealongi-dev",
          "title": "joealongi.dev",
          "is_published": True,
          "services": [
            {
              "id": "svc-1",
              "name": "Primary Site",
              "status": "major_outage",
              "description": "https://joealongi.dev",
              "updated_at": "2026-07-19T00:00:00+00:00",
            },
            {
              "id": "svc-2",
              "name": "API Gateway",
              "status": "partial_outage",
              "description": "https://backend.deml.app/api/v1/health",
              "updated_at": "2026-07-19T00:00:00+00:00",
            },
          ],
          "incidents": [
            {
              "id": "inc-1",
              "title": "Historic outage",
              "status": "resolved",
              "body": "Resolved after failover.",
              "started_at": "2026-07-18T00:00:00+00:00",
            },
            {
              "id": "inc-2",
              "title": "Elevated latency",
              "status": "investigating",
              "body": "Looking into it.",
              "started_at": "2026-07-19T00:00:00+00:00",
            },
          ],
        },
      }
    ).encode(),
    content_type="application/json",
  )
  mock_client.return_value.proxy = mock_proxy

  with override_settings(FORJD_SERVICE_TOKEN="", FORJD_TENANT_ID=""):
    response = client.get("/api/v1/system-status/status_pages/slug/joealongi-dev")

  assert response.status_code == 200
  payload = response.json()
  assert [service["status"] for service in payload["services"]] == ["Outage", "Degraded"]
  assert [incident["status"] for incident in payload["incidents"]] == [
    "Resolved",
    "Investigating",
  ]


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient")
def test_public_status_page_unknown_slug_returns_clean_404(
  mock_client: MagicMock,
  client: Client,
) -> None:
  """Unpublished or unknown slugs surface FORJD's 404 as a clean widget error."""
  mock_proxy = AsyncMock()
  mock_proxy.return_value = ForjdResponse(
    status=404,
    body=b'{"detail":"status page not found"}',
    content_type="application/json",
  )
  mock_client.return_value.proxy = mock_proxy

  with override_settings(FORJD_SERVICE_TOKEN="", FORJD_TENANT_ID=""):
    response = client.get("/api/v1/system-status/status_pages/slug/missing-page")

  # Clean 404 when FORJD answers; 503 when slug self-heal cannot complete.
  assert response.status_code in {404, 503}
  body = response.json()
  if response.status_code == 404:
    assert body["detail"] == "status page not found"
    assert body["code"] == "forjd_request_rejected"
    assert body["source"] == "forjd"
  else:
    assert body.get("code") in {"forjd_degraded", "forjd_capability_unavailable", None} or (
      "unable" in str(body.get("detail", "")).lower()
      or "degraded" in str(body.get("detail", "")).lower()
      or "forjd" in str(body.get("detail", "")).lower()
    )


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="2",
  FORJD_READ_MODE="forjd",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
  FORJD_TENANT_ID="ded3e76a-64ca-44c9-aa90-cb6a4868fc4f",
)
@patch("forjd.clients.ForjdClient")
def test_public_status_page_resolves_domain_style_slug_alias(
  mock_client: MagicMock,
  client: Client,
) -> None:
  """Domain-style URLs (joealongi.dev) resolve to the hyphenated FORJD slug."""
  page_body = json.dumps(
    {
      "ok": True,
      "page": {
        "id": "page-1",
        "slug": "joealongi-dev",
        "title": "joealongi.dev",
        "is_published": True,
        "services": [],
        "incidents": [],
      },
    }
  ).encode()

  async def _proxy(_method: str, path: str, **_kwargs: object) -> ForjdResponse:
    if path == "/api/v1/status/pages/slug/joealongi-dev":
      return ForjdResponse(status=200, body=page_body, content_type="application/json")
    return ForjdResponse(
      status=404,
      body=b'{"detail":"status page not found"}',
      content_type="application/json",
    )

  mock_proxy = AsyncMock(side_effect=_proxy)
  mock_client.return_value.proxy = mock_proxy
  mock_client.return_value.tenant_id = "ded3e76a-64ca-44c9-aa90-cb6a4868fc4f"

  response = client.get("/api/v1/system-status/status_pages/slug/joealongi.dev")

  assert response.status_code == 200
  assert response.json()["slug"] == "joealongi-dev"
  assert mock_proxy.await_args.args[:2] == ("GET", "/api/v1/status/pages/slug/joealongi-dev")


@pytest.mark.django_db
@override_settings(
  FORJD_CUTOVER_PHASE="2",
  FORJD_READ_MODE="forjd",
  FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
  FORJD_TENANT_ID="ded3e76a-64ca-44c9-aa90-cb6a4868fc4f",
)
@patch("forjd.clients.ForjdClient")
def test_public_status_page_resolves_legacy_embed_stem(
  mock_client: MagicMock,
  client: Client,
) -> None:
  """Legacy widget embeds (data-page-id=joealongi) resolve via unique prefix."""
  page_body = json.dumps(
    {
      "ok": True,
      "page": {
        "id": "page-1",
        "slug": "joealongi-dev",
        "title": "joealongi.dev",
        "is_published": True,
        "services": [],
        "incidents": [],
      },
    }
  ).encode()
  directory_body = json.dumps(
    {
      "ok": True,
      "pages": [
        {
          "id": "page-1",
          "slug": "joealongi-dev",
          "title": "joealongi.dev",
          "is_published": True,
          "created_at": "2026-07-19T00:00:00Z",
        },
        {
          "id": "page-platform",
          "slug": "platform-status",
          "title": "Platform Status",
          "is_published": True,
          "created_at": "2026-07-19T00:00:00Z",
        },
      ],
    }
  ).encode()

  async def _proxy(_method: str, path: str, **_kwargs: object) -> ForjdResponse:
    if path == "/api/v1/status/pages/slug/joealongi-dev":
      return ForjdResponse(status=200, body=page_body, content_type="application/json")
    if path == "/api/v1/status/pages/published":
      return ForjdResponse(status=200, body=directory_body, content_type="application/json")
    if path == "/api/v1/status/pages":
      return ForjdResponse(status=200, body=directory_body, content_type="application/json")
    return ForjdResponse(
      status=404,
      body=b'{"detail":"status page not found"}',
      content_type="application/json",
    )

  mock_proxy = AsyncMock(side_effect=_proxy)
  mock_client.return_value.proxy = mock_proxy
  mock_client.return_value.tenant_id = "ded3e76a-64ca-44c9-aa90-cb6a4868fc4f"

  response = client.get("/api/v1/system-status/status_pages/slug/joealongi")

  assert response.status_code == 200
  assert response.json()["slug"] == "joealongi-dev"


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_status_incident_create_normalizes_legacy_title_case_status(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  """Angular sends Title Case statuses; FORJD requires lowercase enums."""
  user = User.objects.create_user(username="statusadmin")
  user.profile.role = "Security Admin"
  user.profile.tier = "Pro"
  user.profile.subscription_active = True
  user.profile.save(update_fields=["role", "tier", "subscription_active"])
  tenant_id = uuid4()
  create_product_forjd_mapping(
    deml_account_id=user.profile.account_id,
    forjd_tenant_id=tenant_id,
  )
  page_id = str(uuid4())

  async def _proxy(method: str, path: str, **_kwargs: object) -> ForjdResponse:
    if method == "GET" and path in {"/api/v1/status/pages", f"/api/v1/status/pages/{page_id}"}:
      if path.endswith(f"/{page_id}"):
        body = {
          "ok": True,
          "page": {
            "id": page_id,
            "tenant_id": str(tenant_id),
            "slug": "ops",
            "title": "Ops",
            "is_published": True,
          },
        }
      else:
        body = {
          "ok": True,
          "pages": [
            {
              "id": page_id,
              "tenant_id": str(tenant_id),
              "slug": "ops",
              "title": "Ops",
              "is_published": True,
            }
          ],
        }
      return ForjdResponse(
        status=200,
        body=json.dumps(body).encode(),
        content_type="application/json",
      )
    if method == "POST" and path.endswith("/incidents"):
      return ForjdResponse(
        status=200,
        body=json.dumps(
          {
            "ok": True,
            "incident": {
              "id": "inc-1",
              "title": "Historic outage",
              "status": "resolved",
              "body": "Resolved after failover.",
              "started_at": "2026-07-18T00:00:00+00:00",
            },
          }
        ).encode(),
        content_type="application/json",
      )
    raise AssertionError(f"unexpected FORJD call {method} {path}")

  mock_proxy.side_effect = _proxy

  with override_settings(
    FORJD_SERVICE_TOKEN="fjsvc_deadbeef_test-secret",
    FORJD_TENANT_ID="00000000-0000-0000-0000-000000000099",
  ):
    response = client.post(
      f"/api/v1/system-status/status_pages/{page_id}/incidents",
      data={
        "title": "Historic outage",
        "message": "Resolved after failover.",
        "status": "Resolved",
      },
      content_type="application/json",
      HTTP_AUTHORIZATION="Bearer mock-token-statusadmin-statusadmin@example.com",
    )

  assert response.status_code == 200
  assert response.json()["status"] == "Resolved"
  create_call = mock_proxy.await_args_list[-1]
  outbound = json.loads(create_call.kwargs["body"])
  assert outbound["status"] == "resolved"


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient")
def test_public_status_page_rejects_invalid_forjd_response(
  mock_client: MagicMock,
  client: Client,
) -> None:
  mock_proxy = AsyncMock()
  mock_proxy.return_value = ForjdResponse(
    status=200,
    body=b'{"ok":true}',
    content_type="application/json",
  )
  mock_client.return_value.proxy = mock_proxy

  response = client.get("/api/v1/system-status/status_pages/slug/public-page")

  assert response.status_code == 503
  assert response.json()["code"] == "forjd_degraded"
  assert response.json()["source"] == "forjd"


@pytest.mark.django_db
@pytest.mark.parametrize(
  ("method", "path", "expect_credential_gate"),
  [
    ("get", "/api/v1/sessions", True),
    ("post", "/api/v1/sessions", True),
    ("delete", "/api/v1/sessions/session-1", True),
    ("post", "/api/v1/replay", False),
    ("get", "/api/v1/replay/dlq", False),
    ("post", f"/api/v1/replay/dlq/{uuid4()}/retry", False),
  ],
)
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_session_and_retired_replay_routes_fail_closed(
  mock_proxy: AsyncMock,
  client: Client,
  method: str,
  path: str,
  expect_credential_gate: bool,
) -> None:
  """Sessions stay mounted (credential gate); replay facades are retired (501)."""
  user = User.objects.create_user(username="learner")
  user.profile.role = "Security Admin"
  user.profile.tier = "Pro"
  user.profile.subscription_active = True
  user.profile.save(update_fields=["role", "tier", "subscription_active"])

  response = getattr(client, method)(
    path,
    data={},
    content_type="application/json",
    HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
  )

  if expect_credential_gate:
    assert response.status_code == 503
    assert "credential" in response.json()["detail"].lower()
  else:
    assert response.status_code in {501, 503, 404}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_retired_domain_and_summary_are_unavailable(
  mock_proxy: AsyncMock,
  client: Client,
) -> None:
  User.objects.create_user(username="learner")

  response = client.get(
    "/api/v1/agent/vulnerabilities",
    HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
  )
  status_response = client.get(
    "/api/v1/system-status/summary",
    HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
  )

  assert response.status_code in {501, 503, 404}
  assert status_response.status_code in {501, 404}
  mock_proxy.assert_not_awaited()


@pytest.mark.django_db
@pytest.mark.parametrize(
  ("method", "path"),
  [
    ("get", "/api/v1/analytics/overview"),
    ("get", "/api/v1/exports/"),
    ("post", "/api/v1/analytics/aggregate"),
    ("post", "/api/v1/integrations/security-alert"),
  ],
)
@patch("forjd.clients.ForjdClient.proxy", new_callable=AsyncMock)
def test_retired_domain_routes_are_unavailable_without_proxy(
  mock_proxy: AsyncMock,
  client: Client,
  method: str,
  path: str,
) -> None:
  User.objects.create_user(username="learner")

  response = getattr(client, method)(
    path,
    data={},
    content_type="application/json",
    HTTP_AUTHORIZATION="Bearer mock-token-learner-learner@example.com",
  )

  assert response.status_code in {403, 501, 503, 404}
  assert response.status_code != 200
  mock_proxy.assert_not_awaited()
