# DEML configuration

**Inventory SoT:** [`config/deml.catalog.json`](../config/deml.catalog.json)  
**Enforce:** `npm run validate:config`

| Layer | Loader | Example | Deploy |
|-------|--------|---------|--------|
| Backend | `settings.py` + `utils/env.py` | `backend/.env.example` | Fly |
| Frontend | `set-env.js` | `.env.frontend.example` | Vercel |
| Suite URLs | Catalog `suite_urls` | Root `.env.example` | Documented |

**Fail-fast (PaaS):** `SECRET_KEY`, `DEBUG=False`, Postgres, `ALLOWED_HOSTS`, FORJD https + `fjsvc_` + tenant, encryption key/KMS, Firebase SA.  
**Vercel:** Firebase web config + `BACKEND_URL` / `FRONTEND_URL` (no placeholders).

| Service | Port | Health |
|---------|------|--------|
| Backend local | `8000` | `/api/v1/health` · `/api/v1/ready` |
| Backend Fly | `8080` | same |
| Frontend local | `4200` | n/a |

Python pin: **3.12**. Deploy: [`FLY.md`](FLY.md) · [`VERCEL.md`](VERCEL.md).
