"""Map FORJD native JSON → Angular-stable DEML response shapes.

Keeps deml.app dashboards and status pages working without frontend changes
while the BFF proxies tenant-scoped FORJD routes.
"""

from __future__ import annotations

import re
from typing import Any, Final

_SLUG_RE: Final[re.Pattern[str]] = re.compile(r"^[a-z0-9][a-z0-9-]{1,62}$")




# --- Public status slug aliases (legacy embeds / domain-style URLs) ---
def slugify_status_identifier(value: str) -> str:
  """Normalize free-form identifiers to FORJD slug charset."""
  return re.sub(r"[^a-z0-9]+", "-", (value or "").strip().lower()).strip("-")


def public_status_slug_candidates(raw: str) -> list[str]:
  """Exact, slugified, and domain-stem candidates for published-page lookup."""
  text = (raw or "").strip().lower()
  out: list[str] = []

  def _add(candidate: str) -> None:
    if candidate and candidate not in out and _SLUG_RE.match(candidate):
      out.append(candidate)

  _add(text)
  slugified = slugify_status_identifier(text)
  _add(slugified)
  if "." in text:
    _add(slugify_status_identifier(text.split(".", 1)[0]))
  return out


def match_published_status_page(
  pages: list[dict[str, Any]],
  *,
  identifier: str,
) -> dict[str, Any] | None:
  """Resolve a legacy embed id against the public published directory.

  Prefers exact id/slug, then slugified equality, then a unique prefix match
  (``joealongi`` → ``joealongi-dev``) when only one published page fits.
  """
  wanted = (identifier or "").strip()
  if not wanted:
    return None
  wanted_slug = slugify_status_identifier(wanted)
  for page in pages:
    if not isinstance(page, dict):
      continue
    if str(page.get("id") or "") == wanted or str(page.get("slug") or "") == wanted:
      return page
  for page in pages:
    if not isinstance(page, dict):
      continue
    if slugify_status_identifier(str(page.get("slug") or "")) == wanted_slug:
      return page
  if len(wanted_slug) < 3:
    return None
  prefix_hits = [
    page
    for page in pages
    if isinstance(page, dict)
    and (
      str(page.get("slug") or "") == wanted_slug
      or str(page.get("slug") or "").startswith(f"{wanted_slug}-")
    )
  ]
  if len(prefix_hits) == 1:
    return prefix_hits[0]
  return None


def _label(value: Any, default: str) -> str:
  return str(value or default).replace("_", " ").replace("-", " ").title()


# --- Status labels (FORJD lowercase enums → legacy Angular Title Case) ---
# Angular pages, the sidebar, and the embed widget compare against the legacy
# DEML labels ("Resolved", "Outage", "Degraded"), so map FORJD's enums here.
_SERVICE_STATUS_LABELS: Final[dict[str, str]] = {
  "operational": "Operational",
  "degraded": "Degraded",
  "partial_outage": "Degraded",
  "major_outage": "Outage",
  "outage": "Outage",
  "down": "Outage",
  "maintenance": "Maintenance",
  "unknown": "Unknown",
  "no_data": "Unknown",
}


def _service_status_label(value: Any) -> str:
  """Map FORJD enums → Angular labels. Missing/unknown never become Operational."""
  raw = str(value or "").strip()
  if not raw:
    return "Unknown"
  key = raw.lower().replace(" ", "_").replace("-", "_")
  return _SERVICE_STATUS_LABELS.get(key, "Unknown")


def _incident_status_label(value: Any) -> str:
  raw = str(value or "").strip()
  if not raw:
    return "Unknown"
  return _label(raw, "Unknown")




def _optional_number(value: Any) -> float | None:
  if value is None or value == "" or isinstance(value, bool):
    return None
  try:
    return float(value)
  except (TypeError, ValueError):
    return None




