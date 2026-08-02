"""UC-ANALYTICS-001 live SSE payloads."""

from __future__ import annotations

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LiveSseReady(BaseModel):
  model_config = ConfigDict(extra="forbid")

  type: Literal["ready"] = "ready"
  tenant_id: UUID | None = None


class LiveSseProjections(BaseModel):
  model_config = ConfigDict(extra="forbid")

  type: Literal["projections"] = "projections"
  count: int = Field(ge=0)
  cursor: str = Field(min_length=1)


class LiveSseDegraded(BaseModel):
  model_config = ConfigDict(extra="forbid")

  type: Literal["degraded"] = "degraded"
  code: Literal["forjd_degraded"] = "forjd_degraded"
  detail: str | None = None


class LiveSseEnd(BaseModel):
  model_config = ConfigDict(extra="forbid")

  type: Literal["end"] = "end"
  reason: str | None = None
