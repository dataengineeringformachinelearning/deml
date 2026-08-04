"""UC-CONSENT-001/002 contract tests — deml_contracts factories + dual paths."""

from __future__ import annotations

import json
import logging

import pytest
from deml_contracts import (
  ConsentRecordOut,
  NewsletterSubscribeOut,
  make_consent_in,
  make_newsletter_in,
)
from django.test import Client


@pytest.mark.usecase("UC-CONSENT-001")
def test_consent_in_factory_matches_contract() -> None:
  payload = make_consent_in(analytical=True, marketing=False)
  assert payload.necessary is True
  assert payload.analytical is True
  assert payload.model_dump() == {
    "necessary": True,
    "analytical": True,
    "marketing": False,
  }


@pytest.mark.django_db
@pytest.mark.usecase("UC-CONSENT-001")
def test_cookie_consent_telemetry_and_users_paths(
  client: Client, caplog: pytest.LogCaptureFixture
) -> None:
  body = make_consent_in(analytical=True, marketing=True).model_dump()
  with caplog.at_level(logging.INFO):
    telemetry = client.post(
      "/api/v1/telemetry/cookie-consent",
      data=json.dumps(body),
      content_type="application/json",
    )
    assert telemetry.status_code == 200
    out = ConsentRecordOut.model_validate(telemetry.json())
    assert out.status == "success"

    ninja = client.post(
      "/api/v1/users/consent",
      data=json.dumps(body),
      content_type="application/json",
    )
    assert ninja.status_code == 200
    ninja_out = ConsentRecordOut.model_validate(ninja.json())
    assert ninja_out.status == "recorded"
  assert "consent_recorded" in caplog.text


@pytest.mark.django_db
@pytest.mark.usecase("UC-CONSENT-002")
def test_newsletter_rejects_without_consent(client: Client) -> None:
  payload = make_newsletter_in(consent_accepted=False).model_dump()
  response = client.post(
    "/api/v1/telemetry/subscribe",
    data=json.dumps(payload),
    content_type="application/json",
  )
  assert response.status_code == 400


@pytest.mark.django_db
@pytest.mark.usecase("UC-CONSENT-002")
def test_newsletter_subscribe_paths(client: Client, caplog: pytest.LogCaptureFixture) -> None:
  payload = make_newsletter_in(email="reader@example.com").model_dump()
  with caplog.at_level(logging.INFO):
    telemetry = client.post(
      "/api/v1/telemetry/subscribe",
      data=json.dumps(payload),
      content_type="application/json",
    )
    assert telemetry.status_code == 200
    assert NewsletterSubscribeOut.model_validate(telemetry.json()).status == "success"

    ninja = client.post(
      "/api/v1/users/newsletter",
      data=json.dumps(payload),
      content_type="application/json",
    )
    assert ninja.status_code == 200
    assert NewsletterSubscribeOut.model_validate(ninja.json()).status == "subscribed"
  assert "newsletter_subscribed" in caplog.text
  # PII: email must not appear in structured subscribe logs.
  assert "reader@example.com" not in caplog.text
