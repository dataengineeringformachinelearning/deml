# DEML static web on Vercel

This **control-plane** repo deploys the Angular product UI on Vercel. Django BFF remains on **Fly** (`deml-backend`). FORJD (Fly) + Supabase own the streaming engine. Firebase is **Auth-only** (no Firebase Hosting).

| Project | GitHub repo | Root directory | Public hostname | Role |
| ------- | ----------- | -------------- | --------------- | ---- |
| `deml` | `dataengineeringformachinelearning/deml` | `.` (repo root; legacy shim under `frontend/` may still be configured) | `https://deml.app` | Product Angular app on **deml-ui** |
| `deml-ui` | `dataengineeringformachinelearning/deml-ui` | `.` | `https://ui.deml.app` | deml-ui Storybook |
| `marketing` | `dataengineeringformachinelearning/dataengineeringformachinelearning` | `marketing` | `https://dataengineeringformachinelearning.com` | Community Astro site (**other repo**) |

Design system: **deml-ui** ([THEME.md](../THEME.md)). Viking-UI / `packages/viking-ui` is retired.

```text
Browser (Vercel deml.app)
  → DEML Django Fly (backend.deml.app)  Firebase JWT
    → FORJD (backend.forjd.co)          fjsvc_ service token
      → Supabase Postgres / Auth (FORJD platform)
```

## Project: `deml` (Angular product UI)

| Setting | Value |
|---------|-------|
| Framework Preset | Other |
| Root Directory | Prefer repo root (`.`). If Root Directory is still `frontend`, the shim runs `scripts/vercel-frontend-build.mjs`. |
| Build Command | `node set-env.js && npm run build:contracts && NG_BUILD_MAX_WORKERS=1 GOMAXPROCS=1 NODE_OPTIONS=--max-old-space-size=1536 npx ng build --configuration vercel` |
| Output Directory | `dist/deml/browser` (or `frontend/dist/deml/browser` via shim) |
| Install Command | `npm install --include=dev` |
| Node.js | **24.x** |
| Git | `dataengineeringformachinelearning/deml` (`main`) |

Dependency: `"deml-ui": "github:dataengineeringformachinelearning/deml-ui#main"`.

## Project: `deml-ui` (Storybook)

| Setting | Value |
|---------|-------|
| Build | `npm run build-storybook` (see deml-ui `vercel.json`) |
| Output | `storybook-static` |
| Hostname | `https://ui.deml.app` |

## Environment variables (Production)

Set in Vercel → Project `deml` → Settings → Environment Variables:

| Variable | Example | Required |
|----------|---------|----------|
| `FRONTEND_URL` | `https://deml.app` | yes |
| `BACKEND_URL` | `https://backend.deml.app` | yes |
| `MARKETING_URL` | `https://dataengineeringformachinelearning.com` | yes |
| Firebase web config keys | (from Firebase console) | yes |

See also [docs/CONFIGURATION.md](CONFIGURATION.md) and [docs/PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md).

## Local verify

```bash
npm install
node set-env.js
npx ng build --configuration vercel
# or shim path:
node scripts/vercel-frontend-build.mjs
```
