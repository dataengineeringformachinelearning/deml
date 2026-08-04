#!/usr/bin/env bash
# Semgrep SAST — scoped scan with project exclusions for known false positives.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Focus on application languages. Workflow tag-pinning is tracked separately;
# --config=auto pulls github-actions mutable-tag rules that fail the whole gate.
CMD=(
  uvx semgrep scan
  --error
  --config=p/python
  --config=p/typescript
  --config=p/javascript
)

# Exclude generated CSS, swagger CDN templates, lockfiles, and workflow YAML.
CMD+=(--exclude '**/deml-ui.css')
CMD+=(--exclude '**/design-tokens.css')
CMD+=(--exclude '**/deml-components.css')
CMD+=(--exclude '**/package-lock.json')
CMD+=(--exclude 'backend/templates/swagger.html')
CMD+=(--exclude 'backend/static/vendor/**')
CMD+=(--exclude '.github/**')

exec "${CMD[@]}"
