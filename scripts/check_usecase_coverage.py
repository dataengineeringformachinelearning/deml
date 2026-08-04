#!/usr/bin/env python3
"""Validate docs/use-cases/coverage.json against CANONICAL use-case IDs.

Exit 0 when every UC has unit + (integration | deferred) and observability
is declared. Prints a coverage matrix to stdout.

Usage:
  python scripts/check_usecase_coverage.py
  python scripts/check_usecase_coverage.py --json
  npm run validate:usecase-coverage
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
COVERAGE_PATH = ROOT / "docs" / "use-cases" / "coverage.json"
CANONICAL_PATH = ROOT / "docs" / "use-cases" / "CANONICAL.md"
BACKEND = ROOT / "backend"

_NODE_CACHE: list[str] | None = None


def _backend_python() -> Path | None:
  candidate = ROOT / "backend" / ".venv" / "bin" / "python"
  return candidate if candidate.is_file() else None


def _prefer_backend_venv() -> None:
  """Prefer backend/.venv site-packages so pydantic/deml_contracts resolve locally."""
  lib = ROOT / "backend" / ".venv" / "lib"
  if lib.is_dir():
    for site in sorted(lib.glob("python*/site-packages"), reverse=True):
      sys.path.insert(0, str(site))
      break
  sys.path.insert(0, str(ROOT / "packages" / "deml-contracts" / "src"))


def _use_case_ids() -> tuple[str, ...]:
  _prefer_backend_venv()
  from deml_contracts import USE_CASE_IDS

  return tuple(USE_CASE_IDS)


def _pytest_nodes() -> list[str]:
  global _NODE_CACHE
  if _NODE_CACHE is not None:
    return _NODE_CACHE
  proc = subprocess.run(
    [sys.executable, "-m", "pytest", "--collect-only", "-q"],
    cwd=BACKEND,
    capture_output=True,
    text=True,
    check=False,
  )
  nodes = [
    line.strip() for line in proc.stdout.splitlines() if "::" in line and not line.startswith("=")
  ]
  _NODE_CACHE = nodes
  return nodes


def _resolve_ref(ref: str, nodes: list[str], *, skip_collect: bool) -> tuple[bool, str]:
  ref = ref.strip()
  if not ref:
    return False, "empty ref"
  if ref.startswith("packages/deml-contracts"):
    path = ROOT / "packages" / "deml-contracts" / "src" / "deml_contracts" / "factories.py"
    return path.is_file(), "factories.py"
  if ref.endswith((".ts", ".tsx", ".js")):
    path = ROOT / ref
    return path.is_file(), ref
  if "::" in ref:
    if skip_collect:
      path = ROOT / ref.split("::", 1)[0]
      return path.is_file(), "file-only"
    base = ref.split("[", 1)[0]
    short = base.removeprefix("backend/")
    matches = [n for n in nodes if n == ref or n.startswith(base) or n.startswith(short)]
    return bool(matches), f"matches={len(matches)}"
  path = ROOT / ref
  return path.is_file(), ref


def _obs_ok(uc_id: str, obs: dict[str, Any] | None) -> tuple[bool, str]:
  if not obs:
    return False, "missing observability block"
  if obs.get("deferred_observability"):
    return True, "deferred"
  sources = list(obs.get("sources") or [])
  if not sources:
    return False, "no sources and no deferred_observability"
  missing = [s for s in sources if not (ROOT / s).is_file()]
  if missing:
    return False, f"missing sources: {missing}"
  events = list(obs.get("events") or [])
  if not events:
    return True, "sources present"
  blob = "\n".join((ROOT / s).read_text(encoding="utf-8", errors="ignore") for s in sources)
  for event in events:
    if f'"{event}"' not in blob and f"'{event}'" not in blob:
      return False, f"event '{event}' not found in sources (use_case={uc_id})"
  return True, f"events={len(events)}"


def main() -> int:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("--json", action="store_true")
  parser.add_argument("--skip-collect", action="store_true")
  args = parser.parse_args()

  # Re-exec under backend venv when the outer interpreter lacks package deps.
  venv_py = _backend_python()
  if venv_py is not None and Path(sys.executable).resolve() != venv_py.resolve():
    try:
      import pydantic  # noqa: F401
    except ImportError:
      os_exec = __import__("os").execv
      os_exec(str(venv_py), [str(venv_py), str(Path(__file__).resolve()), *sys.argv[1:]])

  ids = _use_case_ids()
  data = json.loads(COVERAGE_PATH.read_text(encoding="utf-8"))
  declared: dict[str, Any] = data.get("use_cases") or {}
  nodes = [] if args.skip_collect else _pytest_nodes()

  rows: list[dict[str, Any]] = []
  failures: list[str] = []

  # --- Narrative SoT: every UC needs How it works + diagram link ---
  canonical = CANONICAL_PATH.read_text(encoding="utf-8") if CANONICAL_PATH.is_file() else ""
  for uc_id in ids:
    if f"## {uc_id} —" not in canonical:
      failures.append(f"{uc_id}: missing heading in CANONICAL.md")
      continue
    # Slice from this UC heading to the next UC or EOF
    start = canonical.index(f"## {uc_id} —")
    rest = canonical[start + 3 :]
    end_rel = rest.find("\n## UC-")
    section = rest if end_rel < 0 else rest[:end_rel]
    if "| **How it works** |" not in section:
      failures.append(f"{uc_id}: missing How it works in CANONICAL.md")
    elif "DIAGRAMS.md#" not in section:
      failures.append(f"{uc_id}: How it works missing DIAGRAMS.md link")

  for uc_id in ids:
    entry = declared.get(uc_id)
    if not entry:
      failures.append(f"{uc_id}: missing from coverage.json")
      rows.append(
        {
          "id": uc_id,
          "unit": "missing",
          "integration": "missing",
          "observability": "missing",
          "ok": False,
        }
      )
      continue

    deferred = entry.get("deferred")
    unit_refs = list(entry.get("unit") or [])
    integ_refs = list(entry.get("integration") or [])

    unit_ok = bool(unit_refs)
    unit_details: list[str] = []
    for ref in unit_refs:
      ok, detail = _resolve_ref(ref, nodes, skip_collect=args.skip_collect)
      unit_details.append(f"{ref} ({detail})")
      unit_ok = unit_ok and ok

    if deferred or entry.get("deferred_integration"):
      integ_ok = True
      integ_details = [f"deferred: {deferred or entry.get('deferred_integration')}"]
    else:
      integ_ok = bool(integ_refs)
      integ_details = []
      for ref in integ_refs:
        ok, detail = _resolve_ref(ref, nodes, skip_collect=args.skip_collect)
        integ_details.append(f"{ref} ({detail})")
        integ_ok = integ_ok and ok

    obs_ok, obs_detail = _obs_ok(uc_id, entry.get("observability"))
    ok = unit_ok and integ_ok and obs_ok
    if not unit_ok:
      failures.append(f"{uc_id}: unit — {unit_details}")
    if not integ_ok:
      failures.append(f"{uc_id}: integration — {integ_details}")
    if not obs_ok:
      failures.append(f"{uc_id}: observability — {obs_detail}")

    rows.append(
      {
        "id": uc_id,
        "unit": "ok" if unit_ok else "missing",
        "integration": "ok" if integ_ok else "missing",
        "observability": "ok" if obs_ok else "missing",
        "deferred": bool(deferred),
        "ok": ok,
      }
    )

  extra = sorted(set(declared) - set(ids))
  if extra:
    failures.append(f"Unknown UC ids in coverage.json: {extra}")

  if args.json:
    print(json.dumps({"rows": rows, "failures": failures}, indent=2))
  else:
    print("Use-case coverage matrix\n")
    print(f"{'UC ID':<18} {'Unit':<8} {'Integ':<8} {'Obs':<8} {'OK'}")
    print("-" * 50)
    for row in rows:
      flag = "PASS" if row["ok"] else "FAIL"
      defer = " (deferred)" if row.get("deferred") else ""
      print(
        f"{row['id']:<18} {row['unit']:<8} {row['integration']:<8} "
        f"{row['observability']:<8} {flag}{defer}"
      )
    covered = sum(1 for r in rows if r["ok"])
    print(f"\n{covered}/{len(rows)} use-cases fully declared")
    for item in data.get("quarantine") or []:
      print(f"quarantine: {item.get('path')} — {item.get('reason')}")
    if failures:
      print("\nFailures:")
      for item in failures:
        print(f"  - {item}")

  return 1 if failures else 0


if __name__ == "__main__":
  raise SystemExit(main())
