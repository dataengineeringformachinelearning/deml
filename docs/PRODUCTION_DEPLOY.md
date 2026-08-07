# Production deploy — DEML

Pair with [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md), [`FLY.md`](./FLY.md), [`VERCEL.md`](./VERCEL.md).

| Surface | Host |
|---------|------|
| Angular `src/` | Vercel `deml` → `deml.app` |
| Django BFF | Fly `deml-backend` → `backend.deml.app` |
| FORJD API | Fly `forjd-backend` → `backend.forjd.co` |
| Community | separate repo → `dataengineeringformachinelearning.com` |

## 1. Vercel (Angular)

```bash
# Env: BACKEND_URL, FRONTEND_URL, MARKETING_URL, FIREBASE_*
npx vercel deploy --prod --yes
curl -sI https://deml.app | grep -Ei 'content-security-policy|x-content-type-options'
```

Root Directory: repo root (`.`). Output: `dist/deml/browser`. See [`VERCEL.md`](./VERCEL.md).

## 2. Fly (Django)

```bash
node scripts/sync_deml_contracts_docker.mjs
cd backend && fly deploy -a deml-backend
fly secrets set FORJD_WRITE_MODE=forjd FORJD_READ_MODE=forjd -a deml-backend
curl -fsS https://backend.deml.app/api/v1/health
curl -fsS https://backend.deml.app/api/v1/ready
```

Secrets: [`FLY.md`](./FLY.md). Map tenants with `map_forjd_tenant` + secret ref only.

## 3. FORJD (deploy first)

On the FORJD repo: apply SQL through **031**, remint DEML `fjsvc_` (`status`+`ingest`+`sessions`), deploy backend + engine (`FORJD_ROLE=probe`), confirm `/ready`.

## 4. Smoke

1. `https://deml.app` → Firebase login → `/settings`
2. Explore + `/status/:slug` load; create site → service → incident
3. Widget telemetry / sealed ingest (staging) returns typed accept or 503
4. Account delete: FORJD erase then local teardown (fail closed on erase)
5. Retired paths (`/api/v1/analytics/*`, SIEM, ML, …) → **501**

## Rollback

| Symptom | Action |
|---------|--------|
| Bad Angular | Promote previous Vercel deployment |
| Bad Django | `fly releases -a deml-backend` → prior image |
| FORJD outage | `FORJD_WRITE_MODE=off` + `FORJD_READ_MODE=off` |
| Bad `fjsvc_` | Remint on FORJD → rotate Fly secret |
