"""UC-HEALTH-001 readiness contract."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


class ReadyResponse(BaseModel):
  model_config = ConfigDict(extra="allow")

  status: Literal["ok", "ready", "degraded"]
  # ``unreachable`` is the soft-probe miss from GET /api/v1/ready (UC-HEALTH-001).
  forjd_health: (
    Literal["ok", "degraded", "unknown", "unconfigured", "unreachable"] | None
  ) = None
  mode: Literal["full", "degraded"] | None = None
  forjd_read_mode: Literal["off", "forjd", "dual"] | None = None
  forjd_write_mode: Literal["off", "forjd", "dual"] | None = None
  role: str | None = None
  database: str | None = None
  forjd_api_url: str | None = None
  forjd_token_configured: bool | None = None
  forjd_tenant_configured: bool | None = None
