# Minimal architecture — status + identity

The smallest surface that still runs continuously and correctly.

## Product job

**Identity + public status + site management.** Nothing else is on the critical path.

```
Browser (Angular)
  → Django BFF (auth, session, status adapters)
    → Firebase Auth (identity)
    → Postgres (sessions, profiles, tenant mapping, billing)
    → FORJD (status pages + probes + partner provision)
```

## Routes (deml.app)

| Path | Role |
|------|------|
| `/` | Hero |
| `/explore` | Published directory |
| `/status/:slug` | Public status detail (embedded services/incidents/uptime) |
| `/settings` | Account display name + owned sites CRUD |
| `/login` · `/signup` · `/mfa` | Auth |
| `/blog` · `/blog/:slug` | Addressable writing (not primary nav) |

Retired product pages redirect only (`/dashboard`, `/analytics`, `/vulnerabilities`, `/pipeline`, …).

## Data paths (SoT)

| Fact | Source |
|------|--------|
| Directory | FORJD published pages via BFF (no auth) |
| Slug page | FORJD slug embed via BFF |
| Owned sites | FORJD tenant pages via BFF (auth) |
| Display name | Django `/api/v1/auth/user` |
| Session | DEML Postgres after Firebase bind |
| Uptime | FORJD probe observations → `overall_uptime` |

See [`DATA_ACCURACY.md`](./DATA_ACCURACY.md) and [`DATA_ISOLATION.md`](./DATA_ISOLATION.md).

## What was pruned from the SPA

- Dead clients: ML, live SSE, sealed telemetry interceptor, route prefetch
- Dashboard chrome: tile-board, charts, stat/metric cards, section-header/article grids used only by retired pages
- Monitor APIs: endpoints list, services/incidents CRUD, GA/Clarity/Cloudflare integrations, enrichment no-ops
- Optional workers **off by default**: sealed heartbeat, analytics sync (`DEML_ENABLE_SEALED_HEARTBEAT`, `DEML_ENABLE_ANALYTICS_SYNC`)

## What stays on the BFF (partner / headless)

Non-status FORJD proxies (analytics, SIEM, ML, exports, ingest, …) remain mounted for headless `deml_` / partner use. The Angular app does not call them. Narrowing that facade is a separate cut.

## Runtime (steady state)

**deml-backend**

- Daphne + workers: `reconcile_forjd_reports`, `daily_maintenance`
- `FORJD_WRITE_MODE=forjd`, `FORJD_READ_MODE=forjd`
- Firebase + Postgres + Stripe webhooks

**forjd-backend + engine**

- Status CRUD + published directory + slug
- Partner provision / tenant erase
- `/health`, `/ready`, capabilities
- Engine: `FORJD_ROLE=probe` (uptime SoT)
- Disable optional ticks when status-only:  
  `ANALYTICS_ROLLUP_INTERVAL_SECONDS=0`, `TRAINING_TICK_SECONDS=0`

## Reliability defaults

| Layer | Measure |
|-------|---------|
| Browser HTTP | credentials fail-closed, 20s timeout interceptor, 401 → logout |
| Status reads | 25s timeout, SWR + `lastValueFrom`, stale banners, load generations |
| Status writes | 20s timeout, Idempotency-Key on create, optimistic delete + rollback, offline block |
| BFF → FORJD | 20s timeout, GET retries, circuit breaker, no write replay |
| BFF honesty | no empty `[]` on directory/owned 5xx; write schema validation at boundary |
| Auth | session bind before `isAuthenticated`; profile SoT from Django |
| Isolation | product tenant ≠ platform; platform-status immutable |

## Continuity + isolation

Final review contract: [`CONTINUITY_ISOLATION.md`](./CONTINUITY_ISOLATION.md).

## Verify

```bash
npx ng test --watch=false --include='src/app/pages/**/*.spec.ts' --include='src/app/services/**/*.spec.ts'
npx ng build --configuration=development
cd backend && .venv/bin/pytest forjd/test_angular_compat.py forjd/test_isolation.py -q
```
