# Contract compliance status

Last updated: 2026-07-26

Surgical alignment of DEML packages to [`CANONICAL.md`](CANONICAL.md) via
`packages/deml-contracts`. FORJD-owned resource schemas are **not** re-declared.

Test/obs gate: [`coverage.json`](coverage.json) + `npm run validate:usecase-coverage`
→ **37/37** use-cases declared (see [`TEST_COVERAGE.md`](TEST_COVERAGE.md)).

## Package results

| Package | Typecheck / unit | Notes |
|---------|------------------|-------|
| `packages/deml-contracts` | `validate:contracts` **pass** | Auth, consent, billing, ingest, ready, live, playbooks, ErrorCode, factories |
| `backend` (auth/ingest/openapi/live/billing/consent/proxies) | new UC suites **pass** | Session fixtures + `log_usecase` boundaries |
| `frontend` | `typecheck` **pass**; live-updates vitest **5/5** | `ERROR_CODES` on dashboard/analytics/SSE |
| `deml-ui` | na | Visual SoT — no UC wire DTOs |
| `packages/deml-crypto` | na | Crypto envelopes only |
| `packages/deml-rate-limit` | na | Codes via middleware + `ErrorCode` |
| Sibling `forjd` | out of scope here | Data-plane SoT for proxied resources |
| UC-LEARN-001 | deferred | Anti-regression only — see [`DEAD_CODE.md`](DEAD_CODE.md) |

## Remaining gaps (intentional)

1. **FORJD resource DTOs** (incidents, SIEM, vulns, exports, ML, projections) — stay FORJD OpenAPI SoT; BFF proxies without local Schema re-declaration.
2. **UC-LEARN-001** — reserved; not implemented.
3. **Pro checkout** — gated `_PRO_CHECKOUT_ENABLED=False`; contract + `BillingErrorOut` preserved.
4. **Consent dual status** — telemetry path returns `success`; Ninja `/users/*` returns `recorded` / `subscribed` (public API preserved).
5. **No Airflow / Pathway / GraphQL / tRPC** — not in architecture; nothing to wire.
