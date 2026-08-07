# Production checklist — DEML

Deploy: [`PRODUCTION_DEPLOY.md`](./PRODUCTION_DEPLOY.md). Contract: [`FORJD_INTEGRATION.md`](./FORJD_INTEGRATION.md).

| Layer | Host |
|-------|------|
| Angular | Vercel `deml` |
| Django BFF | Fly `deml-backend` |
| Status / sealed plane | FORJD Fly + engine (`FORJD_ROLE=probe`) |

## A. FORJD binding

| Step | Action |
|------|--------|
| A1 | FORJD SQL through **031**; `/ready` green |
| A2 | Map account → tenant + secret ref |
| A3 | `FORJD_API_URL`, `FORJD_SERVICE_TOKEN`, `FORJD_TENANT_ID` |
| A4 | `FORJD_WRITE_MODE=forjd`, `FORJD_READ_MODE=forjd` |
| A5 | `GET /api/v1/forjd/capabilities` → contract `1.0` / `ready` |
| A6 | Remint scopes: `status:*` + `ingest:*` + `sessions:*` (+ `tenants:erase` if needed) |

## B. Fly + Vercel

| Step | Action |
|------|--------|
| B1 | Deploy Django ([`FLY.md`](./FLY.md)); migrations applied |
| B2 | Deploy Angular ([`VERCEL.md`](./VERCEL.md)); `BACKEND_URL=https://backend.deml.app` |
| B3 | Firebase Auth terminates at Django only |
| B4 | `ENABLE_LEGACY_PLAINTEXT_TELEMETRY=false` |
| B5 | Stripe webhook + `sync_subscriptions` if billing used |

## C. Smoke

1. Login → `/settings` + Explore + status slug
2. Owned site CRUD via BFF → FORJD
3. Sealed ingest / widget telemetry (staging)
4. Account deletion erase-first
5. Retired facades → **501** (not empty 200)
6. Mapping/upstream outage → typed `503 forjd_degraded`

## D. Browser security

| Step | Assertion |
|------|-----------|
| D1 | `https://deml.app` has CSP + `X-Content-Type-Options` |
| D2 | Django HTML CSP from `config.csp_middleware` |
| D3 | Headless writes require `Authorization` / `X-API-Key` (not cookie-only) |

Details: [`SECURITY_BROWSER.md`](./SECURITY_BROWSER.md).
