"""Typed configuration shape for DEML env inventory (catalog companion).

Runtime Django settings still live in ``backend/config/settings.py``.
This module is the importable contract for required keys / layers used by
``scripts/check_config_catalog.py`` consumers and fail-fast helpers.
"""

from __future__ import annotations

from enum import StrEnum
from typing import Final, Literal

from pydantic import BaseModel, ConfigDict, Field


class ConfigLayer(StrEnum):
  BACKEND = "backend"
  FRONTEND = "frontend"
  TOOLING = "tooling"
  INFRA = "infra"


class RequiredOn(StrEnum):
  PAAS = "paas"
  FLY = "fly"
  RAILWAY = "railway"
  VERCEL = "vercel"
  LOCAL = "local"


class EnvVarSpec(BaseModel):
  model_config = ConfigDict(extra="forbid")

  name: str = Field(pattern=r"^[A-Z][A-Z0-9_]*$")
  layers: list[ConfigLayer]
  secret: bool = False
  required_on: list[RequiredOn] = Field(default_factory=list)
  group: str = "app"
  default: str | None = None


# Keys that PaaS (Fly/Railway) must supply when FORJD modes are active.
PAAS_FORJD_REQUIRED: Final[tuple[str, ...]] = (
  "FORJD_API_URL",
  "FORJD_SERVICE_TOKEN",
  "FORJD_TENANT_ID",
)

# Keys Vercel production builds must supply (set-env.js fail-fast).
VERCEL_FRONTEND_REQUIRED: Final[tuple[str, ...]] = (
  "FIREBASE_API_KEY",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_APP_ID",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_MESSAGING_SENDER_ID",
  "BACKEND_URL",
  "FRONTEND_URL",
)

SUITE_URL_DEFAULTS: Final[dict[str, str]] = {
  "FRONTEND_URL": "https://deml.app",
  "BACKEND_URL": "https://backend.deml.app",
  "MARKETING_URL": "https://dataengineeringformachinelearning.com",
  "FORJD_API_URL": "https://backend.forjd.co",
}

HealthPath = Literal["/api/v1/health", "/api/v1/ready"]
LIVENESS_PATH: Final[HealthPath] = "/api/v1/health"
READINESS_PATH: Final[HealthPath] = "/api/v1/ready"