def _optional_int(value: Any) -> int | None:
  if value is None or value == "" or isinstance(value, bool):
    return None
  if isinstance(value, float) and not value.is_integer():
    return None
  try:
    parsed = int(value)
  except (TypeError, ValueError):
    return None
  return parsed if parsed >= 0 else None


def _optional_text(value: Any) -> str | None:
  if value is None:
    return None
  if hasattr(value, "isoformat"):
    value = value.isoformat()
  if not isinstance(value, str):
    return None
  text = value.strip()
  return text or None




# --- Status pages list (MonitorService expects a JSON array) ---
def _uptime_history_points(value: Any) -> list[dict[str, Any]]:
  if not isinstance(value, list):
    return []
  out: list[dict[str, Any]] = []
  for row in value:
    if not isinstance(row, dict):
      continue
    date = str(row.get("date") or "").strip()
    status = str(row.get("status") or "no_data").strip() or "no_data"
    if not date:
      continue
    uptime = _optional_number(row.get("uptime"))
    out.append({"date": date, "status": status, "uptime": uptime})
  return out


def _normalize_public_temporal(page: dict[str, Any]) -> dict[str, Any]:
  """Coerce legacy bare-zero forecasts into an honest collecting state.

  Older FORJD builds emitted ``spiking_temporal_forecast: 0.0`` from the
  analytics rollup heuristic without ``temporal_status`` / backend metadata.
  Angular treats that as Spike Risk ``0.00`` instead of collecting telemetry.
  """
  forecast = _optional_number(page.get("spiking_temporal_forecast"))
  status = _optional_text(page.get("temporal_status"))
  backend = _optional_text(page.get("temporal_backend"))
  sample_count = _optional_int(page.get("temporal_sample_count"))
  scored_at = _optional_text(page.get("temporal_scored_at"))
  uses_norse = bool(page["uses_norse"]) if isinstance(page.get("uses_norse"), bool) else None
  # Bare zero with no inference provenance is not a scored ready signal.
  if forecast == 0.0 and not status and not backend and not scored_at:
    forecast = None
    status = "insufficient_data"
    sample_count = sample_count if sample_count is not None else 0
    uses_norse = False if uses_norse is None else uses_norse
  return {
    "spiking_temporal_forecast": forecast,
    "temporal_status": status,
    "temporal_backend": backend,
    "temporal_sample_count": sample_count,
    "temporal_scored_at": scored_at,
    "uses_norse": uses_norse,
  }


def deml_status_page(page: dict[str, Any], *, deml_user_id: int | None) -> dict[str, Any]:
  created = page.get("created_at")
  temporal = _normalize_public_temporal(page)
  overall_raw = str(page.get("overall_status") or "").strip().lower().replace(" ", "_")
  overall_status = overall_raw if overall_raw else "unknown"
  return {
    "id": str(page.get("id") or ""),
    "title": str(page.get("title") or ""),
    "slug": str(page.get("slug") or ""),
    "description": str(page.get("description") or ""),
    "is_published": bool(page.get("is_published")),
    "created_at": created.isoformat() if hasattr(created, "isoformat") else str(created or ""),
    "user_id": deml_user_id,
    # Directory/slug SoT for Explore cards — never drop this field.
    "overall_status": overall_status,
    "overall_uptime": _optional_number(page.get("overall_uptime")),
    # Deprecated alias of overall_uptime — UI must bind overall_uptime only.
    "cumulative_sla": _optional_number(page.get("overall_uptime")),
    "uptime_history": _uptime_history_points(page.get("uptime_history")),
    "p99_latency": _optional_number(page.get("p99_latency")),
    "total_requests": (
      int(page["total_requests"]) if isinstance(page.get("total_requests"), int | float) else None
    ),
    "threats_detected_24h": (
      int(page["threats_detected_24h"])
      if isinstance(page.get("threats_detected_24h"), int | float)
      else None
    ),
    # Public intelligence (ciphertext-free) — explore/status seed ML gauges without auth.
    **temporal,
    "predicted_sla": _optional_number(page.get("predicted_sla")),
    "threat_anomaly_score": _optional_number(page.get("threat_anomaly_score")),
    "threat_suspicious_ratio": _optional_number(page.get("threat_suspicious_ratio")),
  }


