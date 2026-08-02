# Use-case test & observability coverage

Machine registry: [`coverage.json`](coverage.json)  
CI gate: `npm run validate:usecase-coverage` (also `python scripts/check_usecase_coverage.py` in backend CI)

## Requirements (per UC)

1. **Unit** — core logic in the owning package (`file::test` or frontend `*.spec.ts`)
2. **Integration / contract** — full HTTP/proxy path, **or** `deferred` / `deferred_integration` reason
3. **Observability** — `log_usecase(...)` / structured boundary logs in listed sources, **or** `deferred_observability`

## Quarantine

Legacy cutover dual-write tests (`backend/forjd/test_cutover.py`) and UC-LEARN-001 anti-regression ingest rejects are marked `pytest.mark.quarantine` / listed under `quarantine` in `coverage.json`. They are not live product paths.

## Factories

Prefer `deml_contracts.factories` (`make_sealed_event_dict`, `make_consent_in`, …) over hand-rolled wire dicts.
