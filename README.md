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

## What's in this repo

| Path | Purpose |
|------|---------|
| `frontend/` | Angular 22+ product app (Signals + Viking-UI) |
| `backend/` | Django BFF / control plane (Fly) |
| `packages/viking-ui/` | Suite design system (`@dataengineeringformachinelearning/viking-ui`) |
| `packages/deml-crypto`, `packages/deml-rate-limit` | Shared Python libs |
| `viking-ui-docs/` | Package docs / Storybook consumers |
| `native/` | macOS security workbench |
| `docs/` | Deploy, FORJD integration, suite UI law |
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

# Django BFF (from backend/)
fly deploy -a deml-backend
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

```bash
# Frontend
cd frontend && npm install --legacy-peer-deps && npm start

# Backend
cd backend && uv sync && uv run python manage.py runserver
```

Quality gates: see [`AGENTS.md`](AGENTS.md) · [`CONTRIBUTING.md`](CONTRIBUTING.md).

## Docs

| Doc | Purpose |
|-----|---------|
| [BOOK.md](BOOK.md) | Full architecture & operations |
| [WHITEPAPER.md](WHITEPAPER.md) | Executive summary |
| [THEME.md](THEME.md) | Viking-UI token law |
| [AGENTS.md](AGENTS.md) | Agent / invariant briefing |

**Resources:** [GitHub](https://github.com/dataengineeringformachinelearning/deml) · [Community / BOOK](https://github.com/dataengineeringformachinelearning/dataengineeringformachinelearning) · [FORJD](https://github.com/dataengineeringformachinelearning/forjd) · [SECURITY](SECURITY.md)

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fdataengineeringformachinelearning%2Fdeml.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fdataengineeringformachinelearning%2Fdeml?ref=badge_large&issueType=license)

![GitHub Repo stars](https://img.shields.io/github/stars/dataengineeringformachinelearning/deml?style=social)
