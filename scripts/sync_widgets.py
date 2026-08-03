#!/usr/bin/env python3
"""
Sync embeddable widget assets from frontend to marketing public/.

Cookie consent and Algolia search bridge are marketing-only surfaces.
Navbar widget is shared with backend static templates.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys

WIDGET_FILES = (
  "widget.js",
  "widget.css",
  "cookie-consent.js",
  "algolia-search.js",
  "command-palette.js",
  "navbar.js",
)

ALGOLIA_CONFIG = "algolia-config.js"
PRETTIER_VERSION = "prettier@3.8.2"


def resolve_widget_src(root: str, name: str) -> str:
  src_widgets = os.path.join(root, "frontend", "src", "assets", "widgets")
  src_assets = os.path.join(root, "frontend", "src", "assets")
  src = os.path.join(src_widgets, name)
  if not os.path.isfile(src) and name in ("widget.js", "widget.css"):
    src = os.path.join(src_assets, name)
  return src


def sync_widgets() -> None:
  root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  marketing_alive = os.path.isfile(
    os.path.join(root, "marketing", "src", "layouts", "Layout.astro")
  )
  marketing_widgets = os.path.join(root, "marketing", "public", "assets", "widgets")
  backend_widgets = os.path.join(root, "backend", "static", "widgets")
  docs_widgets = os.path.join(root, "deml-ui-docs", "public", "assets", "widgets")
  frontend_public_widgets = os.path.join(root, "frontend", "public", "assets", "widgets")

  widget_dirs = [backend_widgets, docs_widgets, frontend_public_widgets]
  if marketing_alive:
    widget_dirs.insert(0, marketing_widgets)

  for widgets_dir in widget_dirs:
    os.makedirs(widgets_dir, exist_ok=True)

  shared_widget_targets = tuple(widget_dirs)

  copied_paths: list[str] = []

  for name in WIDGET_FILES:
    src = resolve_widget_src(root, name)
    if not os.path.isfile(src):
      print(f"Skip missing widget asset: {name}", file=sys.stderr)
      continue

    if name == "cookie-consent.js":
      if not marketing_alive:
        print(f"Skip {name}: marketing surface not in this repo", file=sys.stderr)
        continue
      dst = os.path.join(marketing_widgets, name)
      shutil.copy2(src, dst)
      copied_paths.append(dst)
      print(f"Synced {name} -> marketing")
      continue

    if name in ("command-palette.js", "navbar.js"):
      for dst_dir in shared_widget_targets:
        dst = os.path.join(dst_dir, name)
        shutil.copy2(src, dst)
        copied_paths.append(dst)
        print(f"Synced {name} -> {dst_dir}")
      continue

    embed_targets = [backend_widgets]
    if marketing_alive:
      embed_targets.insert(0, marketing_widgets)
    for dst_dir in embed_targets:
      dst = os.path.join(dst_dir, name)
      shutil.copy2(src, dst)
      copied_paths.append(dst)
      print(f"Synced {name} -> {dst_dir}")

  format_synced_assets(copied_paths)


def format_synced_assets(paths: list[str]) -> None:
  files = [
    path for path in paths if path.endswith(".css") or os.path.basename(path) == ALGOLIA_CONFIG
  ]
  if not files:
    return
  subprocess.run(
    ["npx", "-y", PRETTIER_VERSION, "--write", *files],
    check=True,
  )


def sync_algolia_config() -> None:
  root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
  src = os.path.join(root, "frontend", "public", "assets", ALGOLIA_CONFIG)
  if not os.path.isfile(src):
    src = os.path.join(root, "frontend", "src", "assets", ALGOLIA_CONFIG)
  if not os.path.isfile(src):
    print(f"Skip missing Algolia config: {ALGOLIA_CONFIG}", file=sys.stderr)
    return

  marketing_alive = os.path.isfile(
    os.path.join(root, "marketing", "src", "layouts", "Layout.astro")
  )
  targets = [
    os.path.join(root, "backend", "static"),
    os.path.join(root, "frontend", "public", "assets"),
  ]
  if marketing_alive:
    targets.insert(1, os.path.join(root, "marketing", "public", "assets"))

  for dst_dir in targets:
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, ALGOLIA_CONFIG)
    if os.path.abspath(src) == os.path.abspath(dst):
      continue
    shutil.copy2(src, dst)
    format_synced_assets([dst])
    print(f"Synced {ALGOLIA_CONFIG} -> {dst_dir}")

  # Verify cross-surface presence. Prettier config is surface-sensitive, so
  # byte-size parity would oscillate between frontend and static mirrors.
  canonical = os.path.join(root, "frontend", "public", "assets", ALGOLIA_CONFIG)
  for dst_dir in targets:
    dst = os.path.join(dst_dir, ALGOLIA_CONFIG)
    if not os.path.isfile(canonical) or not os.path.isfile(dst):
      print(f"Algolia config missing: {dst}", file=sys.stderr)
      sys.exit(1)


if __name__ == "__main__":
  sync_widgets()
  sync_algolia_config()
