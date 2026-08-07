"""Regression coverage for the user-control-plane API boundary."""

from typing import Any, Final

import pytest
from django.test import Client


@pytest.mark.django_db
def test_openapi_exposes_forjd_handoff_and_no_local_processing(client: Client) -> None:
  response = client.get("/api/v1/openapi.json")

  assert response.status_code == 200
  payload: dict[str, Any] = response.json()
  paths: dict[str, Any] = payload.get("paths", {})
  assert "post" in paths["/api/v1/forjd/ingest"]
  assert "post" in paths["/api/v1/forjd/ingest/events:batch"]
  assert (
    payload["components"]["schemas"]["SealedEventBatch"]["properties"]["events"]["maxItems"] == 25
  )

  serialized_contract = str(payload)
  assert "application/forjd-telemetry+v1" in serialized_contract
  assert "deml_telemetry" in serialized_contract
  assert "deml_learning" not in serialized_contract
  assert "/api/v1/deml-compat" not in serialized_contract

  retired_prefixes: Final[tuple[str, ...]] = (
    "/api/v1/ingest",
    "/api/v1/predict",
    "/api/v1/ml/",
    "/api/v1/telemetry/",
    "/api/v1/analytics/",
    "/api/v1/exports/",
    "/api/v1/system-status/",
  )
  assert not any(path.startswith(retired_prefixes) for path in paths)


@pytest.mark.django_db
def test_html_docs_shells_redirect_to_community(client: Client) -> None:
  community = "https://dataengineeringformachinelearning.com/documentation"
  for path in ("/api/v1/docs", "/api/v1/redoc", "/documentation"):
    response = client.get(path)
    assert response.status_code == 301
    assert response["Location"] == community


@pytest.mark.django_db
def test_home_splash_points_to_community_docs(client: Client) -> None:
  home = client.get("/")
  assert home.status_code == 200
  home_body = home.content.decode()
  assert "backend-splash" in home_body
  assert "suite-backend-shell" in home_body
  assert "suite-backend-logo" in home_body
  assert "suite-backend-nav" in home_body
  assert "banner banner--hero" in home_body
  assert "dataengineeringformachinelearning.svg" in home_body
  assert "Accounts and status for your services." in home_body
  assert "/documentation" in home_body
  assert "/api/v1/docs" not in home_body
  assert "Swagger UI" not in home_body
  assert "Control plane, not data plane" not in home_body