def deml_status_pages(
  forjd_body: dict[str, Any],
  *,
  deml_user_id: int | None,
  require_pages_key: bool = False,
) -> list[dict[str, Any]]:
  """Map FORJD ``{pages: [...]}`` to Angular status-page rows.

  When ``require_pages_key`` is True, a missing/non-list ``pages`` field raises
  ``ValueError`` so callers can fail closed (502) instead of inventing ``[]``.
  """
  pages = forjd_body.get("pages")
  if not isinstance(pages, list):
    if require_pages_key:
      raise ValueError("FORJD status pages envelope missing pages list")
    return []
  return [
    deml_status_page(page, deml_user_id=deml_user_id) for page in pages if isinstance(page, dict)
  ]


def deml_status_services(forjd_body: dict[str, Any]) -> list[dict[str, Any]]:
  rows = forjd_body.get("services")
  if not isinstance(rows, list):
    return []
  out: list[dict[str, Any]] = []
  for row in rows:
    if not isinstance(row, dict):
      continue
    updated = row.get("updated_at")
    out.append(
      {
        "id": str(row.get("id") or ""),
        "name": str(row.get("name") or ""),
        "url": str(row.get("description") or row.get("url") or ""),
        "status_page_id": str(row.get("page_id") or row.get("status_page_id") or ""),
        "created_at": updated.isoformat() if hasattr(updated, "isoformat") else str(updated or ""),
        "status": _service_status_label(row.get("status")),
        "sla": _optional_number(row.get("sla")),
        "uptime_history": _uptime_history_points(row.get("uptime_history")),
        "p99_latency": _optional_number(row.get("p99_latency")),
      }
    )
  return out


def deml_status_service(forjd_body: dict[str, Any]) -> dict[str, Any]:
  svc = forjd_body.get("service") if isinstance(forjd_body.get("service"), dict) else forjd_body
  rows = deml_status_services({"services": [svc] if isinstance(svc, dict) else []})
  return (
    rows[0]
    if rows
    else {
      "id": "",
      "name": "",
      "url": "",
      "status_page_id": "",
      "created_at": "",
      "status": "Unknown",
    }
  )


def deml_status_incidents(forjd_body: dict[str, Any]) -> list[dict[str, Any]]:
  rows = forjd_body.get("incidents")
  if not isinstance(rows, list):
    return []
  out: list[dict[str, Any]] = []
  for row in rows:
    if not isinstance(row, dict):
      continue
    started = row.get("started_at")
    resolved = row.get("resolved_at")
    started_s = started.isoformat() if hasattr(started, "isoformat") else str(started or "")
    resolved_s = (
      resolved.isoformat() if hasattr(resolved, "isoformat") else str(resolved or "")
    )
    out.append(
      {
        "id": str(row.get("id") or ""),
        "title": str(row.get("title") or ""),
        "message": str(row.get("body") or ""),
        "status": _incident_status_label(row.get("status")),
        "status_page_id": str(row.get("page_id") or ""),
        "created_at": started_s,
        # Prefer resolved_at when present — never invent freshness from started_at alone.
        "updated_at": resolved_s or started_s,
      }
    )
  return out


def deml_status_incident(forjd_body: dict[str, Any]) -> dict[str, Any]:
  inc = forjd_body.get("incident") if isinstance(forjd_body.get("incident"), dict) else forjd_body
  rows = deml_status_incidents({"incidents": [inc] if isinstance(inc, dict) else []})
  return (
    rows[0]
    if rows
    else {
      "id": "",
      "title": "",
      "message": "",
      "status": "Unknown",
      "status_page_id": "",
      "created_at": "",
      "updated_at": "",
    }
  )


