# deml-contracts

Canonical **machine-readable** use-case contracts for the DEML control plane.

| Human SoT | Machine SoT |
|-----------|-------------|
| [`docs/use-cases/CANONICAL.md`](../../docs/use-cases/CANONICAL.md) | this package |
| [`docs/use-cases/DIAGRAMS.md`](../../docs/use-cases/DIAGRAMS.md) | `USE_CASE_IDS` (37) + schemas |
| [`docs/CONFIGURATION.md`](../../docs/CONFIGURATION.md) | `deml_contracts.env_schema` |

Monorepo health: [`docs/MONOREPO_HEALTH.md`](../../docs/MONOREPO_HEALTH.md).

## Layout

| Path | Contents |
|------|----------|
| `schemas/` | JSON Schema (draft 2020-12) |
| `openapi/` | OpenAPI 3.1 fragments for DEML-owned paths |
| `src/deml_contracts/` | Python Pydantic models (import: `deml_contracts`) |
| `typescript/src/` | TypeScript types (npm: `@dataengineeringformachinelearning/deml-contracts`) |

## Rule

Every package that speaks these shapes **must** import from this package
instead of re-declaring ad-hoc DTOs.

| Consumer | How it resolves |
|----------|-----------------|
| `frontend` | npm workspace dep + `tsconfig` paths → `typescript/src` |
| `backend` | `pip install -e packages/deml-contracts` (CI/local); Docker installs staged `backend/vendor/deml-contracts` |
| Root scripts | `npm run build:contracts` / `npm run validate:contracts` run **before** frontend Vercel build |

FORJD-native resource schemas (cases, vulnerabilities, exports, …) remain owned by
the `forjd` repository; this package owns DEML wire aliases and control-plane envelopes.

## Build order

1. `npm run build:contracts` (TypeScript typecheck)
2. `npm run build:deml-ui:package` (UI kit)
3. Frontend / backend app builds

```bash
npm run validate:contracts
npm run validate:usecase-coverage
```

