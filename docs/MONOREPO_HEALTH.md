# Monorepo Health checklist

Run after clone, before merge, or when agents touch contracts / config / CI.

## Fast path (~2–5 min)

```bash
npm run validate:config
npm run validate:contracts
npm run validate:usecase-coverage
npm run verify
```

| Gate | What it proves |
|------|----------------|
| `validate:config` | `config/deml.catalog.json` matches `.env.example` / Fly / compose pins |
| `validate:contracts` | `deml-contracts` TS build + 37 `USE_CASE_IDS` import |
| `validate:usecase-coverage` | Every UC has unit/integ/obs refs **and** CANONICAL **How it works** + diagram link |
| `verify` | Config + contracts + coverage + backend smoke + frontend typecheck |

## Fresh clone path

```bash
npm run bootstrap   # npm ci, contracts, backend venv, hooks
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run verify
```

See [`START_HERE.md`](START_HERE.md).

## Drift inventory (critical = zero)

| Check | Command / location | Critical if |
|-------|-------------------|-------------|
| Env catalog drift | `npm run validate:config` | Example/Fly/compose disagree with catalog |
| UC count ≠ 37 | `npm run validate:contracts` | `USE_CASE_IDS` length wrong |
| UC coverage hole | `npm run validate:usecase-coverage` | Missing test/obs/How-it-works |
| Health path mismatch | Catalog `health.*` vs `backend/fly.toml` / `docker-compose.yml` | Probes not `/api/v1/health` + `/api/v1/ready` |
| Python pin | Catalog `python.version` vs `backend/Dockerfile` | Not **3.12** |
| FORJD boundary | `docs/use-cases/DEAD_CODE.md` + cutover quarantine | New DEML-local stream plane |
| Secrets in git | `.env` gitignored; no real tokens in examples | Placeholder-only examples |

**Last inventory (2026-07-26):** all critical checks **PASS** (config OK, 37/37 UC coverage, contracts OK).

## Architecture pointers

| Topic | Doc |
|-------|-----|
| Use-cases (human SoT) | [`use-cases/CANONICAL.md`](use-cases/CANONICAL.md) |
| Flow diagrams | [`use-cases/DIAGRAMS.md`](use-cases/DIAGRAMS.md) |
| Config inventory | [`CONFIGURATION.md`](CONFIGURATION.md) · [`../config/deml.catalog.json`](../config/deml.catalog.json) |
| Machine contracts | [`../packages/deml-contracts/`](../packages/deml-contracts/) |
| FORJD boundary | [`FORJD_INTEGRATION.md`](FORJD_INTEGRATION.md) |

## Keep from drifting

1. **New wire DTO?** Add to `packages/deml-contracts` first; import in backend/frontend — never copy-paste schemas.
2. **New use-case?** Add ID to `deml_contracts.ids`, narrative + **How it works** in `CANONICAL.md`, diagram anchor in `DIAGRAMS.md`, row in `coverage.json`, then tests.
3. **New env var?** Add to `config/deml.catalog.json` + matching `.env.example`; extend `env_schema` / fail-fast if required on PaaS.
4. **Deploy probe/port change?** Update catalog + Fly + compose + `CONFIGURATION.md` in the same PR.
5. **CI:** keep the **shared** job (config → contracts → coverage) before backend/frontend.
6. Prefer `npm run bootstrap` / `npm run verify` over ad-hoc install order.
