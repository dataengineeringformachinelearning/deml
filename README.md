---
title: DEML Control Plane
emoji: 🧠
colorFrom: blue
colorTo: indigo
sdk: static
app_file: frontend/dist/frontend/browser/index.html
app_build_command: cd frontend && npm ci && npm run build
pinned: false
license: apache-2.0
---

# DEML — Control Plane

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdataengineeringformachinelearning%2Fdeml.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdataengineeringformachinelearning%2Fdeml?ref=badge_large&issueType=license)

Firebase-authenticated user control plane: Angular product UI (`deml.app`) + Django BFF (`backend.deml.app`) + Viking-UI.

> **Repo map**
>
> | Repo | Role | Production |
> |------|------|------------|
> | **This repo (`deml`)** | Control plane | Vercel `deml` → `deml.app` · Fly `deml-backend` → `backend.deml.app` |
> | [`forjd`](https://github.com/dataengineeringformachinelearning/forjd) | Data plane | Vercel `forjd` → `forjd.co` · Fly `forjd-backend` / `forjd-engine` |
> | [`dataengineeringformachinelearning`](https://github.com/dataengineeringformachinelearning/dataengineeringformachinelearning) | Community / BOOK | Vercel `marketing` → `dataengineeringformachinelearning.com` |

**Platform boundary:** DEML owns identity, billing, consent, and product UI. FORJD owns sealed intake, workflows, projections, analytics, replay, threat processing, and ML. DEML calls FORJD with tenant-bound opaque `fjsvc_` tokens and AES-256-GCM sealed envelopes — never Firebase end-user tokens.
Integration: [`docs/FORJD_INTEGRATION.md`](docs/FORJD_INTEGRATION.md) · FORJD extend: [`EXTENDING.md`](https://github.com/dataengineeringformachinelearning/forjd/blob/main/docs/EXTENDING.md).

**Canonical use-cases (37):** [`docs/use-cases/CANONICAL.md`](docs/use-cases/CANONICAL.md) · diagrams [`DIAGRAMS.md`](docs/use-cases/DIAGRAMS.md) · machine contracts [`packages/deml-contracts/`](packages/deml-contracts/).

## What's in this repo

| Path | Purpose |
|------|---------|
| `frontend/` | Angular 22+ product app (Signals + Viking-UI) |
| `backend/` | Django BFF / control plane (Fly) |
| `packages/viking-ui/` | Suite design system (`@dataengineeringformachinelearning/viking-ui`) |
| `packages/deml-contracts/` | Shared OpenAPI / JSON Schema / TS / Python wire contracts |
| `packages/deml-crypto`, `packages/deml-rate-limit` | Optional shared Python libs (see package READMEs) |
| `config/deml.catalog.json` | Env / ports / health inventory SoT |
| `viking-ui-docs/` | Package docs / Storybook consumers |
| `native/` | macOS security workbench |
| `docs/` | Deploy, FORJD integration, suite UI law, use-cases |
| `BOOK.md` / `WHITEPAPER.md` | Architecture narrative (also published on the community site) |

## Deploy map

| Surface | Host | Deploy from |
|---------|------|-------------|
| Product UI | [deml.app](https://deml.app) | Vercel project `deml`, root `frontend`, GitHub `…/deml` |
| Django BFF | [backend.deml.app](https://backend.deml.app) | Fly app `deml-backend` (`backend/fly.toml`) |
| Community site | [dataengineeringformachinelearning.com](https://dataengineeringformachinelearning.com) | **Other repo** — community `marketing/` |
| Data plane | [forjd.co](https://forjd.co) / [backend.forjd.co](https://backend.forjd.co) | **Other repo** — `forjd` |

Operator runbooks: [`docs/VERCEL.md`](docs/VERCEL.md) · [`docs/FLY.md`](docs/FLY.md) · [`docs/PRODUCTION_DEPLOY.md`](docs/PRODUCTION_DEPLOY.md).

```bash
# Angular (from frontend/)
npx vercel link --project deml --yes
npx vercel deploy --prod --yes

# Django BFF (stage contracts, then deploy from backend/)
node scripts/sync_deml_contracts_docker.mjs
cd backend && fly deploy -a deml-backend
```

## Product surfaces (`deml.app`)

| Route | Purpose |
|-------|---------|
| `/dashboard` | CES / KPI overview (Signals + Django SSE) |
| `/analytics` | Telemetry & threats (FORJD via BFF) |
| `/pipeline` | Pipeline Studio — compose/export FORJD YAML |
| `/status`, `/explore` | Public status pages |
| `/settings` | Account / billing / consent |

## Local development

Prefer the bootstrap path ([`docs/START_HERE.md`](docs/START_HERE.md)):

```bash
npm run bootstrap
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run verify
```

```bash
# Frontend
cd frontend && npm start   # http://127.0.0.1:4200

# Backend
cd backend && uv run python manage.py runserver 127.0.0.1:8000
# Health: GET /api/v1/health · ready: /api/v1/ready
```

Config inventory: [`docs/CONFIGURATION.md`](docs/CONFIGURATION.md).  
Monorepo health checklist: [`docs/MONOREPO_HEALTH.md`](docs/MONOREPO_HEALTH.md).  
Quality gates: [`AGENTS.md`](AGENTS.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Docs

| Doc | Purpose |
|-----|---------|
| [docs/use-cases/CANONICAL.md](docs/use-cases/CANONICAL.md) | **Canonical use-case contracts** |
| [docs/MONOREPO_HEALTH.md](docs/MONOREPO_HEALTH.md) | Install → build → test checklist |
| [docs/CONFIGURATION.md](docs/CONFIGURATION.md) | Env / secrets shape |
| [BOOK.md](BOOK.md) | Full architecture & operations |
| [WHITEPAPER.md](WHITEPAPER.md) | Executive summary |
| [THEME.md](THEME.md) | Viking-UI token law |
| [AGENTS.md](AGENTS.md) | Agent / invariant briefing |

**Resources:** [GitHub](https://github.com/dataengineeringformachinelearning/deml) · [Community / BOOK](https://github.com/dataengineeringformachinelearning/dataengineeringformachinelearning) · [FORJD](https://github.com/dataengineeringformachinelearning/forjd) · [SECURITY](SECURITY.md)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdataengineeringformachinelearning%2Fdeml.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdataengineeringformachinelearning%2Fdeml?ref=badge_large&issueType=license)

![GitHub Repo stars](https://img.shields.io/github/stars/dataengineeringformachinelearning/deml?style=social)
