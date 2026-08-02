"""UC-ANALYTICS-003 SOAR action control bodies."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PlaybookActionAckIn(BaseModel):
  model_config = ConfigDict(extra="forbid")

  succeeded: bool
  external_reference: str | None = Field(default=None, max_length=255)
  metadata: dict[str, Any] | None = None


class PlaybookActionRetryIn(BaseModel):
  model_config = ConfigDict(extra="forbid")
