# DEML configuration

**Inventory SoT:** [`config/deml.catalog.json`](../config/deml.catalog.json)  
**Typed companions:** `deml_contracts.env_schema` (`PAAS_FORJD_REQUIRED`, `VERCEL_FRONTEND_REQUIRED`, suite URLs, health paths)  
**Enforce:** `npm run validate:config`

## Layers

| Layer | Runtime loader | Example file | Deploy |
|-------|----------------|--------------|--------|
| Backend | `backend/config/settings.py` + `backend/utils/env.py` | `backend/.env.example` | Fly (`backend/fly.toml`); Railway standby |
| Frontend | `set-env.js` → `environment*.ts` | `.env.frontend.example` | Vercel (repo root / `frontend/` shim) |
| Shared suite URLs | Catalog `suite_urls` | Root `.env.example` | Documented only |

## Fail-fast

| Surface | When | Required |
|---------|------|----------|
| Backend PaaS | `validate_production_config()` at import | `SECRET_KEY`, `DEBUG=False`, Postgres `DATABASE_URL`, explicit `ALLOWED_HOSTS`, FORJD https + `fjsvc_` + tenant, `ENCRYPTION_MASTER_KEY` (or KMS), Firebase SA JSON, TLS policy |
| Frontend Vercel | `set-env.js` | Firebase web config + `BACKEND_URL` / `FRONTEND_URL` (no placeholders) |
| Local DEBUG | Soft | SQLite fallback allowed; FORJD optional |

## Ports & health (catalog)

| Service | Port | Liveness | Readiness |
|---------|------|----------|-----------|
| Backend local / compose | `8000` | `/api/v1/health` | `/api/v1/ready` |
| Backend Fly | `8080` | same | same |
| Frontend local | `4200` | n/a (static) | n/a |
| Postgres compose | `5432` | `pg_isready` | — |

## Python pin

**3.12** everywhere: CI, `backend/Dockerfile`, catalog `python.version`.

## Related

- Deploy: [`FLY.md`](FLY.md), [`VERCEL.md`](VERCEL.md), [`PRODUCTION_DEPLOY.md`](PRODUCTION_DEPLOY.md)
- Use-cases: [`use-cases/CANONICAL.md`](use-cases/CANONICAL.md)
- Contracts: `packages/deml-contracts`
