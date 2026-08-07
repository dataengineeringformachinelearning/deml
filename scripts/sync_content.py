#!/usr/bin/env python3
"""Propagate version + product llms.txt inside the deml repo.

Book/whitepaper/marketing content sync lives in the community repo
(`dataengineeringformachinelearning/scripts/sync_content.py`).
"""

from __future__ import annotations

import os

# --- paths ---


def _root() -> str:
  return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _mtime(path: str) -> float:
  try:
    return os.path.getmtime(path)
  except OSError:
    return 0.0


def _needs_sync(sources: list[str], destinations: list[str]) -> bool:
  source_mtime = max((_mtime(src) for src in sources if os.path.exists(src)), default=0.0)
  if source_mtime == 0.0:
    return False
  dest_mtimes = [_mtime(dst) for dst in destinations if os.path.exists(dst)]
  if not dest_mtimes:
    return True
  return source_mtime > min(dest_mtimes)


# --- product llms.txt ---


_PRODUCT_LLMS = """# DEML (deml.app)

DEML helps teams publish public status pages, keep customers informed, and manage account security.

## Homepage
/

## Surfaces
- /explore — browse public status pages
- /status/:slug — public status page
- /settings — account, security, integrations, and sites (authenticated)
- /login · /signup · /mfa — auth

## Repository
https://github.com/dataengineeringformachinelearning/deml

## Notes
- Blog lives on the community site: https://dataengineeringformachinelearning.com/blog (`/blog` on deml.app redirects there)
- Developer docs: https://dataengineeringformachinelearning.com/documentation
- Design system: https://ui.deml.app
- Community book and whitepaper: https://dataengineeringformachinelearning.com
"""


def sync_llms() -> None:
  root = _root()
  dest = os.path.join(root, "public", "llms.txt")
  os.makedirs(os.path.dirname(dest), exist_ok=True)
  with open(dest, "w", encoding="utf-8") as f:
    f.write(_PRODUCT_LLMS)
  print(f"Synced product llms.txt → {dest}")


# --- version ---


def sync_version() -> None:
  root = _root()
  version_path = os.path.join(root, "version.txt")
  targets = [
    os.path.join(root, "frontend", "version.txt"),
    os.path.join(root, "backend", "version.txt"),
  ]
  if not os.path.exists(version_path):
    print(f"version.txt missing: {version_path}")
    return
  try:
    with open(version_path, encoding="utf-8") as f:
      version_data = f.read().strip()
    for path in targets:
      os.makedirs(os.path.dirname(path), exist_ok=True)
      with open(path, "w", encoding="utf-8") as f:
        f.write(f"{version_data}\n")
      print(f"Synced version {version_data} → {path}")
  except OSError as exc:
    print(f"Error syncing version.txt: {exc}")


if __name__ == "__main__":
  root = _root()
  version_path = os.path.join(root, "version.txt")
  llms_dest = os.path.join(root, "public", "llms.txt")
  version_dests = [
    os.path.join(root, "frontend", "version.txt"),
    os.path.join(root, "backend", "version.txt"),
  ]

  if _needs_sync([os.path.join(root, "AGENTS.md"), os.path.join(root, "README.md")], [llms_dest]):
    sync_llms()
  else:
    # Always ensure product llms exists after cleanup of llms-full/search-index.
    if not os.path.exists(llms_dest):
      sync_llms()
    else:
      print("sync_content: product llms.txt unchanged — skip")

  if _needs_sync([version_path], version_dests):
    sync_version()
  else:
    print("sync_content: version.txt unchanged — skipping version sync")
