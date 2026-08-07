#!/usr/bin/env python3
"""
Sync embeddable widget assets.

Source of truth: backend/static/widgets/
Publish targets:
  - public/assets/          → deml.app/assets/widget.js (Vercel / Angular)
  - backend/static/assets/  → backend.deml.app/assets/widget.js (Django serve_asset)
  - marketing public assets when that surface is present in-repo
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys

# Canonical embed filenames published at /assets/<name>
EMBED_FILES = (
  "widget.js",
  "widget.css",
)

# Shared chrome widgets (backend templates + optional marketing)
SHARED_WIDGET_FILES = ("navbar.js",)

MARKETING_ONLY = ("cookie-consent.js",)

PRETTIER_VERSION = "prettier@3.8.2"


def sync_widgets() -> None:
  root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  backend_widgets = os.path.join(root, "backend", "static", "widgets")
  public_assets = os.path.join(root, "public", "assets")
  backend_assets = os.path.join(root, "backend", "static", "assets")
  marketing_alive = os.path.isfile(
    os.path.join(root, "marketing", "src", "layouts", "Layout.astro")
  )
  marketing_widgets = os.path.join(root, "marketing", "public", "assets", "widgets")
  marketing_assets = os.path.join(root, "marketing", "public", "assets")

  if not os.path.isdir(backend_widgets):
    print(f"Missing widget SoT: {backend_widgets}", file=sys.stderr)
    sys.exit(1)

  os.makedirs(public_assets, exist_ok=True)
  os.makedirs(backend_assets, exist_ok=True)
  if marketing_alive:
    os.makedirs(marketing_widgets, exist_ok=True)
    os.makedirs(marketing_assets, exist_ok=True)

  copied_paths: list[str] = []

  for name in EMBED_FILES:
    src = os.path.join(backend_widgets, name)
    if not os.path.isfile(src):
      print(f"Skip missing embed asset: {name}", file=sys.stderr)
      continue
    for dst_dir in (public_assets, backend_assets):
      dst = os.path.join(dst_dir, name)
      shutil.copy2(src, dst)
      copied_paths.append(dst)
      print(f"Synced {name} -> {dst_dir}")
    if marketing_alive:
      dst = os.path.join(marketing_widgets, name)
      shutil.copy2(src, dst)
      copied_paths.append(dst)
      print(f"Synced {name} -> {marketing_widgets}")

  for name in SHARED_WIDGET_FILES:
    src = os.path.join(backend_widgets, name)
    if not os.path.isfile(src):
      print(f"Skip missing shared widget: {name}", file=sys.stderr)
      continue
    # Keep SoT in place; mirror to marketing when present.
    if marketing_alive:
      dst = os.path.join(marketing_widgets, name)
      shutil.copy2(src, dst)
      copied_paths.append(dst)
      print(f"Synced {name} -> {marketing_widgets}")

  for name in MARKETING_ONLY:
    src = os.path.join(backend_widgets, name)
    if not marketing_alive:
      continue
    if not os.path.isfile(src):
      # Optional legacy path under frontend (shim may be absent).
      alt = os.path.join(root, "frontend", "src", "assets", "widgets", name)
      src = alt if os.path.isfile(alt) else src
    if not os.path.isfile(src):
      print(f"Skip missing marketing widget: {name}", file=sys.stderr)
      continue
    dst = os.path.join(marketing_widgets, name)
    shutil.copy2(src, dst)
    copied_paths.append(dst)
    print(f"Synced {name} -> marketing")

  format_synced_assets(copied_paths)


def format_synced_assets(paths: list[str]) -> None:
  files = [path for path in paths if path.endswith(".css")]
  if not files:
    return
  subprocess.run(
    ["npx", "-y", PRETTIER_VERSION, "--write", *files],
    check=True,
  )


if __name__ == "__main__":
  sync_widgets()
