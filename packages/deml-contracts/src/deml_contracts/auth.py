"""UC-AUTH-001..006 auth DTOs (DEML control-plane wire shapes)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class AuthUserResponse(BaseModel):
  """GET /api/v1/auth/user and related success envelopes."""

  model_config = ConfigDict(extra="forbid")

  status: str
  # Human display name only — never a Firebase UID fallback.
  user: str | None = None
  display_name: str | None = None
  user_id: int | None = None
  role: str | None = None


# Alias kept for OpenAPI / call-site clarity (same shape as AuthUserResponse).
SuccessSchema = AuthUserResponse


class DeleteAccountOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  status: str
  job_id: str | None = None
  completed: bool = False


class APIKeyGenerateIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  name: str = "Integration Key"


class APIKeyGenerateOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  status: str
  name: str
  key: str = Field(pattern=r"^deml_")
  prefix: str


class APIKeyOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  id: str
  name: str
  prefix: str
  created_at: str


class HandoffGenerateIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  code_challenge: str | None = None
  client_name: str = "web"


class HandoffGenerateOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  status: str
  token: str


class HandoffVerifyIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  token: str
  code_verifier: str | None = None


class DesktopAuthOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  status: str
  user: str | None = None
  display_name: str | None = None
  email: str
  user_id: int
  role: str
  desktop_token: str | None = None


class DesktopSessionIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  desktop_token: str


class SessionRegisterIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  session_id: str
  user_agent: str = ""


class SessionRegisterOut(BaseModel):
  model_config = ConfigDict(extra="forbid")

  status: str
  session_id: str


class SessionOut(BaseModel):
  """GET /api/v1/auth/sessions item (unix timestamps)."""

  model_config = ConfigDict(extra="forbid")

  session_id: str
  user_agent: str = ""
  ip: str = ""
  created_at: int = 0
  last_seen: int = 0


class LogoutIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  session_id: str | None = None
  revoke_all: bool = False


DemlRole = Literal["Viewer", "Operator", "Security Admin"]
