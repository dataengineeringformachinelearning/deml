# DEML use-case contracts

**Canonical human SoT:** [`CANONICAL.md`](CANONICAL.md) (each UC includes **How it works** + diagram link)  
**Flow diagrams:** [`DIAGRAMS.md`](DIAGRAMS.md)  
**Implementation matrix (current truth):** [`MATRIX.md`](MATRIX.md)  
**Dead / deferred flags:** [`DEAD_CODE.md`](DEAD_CODE.md)  
**Test/obs coverage registry:** [`coverage.json`](coverage.json) (`npm run validate:usecase-coverage`)  
**Config inventory:** [`../CONFIGURATION.md`](../CONFIGURATION.md) · [`../../config/deml.catalog.json`](../../config/deml.catalog.json)  
**Monorepo health:** [`../MONOREPO_HEALTH.md`](../MONOREPO_HEALTH.md)  
**Machine-readable companions:** [`packages/deml-contracts/`](../../packages/deml-contracts/)

| Artifact | Path | Role |
|----------|------|------|
| Narrative contracts | `docs/use-cases/CANONICAL.md` | ID, actors, paths, errors, observability, ownership |
| Coverage matrix | `docs/use-cases/MATRIX.md` | Which package currently implements which slice |
| Test + observability registry | `docs/use-cases/coverage.json` | Unit/integration/obs refs per UC (CI gate) |
| Dead / deferred | `docs/use-cases/DEAD_CODE.md` | Paths that must not be treated as live UC |
| OpenAPI fragments | `docs/use-cases/openapi/` + `packages/deml-contracts/openapi/` | DEML-owned control-plane schemas |
| JSON Schema | `packages/deml-contracts/schemas/` | Shared request/response/event shapes |
| Python models | `packages/deml-contracts` (`deml_contracts`) | Importable Pydantic contracts |
| TypeScript types | `@dataengineeringformachinelearning/deml-contracts` | Importable TS types for Angular |

Consumers **must** import DEML-owned wire DTOs from `deml-contracts`. FORJD resource DTOs (incidents, SIEM, exports, ML scores, etc.) remain owned by the FORJD OpenAPI/SoT and are proxied by the BFF without re-declaration here.

Boundary law (unchanged): DEML = control plane; FORJD = data plane. See [`../FORJD_INTEGRATION.md`](../FORJD_INTEGRATION.md).

**No Airflow / Pathway / GraphQL / tRPC** in this stack — sealed ingest + Django Ninja BFF + FORJD FastAPI/Rust are the live surfaces.
