"""Cross-cutting error envelope (all UC-* BFF JSON errors)."""

from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ErrorCode(StrEnum):
  FORJD_DEGRADED = "forjd_degraded"
  FORJD_FORBIDDEN = "forjd_forbidden"
  PRO_REQUIRED = "pro_required"
  VALIDATION_ERROR = "validation_error"
  # Live middleware wire values (prefer these over the generic alias).
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded"
  RATE_LIMITER_UNAVAILABLE = "rate_limiter_unavailable"
  RATE_LIMITED = "rate_limited"  # alias — prefer RATE_LIMIT_EXCEEDED
  NOT_AUTHENTICATED = "not_authenticated"
  NOT_FOUND = "not_found"
  CHECKOUT_DISABLED = "checkout_disabled"
  LIFECYCLE_BLOCKED = "lifecycle_blocked"
  LIVE_UPDATES_DISABLED = "live_updates_disabled"
  FORJD_READS_DISABLED = "forjd_reads_disabled"
  FORJD_WRITES_DISABLED = "forjd_writes_disabled"


class ErrorEnvelope(BaseModel):
  model_config = ConfigDict(extra="forbid")

  detail: str = Field(min_length=1)
  code: ErrorCode | None = None


ForjdDegradedCode = Literal["forjd_degraded"]
