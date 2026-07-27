"""UC-BILL-001..003 billing wire shapes (DEML control plane)."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CheckoutSessionOut(BaseModel):
  """POST /api/v1/billing/create-checkout-session success body."""

  model_config = ConfigDict(extra="forbid")

  checkout_url: str = Field(min_length=1)


class BillingSyncOut(BaseModel):
  """POST /api/v1/billing/sync success body."""

  model_config = ConfigDict(extra="forbid")

  status: Literal["synced"]
  active: bool
  cancel_at_period_end: bool = False
  message: str | None = None


class SubscriptionMutateOut(BaseModel):
  """POST cancel-subscription / resume-subscription success body."""

  model_config = ConfigDict(extra="forbid")

  status: Literal["cancelled", "resumed"]
  cancel_at_period_end: bool


class BillingErrorOut(BaseModel):
  """Legacy billing error envelope (`error` key, not `detail`)."""

  model_config = ConfigDict(extra="forbid")

  error: str = Field(min_length=1)
