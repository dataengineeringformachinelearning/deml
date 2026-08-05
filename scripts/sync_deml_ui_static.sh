#!/usr/bin/env bash
# Copy deml-ui built CSS/JS into Django static from the installed npm package.
# Override with DEML_UI_DIST / DEML_UI_TOKENS / DEML_UI_WC for local DS work.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PKG_CSS="$ROOT/node_modules/deml-ui/dist/styles/deml-ui.css"
PKG_TOKENS="$ROOT/node_modules/deml-ui/dist/styles/tokens.css"
PKG_WC="$ROOT/node_modules/deml-ui/dist/web-components/deml-ui.iife.js"

SRC_CSS="${DEML_UI_DIST:-$PKG_CSS}"
SRC_TOKENS="${DEML_UI_TOKENS:-$PKG_TOKENS}"
SRC_WC="${DEML_UI_WC:-$PKG_WC}"
SRC_WC_MAP="${SRC_WC}.map"
DEST_DIR="$ROOT/backend/static"

if [[ ! -f "$SRC_CSS" ]]; then
  echo "deml-ui.css not found at $SRC_CSS — run npm install (deml-ui@^1.1.0) first." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
cp "$SRC_CSS" "$DEST_DIR/deml-ui.css"
[[ -f "$SRC_TOKENS" ]] && cp "$SRC_TOKENS" "$DEST_DIR/deml-ui-tokens.css"
if [[ -f "$SRC_WC" ]]; then
  cp "$SRC_WC" "$DEST_DIR/deml-ui-elements.js"
  # WhiteNoise manifest storage requires the referenced sourcemap name.
  [[ -f "$SRC_WC_MAP" ]] && cp "$SRC_WC_MAP" "$DEST_DIR/deml-ui.iife.js.map"
fi

echo "Synced deml-ui static → $DEST_DIR (from ${SRC_CSS})"
