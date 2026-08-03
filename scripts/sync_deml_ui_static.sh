#!/usr/bin/env bash
# Copy deml-ui built CSS/JS into Django static. Run after deml-ui `npm run build`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_CSS="${DEML_UI_DIST:-$ROOT/../deml-ui/dist/styles/deml-ui.css}"
SRC_TOKENS="${DEML_UI_TOKENS:-$ROOT/../deml-ui/dist/styles/tokens.css}"
SRC_WC="${DEML_UI_WC:-$ROOT/../deml-ui/dist/web-components/deml-ui.iife.js}"
SRC_WC_MAP="${SRC_WC}.map"
DEST_DIR="$ROOT/backend/static"

if [[ ! -f "$SRC_CSS" ]]; then
  # Fall back to installed package
  SRC_CSS="$ROOT/node_modules/deml-ui/dist/styles/deml-ui.css"
  SRC_TOKENS="$ROOT/node_modules/deml-ui/dist/styles/tokens.css"
  SRC_WC="$ROOT/node_modules/deml-ui/dist/web-components/deml-ui.iife.js"
  SRC_WC_MAP="${SRC_WC}.map"
fi

if [[ ! -f "$SRC_CSS" ]]; then
  echo "deml-ui.css not found. Build deml-ui or npm install first." >&2
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

echo "Synced deml-ui static → $DEST_DIR"
