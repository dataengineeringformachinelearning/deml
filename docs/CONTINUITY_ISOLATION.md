# Continuity + isolation — final contract

Hardened architecture for the minimal product. Companion docs:
[`MINIMAL_ARCHITECTURE.md`](./MINIMAL_ARCHITECTURE.md),
[`DATA_ISOLATION.md`](./DATA_ISOLATION.md),
[`DATA_ACCURACY.md`](./DATA_ACCURACY.md),
[`INTEGRATION_RELIABILITY.md`](./INTEGRATION_RELIABILITY.md).

## Hardened architecture

```
Browser
  credentials fail-closed · 20s timeout · 401 logout · offline write block
  SWR + lastValueFrom · stale banners · load generations · Retry
    → Django BFF
         session bind before isAuthenticated
         owned ≠ platform · write validation · no empty-lie on 5xx/malformed
         GET retries + circuit breaker · no write replay
      → FORJD status + probes (product SoT)
      → Postgres sessions / profiles / tenant map
      → Firebase Auth
```

| Path | Continuity | Isolation | Honesty |
|------|------------|-----------|---------|
| Auth | Bind fails → sign out | n/a | Never “signed in” without Postgres session |
| Explore | Stale cache + banner / Retry | Published + platform only | No “Nothing published” on 5xx |
| `/status/:slug` | Stale slug + banner / typed errors | Slug embed only | No enrichment wipe |
| Settings sites | Retry on fail; create blocked while failed | Platform filtered client+BFF | No “No sites yet” on outage |
| Settings writes | Offline disable; delete rollback; Idempotency-Key | Platform slug/UUID immutable | Errors surfaced |

## Remaining known limitations

| Limitation | Severity | Notes |
|------------|----------|-------|
| Shared physical FORJD tables keyed by `tenant_id` | Accepted | Isolation via RLS + mapping denylist + reserved `platform-status`, not separate DBs |
| Historical non-platform pages on tenant0 | Ops | Rehome with `scripts/rehome_status_page.py` |
| BFF still mounts non-status FORJD proxies | Accepted | Headless/partner; SPA does not call them |
| No auto-refetch on browser `online` | Low | Manual Retry on Explore / Status / Settings |
| Wire still includes `cumulative_sla` | Low | UI binds `overall_uptime` only |
| FORJD `/ready` still expects some idle workers | Ops | Status cut disables analytics/ML ticks; full worker kill-switches are FORJD-side |

No silent empty successes for owned or public directory data. Stale snapshots are always labeled.
