# Minimal architecture — status + identity

The smallest surface that still runs continuously and correctly.

## Product job

**Identity + public status + site management.** Partners that need SIEM / ML /
exports / playbooks call **FORJD directly** with a scoped `fjsvc_` token.
Those facades are **not** mounted on the DEML BFF (catch-all → **501**).

```
Browser (Angular)
  → Django BFF (auth, session, status adapters, widget telemetry)
    → Firebase Auth · Postgres · FORJD (status + probes + sealed ingest)
```

## Routes & BFF

| Path / prefix | Role |
|---------------|------|
| `/` · `/explore` · `/status/:slug` · `/settings` · auth | Product SPA |
| `/api/v1/auth/*` | User, sessions, logout, delete-account, API keys, handoff |
| `/api/v1/system-status/status_pages*` · `widget-telemetry` · `health`/`ready` | Status + widget |
| `/api/v1/ingest*` · `/api/v1/sessions*` · `/api/v1/forjd/*` | Sealed ingest / partner handoff |
| `/api/v1/billing/*` · `/api/v1/telemetry/*` · `/api/v1/users/*` · `agent/report-issue` | Billing, consent, reports |

Surface contract: [`SIMPLIFIED_SURFACE.md`](./SIMPLIFIED_SURFACE.md).  
Partner boundary: [`FORJD_INTEGRATION.md`](./FORJD_INTEGRATION.md).

## Data SoT + isolation

| Fact | Source |
|------|--------|
| Directory / slug / owned sites | FORJD via BFF (public vs product `fjsvc_`) |
| Display name / session | Django `first_name` · Postgres `browser_sessions` |
| Uptime / health | FORJD probes → `overall_status` + `overall_uptime` |

| Rule | Fail closed |
|------|-------------|
| Product ≠ platform | No mapping to `FORJD_TENANT_ID` / `env:FORJD_SERVICE_TOKEN`; strip `platform-status` |
| Never trust client IDs | Rebind `tenant_id`; re-validate `page_id` ownership before mutate |
| Honesty | No empty `[]` on directory/owned 5xx; unknown when unprobed; never invent Operational |
| Clients | `product_forjd_client` / `public_forjd_client` / `platform_forjd_client` in `backend/forjd/clients.py` |

## Continuity (browser ↔ BFF ↔ FORJD)

| Path | Continuity | Isolation | Honesty |
|------|------------|-----------|---------|
| Auth | Bind fails → sign out; sessionId cleared after `isAuthenticated=false` | n/a | Never “signed in” without Postgres session |
| Explore / slug | Stale cache + banner / Retry | Public client / slug embed only | No “Nothing published” on 5xx |
| Settings sites | Merge write → reload; offline block writes | Platform filtered; owned preflight | No “No sites yet” on outage |
| Retired facades | Explicit **501** | Unmounted | Never empty-200 under cutover |

Timeouts: SPA default 20s · status reads 55s · BFF→FORJD 20s. GET retries + per-route-class circuit breaker; **no write replay**. Idempotency-Key on status writes.

## Runtime

- deml-backend: Daphne + `reconcile_forjd_reports` · `daily_maintenance`; `FORJD_WRITE_MODE=forjd` · `FORJD_READ_MODE=forjd`
- forjd: `FORJD_ROLE=probe`; disable unused workers with interval `0`; SQL through **031**
- Remint product `fjsvc_` after scope narrowing (`status:*` + `ingest:*` + `sessions:*`)

## Verify

```bash
npx ng test --watch=false --include='src/app/pages/**/*.spec.ts' --include='src/app/services/**/*.spec.ts'
cd backend && .venv/bin/pytest forjd/test_angular_compat.py forjd/test_isolation.py config/test_firebase_auth_failclosed.py -q
```
