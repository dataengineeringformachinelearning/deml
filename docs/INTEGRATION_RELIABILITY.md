# Integration reliability — remaining DEML product surface

Honest degraded mode for Explore, Status, Settings, and Auth. No silent empty
successes for owned data. Writes are never auto-replayed.

Minimal surface: [`MINIMAL_ARCHITECTURE.md`](./MINIMAL_ARCHITECTURE.md).

## Integration map

| Edge | Client | Server | Timeout | Retry | On failure |
|------|--------|--------|---------|-------|------------|
| Firebase ID token | `credentialsInterceptor` | Firebase | 15s | none | 401 fail-closed (no naked API call) |
| Auth user sync | `AuthService` | Django `/api/v1/auth/user` | 20s | none | signed-out; structured log |
| Session registry | `SessionApiService` | Postgres via Django | 15s | none | **fail-closed** — never set `isAuthenticated` until register succeeds |
| Public explore directory | `MonitorService.getStatusPages` + SWR | FORJD published directory | 25s | FORJD GET ≤3 + breaker | SWR stale + banner; hard fail if no cache |
| Status slug | `getStatusPageBySlug` | FORJD slug proxy | 25s | FORJD GET | typed error (network / 404 / 403) |
| Owned sites list | `getOwnedStatusPages` | FORJD tenant pages | 25s | FORJD GET | error or stale banner — **never** empty `[]` on 5xx |
| Site create/update/delete | Settings + MonitorService | FORJD writes | 20s | **none** (non-idempotent) | error surface; optimistic delete with rollback |
| Authed enrichment | `fetchAllServices/Incidents` (no-op) | n/a | n/a | n/a | Product surfaces use slug/directory embed only — see [`DATA_ACCURACY.md`](./DATA_ACCURACY.md) |
| Idle / cross-tab | `SessionStateService` + `SessionIdleService` | local | n/a | n/a | logout + returnUrl |
| Offline | `ConnectivityService` | browser | n/a | n/a | block writes; show offline copy |

Global HTTP: `httpTimeoutInterceptor` (20s) + `errorInterceptor` (401 → logout).

## Failure modes handled

1. **Session bind race** — Settings could call APIs with a client-only `X-DEML-Session-Id` before Postgres registration → 401. Fixed: register first, then set `isAuthenticated`; sessionId published only after success.
2. **Naked authenticated requests** — token fetch failure previously continued without `Authorization`. Fixed: fail closed with 401.
3. **Owned list outage looks empty** — BFF empty-read fallback returned `[]` on FORJD 5xx for Settings. Fixed: surface upstream error; empty only when truly unmapped/no sites.
4. **Silent SWR stale** — revalidate failure completed without UX. Fixed: `onRevalidateError` + stale banners on Explore/Settings.
5. **Silent enrichment wipe** — authed services/incidents empty/`[]` could overwrite embeds. Fixed: product surfaces stop calling enrichment; BFF authed path returns 503 without inventing `[]`; public directory never empty-falls-back on 5xx.
6. **Double-submit create** — `siteBusy` gate + `Idempotency-Key` correlation; BFF does not auto-retry writes.
7. **Optimistic delete half-state** — local remove rolls back if DELETE fails.
8. **Offline writes** — ConnectivityService blocks create/update/delete/profile save with honest copy.
9. **Idle logout unwired** — `SessionStateService.init()` runs from `App` constructor.
10. **Misleading 403 copy** — no longer blames MFA for role denials.

## What we deliberately do not do

- Auto-retry POST/PUT/DELETE to FORJD (non-idempotent; `ForjdClient` already enforces this).
- Wire dead `MlService` / live SSE / telemetry interceptor onto the simplified surface.
- Claim “live” when serving cached/embedded snapshots.

## Related

- User vs platform data boundaries: [`DATA_ISOLATION.md`](DATA_ISOLATION.md)

## Verification

- Frontend: focused unit tests for SWR revalidate callback, error interceptor, auth session order.
- Backend: owned status pages must not return HTTP 200 `[]` on simulated FORJD 502 when a tenant credential exists.
