# Data isolation — user vs platform

Absolute separation rules for DEML (control plane) and FORJD (data plane).
Accuracy / SoT rules: [`DATA_ACCURACY.md`](./DATA_ACCURACY.md).

## Boundaries (obvious in code)

| Store | Owns | Must not hold |
|-------|------|----------------|
| DEML Postgres `forjd_tenant_mappings` / sealed credentials | Product account → **isolated** FORJD tenant | Platform `FORJD_TENANT_ID` / `env:FORJD_SERVICE_TOKEN` |
| DEML `browser_sessions`, profiles, billing | User/control-plane state | FORJD ciphertext / sealed events |
| FORJD `status_pages` row `slug=platform-status` | Platform dogfood only (`metadata.kind=platform`) | Product site CRUD |
| FORJD `telemetry_events` / projections / ML | Per-tenant rows under RLS | Cross-tenant reads without `require_tenant_access` |
| FORJD `threat_intelligence` `is_platform=TRUE` | Shared IoCs (intentional) | User ciphertext |

Code SoT:

- DEML: [`backend/forjd/isolation.py`](../backend/forjd/isolation.py) — `assert_product_tenant_isolation`
- DEML BFF: [`backend/forjd/views.py`](../backend/forjd/views.py) — `_owned_status_pages`, platform mutate refuse
- FORJD: [`backend/app/services/status.py`](../../forjd/backend/app/services/status.py) — reserved slug + immutability
- FORJD SQL: [`backend/sql/030_platform_status_isolation.sql`](../../forjd/backend/sql/030_platform_status_isolation.sql)

## Enforcement checklist

1. **Early auth** — Firebase/session on DEML edge; FORJD `require_tenant_access` before every tenant query.
2. **Never trust client `tenant_id`** — DEML rebinds from mapping; FORJD asserts principal membership.
3. **Product ≠ platform** — resolve/provision/map reject platform UUID and `env:FORJD_SERVICE_TOKEN`.
4. **Public status** — Explore uses published directory / slug embed; never platform `tenant_id` + foreign `page_id`.
5. **Logs** — metadata only; scrub ciphertext / `fjsvc_` (FORJD `sanitize.scrub_for_logs`).

## Remaining risks (flagged)

| Risk | Severity | Notes |
|------|----------|-------|
| Shared physical tables (`status_pages`, `telemetry_events`) keyed by `tenant_id` | Accepted | Absolute *schema* separation would require a separate platform DB; RLS + reserved slug + mapping denylist are the enforced boundary |
| Platform threat intel mixed into tenant analytics (`OR is_platform`) | P2 | Intentional SOC dogfood; not on simplified public status UI |
| Historical pages on platform tenant | P1 ops | Run `scripts/rehome_status_page.py` for any non-`platform-status` row on tenant0 |
| `crypto_sessions` member-wide SELECT | P2 | By design for E2EE peer discovery |
| Soft audit DDL in non-prod | Mitigated | Production `ensure_audit_schema` fails closed — apply `010`/`020` |
