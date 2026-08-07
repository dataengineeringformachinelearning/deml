# DEML ↔ FORJD integration

## Boundary

| Plane | Owns |
|-------|------|
| **DEML** | Firebase identity, profiles, sessions, billing, consent, API keys, account→tenant map, thin BFF |
| **FORJD** | Sealed ingest, status pages/probes, projections, SIEM/ML/exports (partner-direct) |

- Browser → DEML with Firebase Bearer or `deml_` API key. **Never** holds `fjsvc_`.
- DEML → FORJD with tenant-bound `Authorization: Bearer fjsvc_…` only.
- Never forward Firebase / `deml_` tokens, never use Supabase `service_role`, never open FORJD DB/Dragonfly from DEML.
- Ciphertext-only ingest; metadata is an allowlist. Django may rewrite `deml_*` → `threat_*` before the network call.
- Retired product facades (analytics, live SSE, SIEM, ML, exports, vulns, playbooks, projections, replay, workflows, integrations) are **unmounted → 501**. Partners call FORJD directly.

## Tenant binding

```text
deml_account_id → forjd_tenant_id → service_token_secret_ref
```

Auto-provision via `POST /api/v1/partner/provision` (`FORJD_PROVISION_TOKEN`), or map manually:

```bash
python manage.py map_forjd_tenant <deml-account-uuid> <forjd-tenant-uuid> \
  --service-token-secret-ref env:FORJD_SERVICE_TOKEN
```

Body/query `tenant_id` must match the mapped tenant or fail closed.
Product tokens: `status:*` + `ingest:*` + `sessions:*` (+ `tenants:erase` only when account deletion is enabled). Never mint `status:tenant-resolve` / `*` on product credentials.

## Mounted BFF paths

| DEML path | FORJD / role |
|-----------|--------------|
| `GET /api/v1/forjd/capabilities` · `/tenant` | Contract probe / mapping |
| `POST /api/v1/ingest` (+ batch) · `/api/v1/forjd/ingest*` | Sealed ingest |
| `/api/v1/sessions*` | Crypto sessions |
| `/api/v1/system-status/status_pages*` | Status CRUD + public slug/directory |
| `POST /api/v1/system-status/widget-telemetry` | Anonymous sealed widget ingest |
| `/api/v1/system-status/health` · `/ready` | Ops probes |
| `POST /api/v1/agent/report-issue` | Report documents (FORJD + local outbox) |
| `DELETE /api/v1/auth/delete-account` | Lifecycle → `POST /tenants/{id}/erase` then local teardown |

DEML-local (no FORJD): `/api/v1/auth/*`, `/api/v1/billing/*`, `/api/v1/telemetry/*`, `/api/v1/users/*`.

## Auth & failure

- Authorize the caller (role + optional Pro entitlement) **before** exchanging for `fjsvc_`.
- Steady state: `FORJD_WRITE_MODE=forjd`, `FORJD_READ_MODE=forjd`.
- Mapping miss / upstream 5xx / timeout → typed `503` `forjd_degraded` (never healthy empty collections for owned/public status).
- Writes are never auto-replayed. Idempotent GETs may retry with jitter; honor `Retry-After`.
- Headless quotas: `DEML_HEADLESS_{INGEST,WRITE,READ}_RPM` → `429` + `X-RateLimit-*`.
- Propagate `X-Request-ID` (8–128 chars); surface `X-FORJD-Request-ID`.

## Config (minimum)

```dotenv
FORJD_API_URL=https://backend.forjd.co
FORJD_SERVICE_TOKEN=fjsvc_<prefix>_<secret>
FORJD_TENANT_ID=<forjd-tenant-uuid>
FORJD_WRITE_MODE=forjd
FORJD_READ_MODE=forjd
FORJD_REQUIRED_CONTRACT_VERSION=1.0
```

Hosts: Angular [`VERCEL.md`](VERCEL.md) · Django [`FLY.md`](FLY.md) · map [`CONNECTION_MAP.md`](CONNECTION_MAP.md).
Architecture: [`MINIMAL_ARCHITECTURE.md`](MINIMAL_ARCHITECTURE.md).
