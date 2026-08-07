# Start here

```bash
npm install
node set-env.js
cp backend/.env.example backend/.env
cd backend && uv sync
```

```bash
# Terminal A — API
cd backend && uv run python manage.py runserver 127.0.0.1:8000

# Terminal B — UI
npm start   # http://127.0.0.1:4200
```

Health: `GET http://127.0.0.1:8000/api/v1/health` · ready: `/api/v1/ready`.

Config inventory: [`CONFIGURATION.md`](CONFIGURATION.md) · [`config/deml.catalog.json`](../config/deml.catalog.json).

Gates: `npm run check:nfts` · `npm run validate:contracts` · `cd backend && .venv/bin/pytest -q`.
