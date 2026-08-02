# Start here (DEML control plane)

≈10 minutes for a fresh clone.

## Bootstrap

```bash
npm run bootstrap
# or: python scripts/deml_tooling.py bootstrap --skip-hooks
```

This runs `npm ci`, builds `deml-contracts`, creates `backend/.venv`, and installs hooks.

Copy env examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Config inventory SoT: [`docs/CONFIGURATION.md`](CONFIGURATION.md) · [`config/deml.catalog.json`](../config/deml.catalog.json).

## Verify

```bash
npm run verify
```

Gates: config catalog, use-case contracts, use-case coverage registry, backend smoke tests, frontend typecheck.

## Dev

```bash
# API (from backend/)
cd backend && .venv/bin/uvicorn …   # or: uv run / manage.py runserver
# Prefer: cd backend && .venv/bin/python manage.py runserver 127.0.0.1:8000

# Web
cd frontend && npm start   # http://127.0.0.1:4200
```

Compose (optional Postgres + backend image):

```bash
npm run sync:contracts:docker
docker compose up --build
```

Health: `GET http://127.0.0.1:8000/api/v1/health` · ready: `/api/v1/ready`.
