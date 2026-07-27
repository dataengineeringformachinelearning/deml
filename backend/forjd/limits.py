"""Shared DEML-side limits for the canonical FORJD ingest contract.

Batch/body caps are owned by ``deml_contracts``; this module re-exports them and
keeps path allowlists that are BFF-routing concerns.
"""

from __future__ import annotations

from typing import Final

from deml_contracts import MAX_INGEST_BATCH_EVENTS, MAX_INGEST_BODY_BYTES

__all__ = [
  "INGEST_WRITE_PATHS",
  "MAX_INGEST_BATCH_EVENTS",
  "MAX_INGEST_BODY_BYTES",
]

INGEST_WRITE_PATHS: Final[frozenset[str]] = frozenset(
  {
    "/api/v1/ingest",
    "/api/v1/ingest/events",
    "/api/v1/ingest/events:batch",
    "/api/v1/forjd/ingest",
    "/api/v1/forjd/ingest/events:batch",
  }
)
