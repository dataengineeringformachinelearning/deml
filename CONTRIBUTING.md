# Contributing to DEML

Product UI uses **deml-ui** (warm ash NFTS). Viking-UI is not accepted.

**Design:** [ui.deml.app](https://ui.deml.app) · [THEME.md](THEME.md) · [docs/DEML_UI.md](docs/DEML_UI.md)  
**FORJD boundary:** [`docs/FORJD_INTEGRATION.md`](docs/FORJD_INTEGRATION.md)  
**Architecture:** [`docs/MINIMAL_ARCHITECTURE.md`](docs/MINIMAL_ARCHITECTURE.md)

## Where to contribute

| Area | Path |
|------|------|
| Angular product | `src/` |
| Design system | [deml-ui](https://github.com/dataengineeringformachinelearning/deml-ui) |
| Django BFF | `backend/` |
| Contracts | `packages/deml-contracts` |

New shared UI lands in **deml-ui** first.

## Setup

```bash
git clone https://github.com/dataengineeringformachinelearning/deml.git
git clone https://github.com/dataengineeringformachinelearning/deml-ui.git
cd deml-ui && npm install && npm run build
cd ../deml && npm install && npx ng serve
```

Node ≥ 22 · Python 3.12+ · [uv](https://docs.astral.sh/uv/) for hooks.

## Workflow

1. Branch from `main`.
2. Read THEME.md / AGENTS.md / .cursorrules.
3. Design changes in deml-ui; product behavior in `src/`.
4. Run gates; open a PR (screenshots when visual).

```bash
npm run check:nfts
npm test -- --watch=false
npx ng build --configuration development
cd backend && .venv/bin/pytest
uvx pre-commit run --all-files
```
