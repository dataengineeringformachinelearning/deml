# DEML — Control Plane

Firebase-authenticated user control plane: Angular product UI (`deml.app`) + Django BFF (`backend.deml.app`) + [deml-ui](https://github.com/dataengineeringformachinelearning/deml-ui).

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

| Route | Purpose |
|-------|---------|
| `/` `/learn` `/blog` | Marketing / education |
| `/login` `/signup` | Auth |
| `/dashboard` | CES / KPI overview |
| `/analytics` | Telemetry & threats |
| `/vulnerabilities` | Findings |
| `/settings` `/account` | Account / billing / consent |
| `/status` `/explore` | Public status |

Design system dependency: `deml-ui` (`file:../deml-ui` locally). App behavioral components live under `src/app/components` and consume deml-ui CSS (no parallel local DS stylesheets).
