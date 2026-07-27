"""UC-AUTH-002/004/005 HTTP contract tests against deml_contracts wire shapes."""

from __future__ import annotations

import json
import logging

import pytest
from deml_contracts import (
  APIKeyGenerateOut,
  LogoutIn,
  SessionOut,
  SessionRegisterIn,
  SessionRegisterOut,
  SuccessSchema,
)
from django.test import Client


@pytest.mark.django_db
@pytest.mark.usecase("UC-AUTH-002")
def test_session_register_list_revoke(client: Client, caplog: pytest.LogCaptureFixture) -> None:
  auth = "Bearer mock-token-sessuser-sessuser@example.com"
  register_body = SessionRegisterIn(session_id="sess-contract-1", user_agent="pytest").model_dump()
  with caplog.at_level(logging.INFO):
    created = client.post(
      "/api/v1/auth/sessions",
      data=json.dumps(register_body),
      content_type="application/json",
      HTTP_AUTHORIZATION=auth,
    )
  assert created.status_code == 200
  assert SessionRegisterOut.model_validate(created.json()).session_id == "sess-contract-1"
  assert "session_registered" in caplog.text

  listed = client.get("/api/v1/auth/sessions", HTTP_AUTHORIZATION=auth)
  assert listed.status_code == 200
  sessions = [SessionOut.model_validate(item) for item in listed.json()]
  assert any(item.session_id == "sess-contract-1" for item in sessions)

  revoked = client.delete(
    "/api/v1/auth/sessions/sess-contract-1",
    HTTP_AUTHORIZATION=auth,
  )
  assert revoked.status_code == 200
  SuccessSchema.model_validate(revoked.json())


@pytest.mark.django_db
@pytest.mark.usecase("UC-AUTH-004")
def test_logout_revokes_session(client: Client, caplog: pytest.LogCaptureFixture) -> None:
  auth = "Bearer mock-token-logoutuser-logoutuser@example.com"
  client.post(
    "/api/v1/auth/sessions",
    data=json.dumps({"session_id": "sess-logout-1", "user_agent": "pytest"}),
    content_type="application/json",
    HTTP_AUTHORIZATION=auth,
  )
  with caplog.at_level(logging.INFO):
    response = client.post(
      "/api/v1/auth/logout",
      data=json.dumps(LogoutIn(session_id="sess-logout-1").model_dump()),
      content_type="application/json",
      HTTP_AUTHORIZATION=auth,
    )
  assert response.status_code == 200
  SuccessSchema.model_validate(response.json())
  assert "logout_completed" in caplog.text


@pytest.mark.django_db
@pytest.mark.usecase("UC-AUTH-005")
def test_api_key_generate_list_revoke(client: Client, caplog: pytest.LogCaptureFixture) -> None:
  auth = "Bearer mock-token-keyuser-keyuser@example.com"
  with caplog.at_level(logging.INFO):
    generated = client.post(
      "/api/v1/auth/api-keys/generate",
      data=json.dumps({"name": "Contract Key"}),
      content_type="application/json",
      HTTP_AUTHORIZATION=auth,
    )
  assert generated.status_code == 200
  key_out = APIKeyGenerateOut.model_validate(generated.json())
  assert key_out.key.startswith("deml_")
  assert "api_key_generated" in caplog.text

  listed = client.get("/api/v1/auth/api-keys", HTTP_AUTHORIZATION=auth)
  assert listed.status_code == 200
  assert any(item["prefix"] == key_out.prefix for item in listed.json())

  key_id = listed.json()[0]["id"]
  with caplog.at_level(logging.INFO):
    revoked = client.delete(f"/api/v1/auth/api-keys/{key_id}", HTTP_AUTHORIZATION=auth)
  assert revoked.status_code == 200
  assert "api_key_revoked" in caplog.text
