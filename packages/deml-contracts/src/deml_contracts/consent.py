"""UC-CONSENT-001/002 cookie consent + newsletter wire shapes."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ConsentIn(BaseModel):
  """POST /api/v1/users/consent and /api/v1/telemetry/cookie-consent body."""

  model_config = ConfigDict(extra="forbid")

  necessary: bool = True
  analytical: bool = False
  marketing: bool = False


class ConsentRecordOut(BaseModel):
  """Consent persist acknowledgement (dual status kept for path parity)."""

  model_config = ConfigDict(extra="forbid")

  status: Literal["success", "recorded"]
  id: str = Field(min_length=1)


class NewsletterIn(BaseModel):
  """POST /api/v1/users/newsletter and /api/v1/telemetry/subscribe body."""

  model_config = ConfigDict(extra="forbid")

  email: str = Field(min_length=3, max_length=254)
  consent_accepted: bool


class NewsletterSubscribeOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  status: Literal["success", "subscribed"]
  id: str = Field(min_length=1)
