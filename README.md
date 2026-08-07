# DEML — Control Plane

Firebase-authenticated control plane: Angular product UI (`deml.app`) + Django BFF (`backend.deml.app`) + [deml-ui](https://github.com/dataengineeringformachinelearning/deml-ui).

> **Repo map**
>
> | Path | Role |
> |------|------|
> | `src/` | Angular 22 product app (new-from-the-start shell, deml-ui styles) |
> | `backend/` | Django BFF / control plane (Fly) |
> | `packages/deml-contracts` | Shared OpenAPI / JSON Schema / TS / Python wire contracts |
> | `deml-ui` (sibling repo) | Design system — tokens + components |

## Local development

```bash
# UI
npm install
node set-env.js
npm start                 # http://127.0.0.1:4200

# Design system (sibling)
cd ../deml-ui && npm install && npm run build && npm run storybook

# Backend
cp backend/.env.example backend/.env
cd backend && uv run python manage.py runserver 127.0.0.1:8000
```

## Product surfaces

Core job: identity, public status, site management. See [`docs/SIMPLIFIED_SURFACE.md`](docs/SIMPLIFIED_SURFACE.md).

| Route | Purpose |
|-------|---------|
| `/` | Hero landing |
| `/explore` `/status/:slug` | Public status |
| `/login` `/signup` `/mfa` | Auth |
| `/settings` | Account + sites |
| `/blog` | Field notes (not primary nav) |

Design system: published npm package `deml-ui`. App wrappers under `src/app/components` consume deml-ui CSS. See [THEME.md](THEME.md). **Viking-UI is retired.**
