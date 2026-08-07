# DEML Django on Fly (`deml-backend`)

```bash
node scripts/sync_deml_contracts_docker.mjs   # from repo root
cd backend && fly deploy
```

| Setting | Value |
|---------|-------|
| App | `deml-backend` · `backend/fly.toml` · region `iad` |
| Port | `8080` |
| Liveness | `GET /api/v1/health` |
| Readiness | `GET /api/v1/ready` |

```text
Browser (Vercel) → deml-backend (Fly) → FORJD (fjsvc_)
```

## Secrets (required)

```bash
cd backend
fly secrets set \
  SECRET_KEY='…' \
  DATABASE_URL='postgresql://…?sslmode=require' \
  DATABASE_SEARCH_PATH=partner_control,public \
  FIREBASE_PROJECT_ID=… \
  FIREBASE_SERVICE_ACCOUNT_JSON='…' \
  FORJD_API_URL=https://backend.forjd.co \
  FORJD_SERVICE_TOKEN='fjsvc_…' \
  FORJD_TENANT_ID='…' \
  FRONTEND_URL=https://deml.app \
  BACKEND_URL=https://backend.deml.app \
  MARKETING_URL=https://dataengineeringformachinelearning.com \
  ALLOWED_HOSTS=backend.deml.app,deml-backend.fly.dev \
  CORS_ALLOWED_ORIGINS=https://deml.app,https://deml.vercel.app,https://dataengineeringformachinelearning.com \
  CSRF_TRUSTED_ORIGINS=https://deml.app,https://deml.vercel.app,https://dataengineeringformachinelearning.com,https://backend.deml.app
```

Optional: Stripe, Resend, Sentry/Rollbar. Do **not** set Redis/Dragonfly on DEML.
Steady-state modes are in `fly.toml` (`FORJD_WRITE_MODE=forjd`, `FORJD_READ_MODE=forjd`).

## Verify / domain

```bash
fly checks list -a deml-backend
curl -fsS https://backend.deml.app/api/v1/health
curl -fsS https://backend.deml.app/api/v1/ready
fly certs add backend.deml.app
```

Contract: [`FORJD_INTEGRATION.md`](./FORJD_INTEGRATION.md). Deploy runbook: [`PRODUCTION_DEPLOY.md`](./PRODUCTION_DEPLOY.md).
