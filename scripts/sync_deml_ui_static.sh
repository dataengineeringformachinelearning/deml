#!/usr/bin/env bash
# Copy deml-ui built CSS into Django static. Run after deml-ui `npm run build`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_CSS="${DEML_UI_DIST:-$ROOT/../deml-ui/dist/styles/deml-ui.css}"
SRC_TOKENS="${DEML_UI_TOKENS:-$ROOT/../deml-ui/dist/styles/tokens.css}"
SRC_WC="${DEML_UI_WC:-$ROOT/../deml-ui/dist/web-components/deml-ui.iife.js}"
DEST_DIR="$ROOT/backend/static"

if [[ ! -f "$SRC_CSS" ]]; then
  # Fall back to installed package
  SRC_CSS="$ROOT/node_modules/deml-ui/dist/styles/deml-ui.css"
  SRC_TOKENS="$ROOT/node_modules/deml-ui/dist/styles/tokens.css"
  SRC_WC="$ROOT/node_modules/deml-ui/dist/web-components/deml-ui.iife.js"
fi

if [[ ! -f "$SRC_CSS" ]]; then
  echo "deml-ui.css not found. Build deml-ui or npm install first." >&2
  exit 1
fi

mkdir -p "$DEST_DIR"
cp "$SRC_CSS" "$DEST_DIR/deml-ui.css"
[[ -f "$SRC_TOKENS" ]] && cp "$SRC_TOKENS" "$DEST_DIR/deml-ui-tokens.css"
[[ -f "$SRC_WC" ]] && cp "$SRC_WC" "$DEST_DIR/deml-ui-elements.js"

echo "Synced deml-ui static → $DEST_DIR"
