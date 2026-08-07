# deml-contracts

Shared wire contracts for the DEML control plane (Python + TypeScript + JSON Schema + OpenAPI fragments).

Human narrative: [`docs/use-cases/CANONICAL.md`](../../docs/use-cases/CANONICAL.md). Import from this package — do not re-declare DTOs.

```bash
npm run build:contracts
npm run validate:contracts
```

| Path | Contents |
|------|----------|
| `schemas/` | JSON Schema |
| `openapi/` | OpenAPI 3.1 fragments |
| `src/deml_contracts/` | Python (`deml_contracts`) |
| `typescript/src/` | TS (`@dataengineeringformachinelearning/deml-contracts`) |

FORJD-native resource schemas stay in the `forjd` repo.
