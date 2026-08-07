# Monorepo health

```bash
npm run bootstrap          # fresh clone
npm run validate:config
npm run validate:contracts
npm run validate:usecase-coverage
npm run verify
```

| Gate | Proves |
|------|--------|
| `validate:config` | Catalog ↔ `.env.example` / Fly / compose |
| `validate:contracts` | `deml-contracts` + `USE_CASE_IDS` |
| `validate:usecase-coverage` | Every UC: tests/obs + CANONICAL How-it-works + diagram link |
| `verify` | Config + contracts + coverage + smoke |

| Topic | Doc |
|-------|-----|
| Use-cases | [`use-cases/CANONICAL.md`](use-cases/CANONICAL.md) |
| Config | [`CONFIGURATION.md`](CONFIGURATION.md) |
| FORJD | [`FORJD_INTEGRATION.md`](FORJD_INTEGRATION.md) |
| Architecture | [`MINIMAL_ARCHITECTURE.md`](MINIMAL_ARCHITECTURE.md) |

New UC: add ID in `deml_contracts.ids` → CANONICAL heading + How it works → DIAGRAMS anchor → `coverage.json` → tests.  
New env: `config/deml.catalog.json` + `.env.example` in the same PR.
