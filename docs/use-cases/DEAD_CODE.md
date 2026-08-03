# Dead / deferred code relative to canonical use-cases

Flagged during contract compliance (not removed unless proven unused).

| Item | Location | UC | Status |
|------|----------|-----|--------|
| `deml_learning_v1` workflow id | Rejected by ingest contract tests; not a live wire type | UC-LEARN-001 | **Deferred** — reserved; must not appear in OpenAPI |
| Legacy plaintext telemetry | `ENABLE_LEGACY_PLAINTEXT_TELEMETRY` (default off) | UC-INGEST-* | **Dead for prod** — keep flag false; no browser queue |
| Airflow / Pathway references | Docs only (anti-regression) | — | **Not in stack** — do not reintroduce |
| Pro checkout create session | `billing/api.py` `_PRO_CHECKOUT_ENABLED = False` | UC-BILL-001 | **Gated off** — cancel/resume/sync remain live |
| Public Storybook hosting | Root `deploy:deml-ui-storybook` echo | — | **Retired** — local/Chromatic only |

When removing any of the above, update [`CANONICAL.md`](CANONICAL.md) and [`MATRIX.md`](MATRIX.md) in the same change.
