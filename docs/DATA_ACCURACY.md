# Data accuracy — non-negotiable

Single source of truth, honest freshness, validated writes. Related:
[`DATA_ISOLATION.md`](./DATA_ISOLATION.md), [`INTEGRATION_RELIABILITY.md`](./INTEGRATION_RELIABILITY.md).

## Sources of truth (remaining product surface)

| Fact | Authoritative store | Derived / UI view | Forbidden duplicates |
|------|---------------------|-------------------|----------------------|
| Published directory | FORJD published status pages (platform credential) | Explore cards from directory payload only | Per-slug hydrate + authed enrichment |
| Public status page | FORJD slug embed (`services` + `incidents` + `overall_uptime`) | `/status/:slug` from slug GET only | Authed `/services` / `/incidents` overwrite |
| Owned sites | FORJD tenant `GET /status/pages` via BFF | Settings list (platform-filtered) | Falling back to public directory |
| Account display name | Django `GET /api/v1/auth/user` → `user` | Settings profile field | Firebase-only display without Django sync |
| Account email | Firebase Auth user | Settings email (read-only) | Inventing email on Django envelope |
| Session registry | DEML Postgres `browser_sessions` | `sessionId` signal after bind | Treating Firebase sign-in as product-ready |
| Platform status | FORJD `slug=platform-status` + `metadata.kind=platform` | Public slug / directory | Product CRUD / tenant mapping to platform |

## Read contract

1. **One payload per surface** — Explore = directory; detail = slug embed; Settings sites = owned list.
2. **`lastValueFrom` on SWR** — Warm cache may paint immediately but is marked **stale** until revalidate completes. Never treat the first emission as final.
3. **Stale banners** — `directoryServingStale` / `slugServingStale` / `ownedSitesServingStale` must show when serving cache after failed refresh.
4. **No empty lie** — Public directory and owned list return **503** (or error) on FORJD 5xx — never `[]` that reads as “nothing published / no sites”.
5. **No enrichment wipe** — `fetchAllServices` / `fetchAllIncidents` are no-ops on product surfaces.
6. **Uptime field** — Display `overall_uptime` only (not aliased cumulative SLA).

## Write contract

1. **Boundary validation** — BFF `_validate_status_page_write` (title, slug shape, reserved platform slug) before proxy.
2. **Permissions** — `require_forjd_action` + tenant credential; platform page immutable by UUID and slug.
3. **Idempotency** — Create sends `Idempotency-Key`; writes are not auto-replayed.
4. **Optimistic UI** — Delete may remove locally then rollback on failure; success path reloads from owned-list SoT after SWR invalidate.
5. **Offline** — `ConnectivityService` blocks writes; show offline copy instead of fake success.

## Eventual consistency / streaming

| Path | Marker | User-facing rule |
|------|--------|------------------|
| SWR revalidate | `*ServingStale` signals | Banner: “Showing cached…” — never label as live |
| Probe / uptime rollups | FORJD `updated_at` on services | Embedded snapshot is a point-in-time; not live websocket |
| Sealed ingest / projections | FORJD outbox + checkpoints | Not on simplified public UI; partners treat projections as eventually consistent |

## Defensive checks

- Load **generations** drop late async completions (Explore / isolated-status).
- Payload shape asserts (`Array.isArray`, `page.id`) before committing UI state.
- Product↔platform mapping rejected in `forjd/isolation.py` (fail closed).
- Audit: FORJD `audit_events` metadata-only; status rows versioned via `updated_at`.

## Verification

```bash
# Frontend (touched surfaces)
cd frontend 2>/dev/null || true
npm test -- --include='**/explore*.spec.ts' --include='**/settings*.spec.ts' --include='**/isolated-status*.spec.ts' --include='**/monitor.service.spec.ts' --include='**/auth.service.spec.ts'

# BFF accuracy / isolation
cd backend && pytest forjd/test_angular_compat.py -q -k 'status_pages or owned or platform'
```
