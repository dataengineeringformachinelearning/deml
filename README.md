# DEML

Control plane for identity, public status, and site settings — Angular (`deml.app`) + Django BFF (`backend.deml.app`).

| Repo | Role | Production |
|------|------|------------|
| **This repo (`deml`)** | Control plane | [deml.app](https://deml.app) · [backend.deml.app](https://backend.deml.app) |
| [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui) | Design system (warm ash NFTS) | [ui.deml.app](https://ui.deml.app) |
| [`forjd`](https://github.com/dataengineeringformachinelearning/forjd) | Data plane | [backend.forjd.co](https://backend.forjd.co) |
| [`dataengineeringformachinelearning`](https://github.com/dataengineeringformachinelearning/dataengineeringformachinelearning) | Community / BOOK / blog / docs | [dataengineeringformachinelearning.com](https://dataengineeringformachinelearning.com) |

## Owns

- Firebase auth, profiles, billing preferences, consent, API credentials, account lifecycle
- Public status UX + site management (status SoT still in FORJD)
- Account → FORJD tenant mapping; calls FORJD with tenant-bound `fjsvc_` only
- Product chrome via **deml-ui** (warm ash NFTS · Geist only)

Does **not** host blog, book, whitepaper, or human docs — those live on the community site. `/blog` and `/learn` on deml.app 301 there. Surface contract: [`docs/SIMPLIFIED_SURFACE.md`](docs/SIMPLIFIED_SURFACE.md).

## Run

**New developer?** → [`docs/START_HERE.md`](docs/START_HERE.md)

```bash
npm install && node set-env.js
cp backend/.env.example backend/.env
cd backend && uv sync

# Terminal A — API
cd backend && uv run python manage.py runserver 127.0.0.1:8000

# Terminal B — UI
npm start   # → http://127.0.0.1:4200
```

## Check

```bash
npm run check:nfts
npm test -- --watch=false
npm run validate:contracts
cd backend && .venv/bin/pytest -q
```

## Deploy

| Host | Platform | Notes |
|------|----------|-------|
| `deml.app` | Vercel | [`docs/VERCEL.md`](docs/VERCEL.md) |
| `backend.deml.app` | Fly | [`docs/FLY.md`](docs/FLY.md) |

Critical env: Firebase web config, `DATABASE_URL`, `FORJD_*` service token + tenant map — see `backend/.env.example` + [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md).

## Layout

```text
src/                 Angular product UI (deml-ui wrappers)
backend/             Django BFF + API
public/              robots.txt · sitemap.xml · llms.txt · social assets
docs/                START_HERE · SIMPLIFIED_SURFACE · FORJD_INTEGRATION · VERCEL · FLY
THEME.md             Locked visual contract (consumes deml-ui)
```

## Docs

| Doc | When |
|-----|------|
| [`docs/START_HERE.md`](docs/START_HERE.md) | First clone |
| [`AGENTS.md`](AGENTS.md) · [`THEME.md`](THEME.md) | Agent + visual law |
| [`docs/SIMPLIFIED_SURFACE.md`](docs/SIMPLIFIED_SURFACE.md) | Product routes / nav |
| [`docs/FORJD_INTEGRATION.md`](docs/FORJD_INTEGRATION.md) | Data-plane boundary |
| [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md) | Env inventory |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) · [`SECURITY.md`](SECURITY.md) | Contribute / vulns |

## Related

- Design system: [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)
- Community blog / docs: [dataengineeringformachinelearning.com/blog](https://dataengineeringformachinelearning.com/blog) · [/documentation](https://dataengineeringformachinelearning.com/documentation)
