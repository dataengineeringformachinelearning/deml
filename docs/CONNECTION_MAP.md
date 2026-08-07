# DEML ↔ FORJD connection map

```
Browser (deml.app / Vercel)
  → Firebase ID token (never fjsvc_)
Django BFF (backend.deml.app / Fly)
  → Postgres (identity, billing, consent, sessions)
  → tenant-bound fjsvc_ → FORJD (backend.forjd.co)
FORJD → Supabase Postgres + Dragonfly + forjd-engine (probes)
```

| Lane | Holder | Accepted by |
|------|--------|-------------|
| Firebase ID token | Browser → DEML | Django only |
| `deml_` API key | Headless → DEML | Django integration routes |
| `fjsvc_` service token | DEML secrets / partners | FORJD only |

| Surface | Liveness | Readiness |
|---------|----------|-----------|
| DEML BFF | `GET /api/v1/health` | `GET /api/v1/ready` (soft `forjd_health`) |
| FORJD API | `GET /health` | `GET /ready` |

Contract: [`FORJD_INTEGRATION.md`](FORJD_INTEGRATION.md). Verify: [`scripts/verify_stack_health.sh`](../scripts/verify_stack_health.sh).
