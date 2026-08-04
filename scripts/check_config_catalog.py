#!/usr/bin/env python3
"""Validate config/deml.catalog.json against layer .env.example files.

Exit 0 when every catalogued variable with an example path appears in that
file, and suite URL / port constants are consistent with fly.toml + compose.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "config" / "deml.catalog.json"


def _env_keys(path: Path) -> set[str]:
  keys: set[str] = set()
  if not path.is_file():
    return keys
  for line in path.read_text(encoding="utf-8").splitlines():
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
      continue
    # Allow "# KEY=…" commented examples to still count as documented.
    if stripped.startswith("#"):
      stripped = stripped.lstrip("#").strip()
    if "=" not in stripped:
      continue
    key = stripped.split("=", 1)[0].strip()
    if re.fullmatch(r"[A-Z][A-Z0-9_]*", key):
      keys.add(key)
  # Also accept commented KEY= lines
  for match in re.finditer(
    r"(?m)^[ \t]*#?[ \t]*([A-Z][A-Z0-9_]*)=", path.read_text(encoding="utf-8")
  ):
    keys.add(match.group(1))
  return keys


def main() -> int:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("--json", action="store_true")
  args = parser.parse_args()

  catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
  failures: list[str] = []
  checked = 0

  for var in catalog.get("variables") or []:
    name = var["name"]
    examples = var.get("example")
    if not examples:
      continue
    if isinstance(examples, str):
      examples = [examples]
    for rel in examples:
      path = ROOT / rel
      keys = _env_keys(path)
      checked += 1
      if name not in keys:
        failures.append(f"{name}: missing from {rel}")

  # Suite URL consistency vs fly.toml
  fly = (ROOT / "backend" / "fly.toml").read_text(encoding="utf-8")
  for key, url in (catalog.get("suite_urls") or {}).items():
    if key == "FORJD_API_URL" and key not in fly and "backend.forjd.co" not in fly:
      failures.append(f"fly.toml missing FORJD suite URL ({url})")
    elif key in {"FRONTEND_URL", "BACKEND_URL", "MARKETING_URL", "FORJD_API_URL"}:
      host = url.replace("https://", "").replace("http://", "")
      if host not in fly and key != "MARKETING_URL":
        # MARKETING may be long; check substring
        if url not in fly and host not in fly:
          failures.append(f"fly.toml missing {key} host {host}")

  # Python pin: Dockerfile must mention catalog python version
  py_ver = str((catalog.get("python") or {}).get("version") or "")
  dockerfile = (ROOT / "backend" / "Dockerfile").read_text(encoding="utf-8")
  if py_ver and f"python:{py_ver}" not in dockerfile:
    failures.append(f"backend/Dockerfile must use python:{py_ver}-… (catalog python.version)")

  # Health paths in fly.toml
  health = catalog.get("health") or {}
  for name, path in health.items():
    if path and path not in fly:
      failures.append(f"fly.toml missing health path {path} ({name})")

  compose = (ROOT / "docker-compose.yml").read_text(encoding="utf-8")
  backend_port = (catalog.get("ports") or {}).get("backend_local", 8000)
  if (
    f'"{backend_port}:{backend_port}"' not in compose
    and f"{backend_port}:{backend_port}" not in compose
  ):
    failures.append(f"docker-compose.yml must publish backend port {backend_port}")

  report = {"checked": checked, "failures": failures, "ok": not failures}
  if args.json:
    print(json.dumps(report, indent=2))
  else:
    print(f"Config catalog: checked {checked} example bindings")
    if failures:
      print("Failures:")
      for item in failures:
        print(f"  - {item}")
    else:
      print("OK — catalog matches .env.example / fly / compose pins")
  return 1 if failures else 0


if __name__ == "__main__":
  raise SystemExit(main())
