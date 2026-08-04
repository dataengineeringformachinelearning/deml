# Use-case implementation matrix (current truth)

Legend: `full` = implemented · `partial` = partial / adapter-only / gated · `missing` = absent · `na` = not applicable

**Contracts** SoT: `CANONICAL.md` + `packages/deml-contracts`. DEML-owned BFF wire
DTOs (auth, consent, billing, ingest, ready, live SSE, playbook ack, ErrorCode)
are imported at runtime. FORJD resource bodies stay FORJD-owned (proxied).

| UC ID | Prior docs | Frontend | Backend BFF | FORJD | deml-contracts | Tests | Config |
|-------|------------|----------|-------------|-------|----------------|-------|--------|
| UC-AUTH-001 | full | full `/login` | full `/auth/user` | na | full (wired) | full | Firebase |
| UC-AUTH-002 | partial | partial settings/account | full `/auth/sessions` | na | full (wired) | full | na |
| UC-AUTH-003 | partial | partial / native | full handoff/desktop | na | full (wired) | full | na |
| UC-AUTH-004 | partial | full | full `/auth/logout` | na | full (wired) | full | na |
| UC-AUTH-005 | full | partial settings | full `/auth/api-keys*` | na | full (wired) | full | na |
| UC-AUTH-006 | full | partial | full delete-account + lifecycle | full erase | full (wired) | full | provision/erase |
| UC-BILL-001 | full | full pricing CTAs | partial checkout disabled | na | full (wired) | full | STRIPE_* |
| UC-BILL-002 | full | na | full webhook/sync + maintenance | na | full sync DTO | full | webhook secret |
| UC-BILL-003 | full | partial settings | full cancel/resume | na | full (wired) | full | STRIPE_* |
| UC-CONSENT-001 | partial | full banner (telemetry path) | full dual paths | na | full (wired) | partial | na |
| UC-CONSENT-002 | partial | partial | full dual paths | na | full (wired) | partial | Resend |
| UC-DASH-001 | full | full `/dashboard` | full analytics overview | full | ErrorCode | partial | FORJD_READ_* |
| UC-ANALYTICS-001 | full | full `/analytics` + SSE | full live bridge | full | full (wired) | partial | DEML_LIVE_* |
| UC-ANALYTICS-002 | full | partial analytics | full incidents proxy | full | FORJD SoT | partial | roles/Pro |
| UC-ANALYTICS-003 | full | partial | full playbooks + header CSRF gate | full | full ack/retry | partial | roles/Pro |
| UC-SIEM-001 | full | partial | full proxy | full | FORJD SoT | partial | Pro write |
| UC-VULN-001 | full | full `/vulnerabilities` | full agent/vulnerabilities | full | FORJD SoT | partial | Pro write |
| UC-STATUS-001 | full | full `/status` | full status_pages* | full | FORJD SoT | partial | roles |
| UC-STATUS-002 | full | full `/explore`, `/status/:slug` | full public slug | full | partial | partial | platform FORJD_* |
| UC-INGEST-001 | full | partial seal client | full ingest + forjd/ingest | full | full SealedEvent | full | WRITE_MODE |
| UC-INGEST-002 | full | partial | full batch | full | full | full | max 25 |
| UC-INGEST-003 | full | partial | full sessions proxy | full | FORJD SoT | partial | crypto session |
| UC-PIPE-001 | full | full `/pipeline` | full workflows GET | full YAML SoT | rewrite maps | partial | na |
| UC-PROJ-001 | full | partial | full projections/replay/dlq | full | FORJD SoT | partial | WRITE_MODE |
| UC-EXPORT-001 | full | partial | full exports* | full | FORJD SoT | partial | Pro |
| UC-ML-001 | full | partial | full ml/* + predict | full | FORJD SoT | partial | Pro train |
| UC-COMPLY-001 | full | partial | full soc-status | full | FORJD SoT | partial | na |
| UC-REPORT-001 | full | partial | full report-issue + reconcile | full | partial | partial | na |
| UC-INTEG-001 | partial | partial settings | full integrations* | na | partial | full | Google OAuth |
| UC-INTEG-002 | full | na | full security-alert | full | FORJD SoT | partial | WRITE_MODE |
| UC-WIDGET-001 | full | na embed | full widget-telemetry | full | ErrorCode | full | rate limit |
| UC-HEALTH-001 | full | full product-home probe | full health/ready/capabilities | full | full ReadyResponse | full | FORJD_* |
| UC-SETTINGS-001 | full | full `/settings` | full composed | na | na | partial | na |
| UC-ACCOUNT-001 | partial | full `/settings#account` | na | na | na | partial | na |
| UC-ONBOARD-001 | partial | full dashboard | na | na | na (deml-ui) | partial | na |
| UC-CORS-001 | full | na | full cors_utils | na | na | full | DB domains |
| UC-LEARN-001 | deferred | missing | missing | missing | reserved only | missing | na |

## OpenAPI coverage note

`frontend/openapi.json` lists 25 DEML-owned Ninja paths. Most FORJD adapter routes in
`backend/config/urls.py` are absent from that dump; they remain Backend `full` with
schema ownership on FORJD or deml-contracts fragments.

## Package inventory (monorepo)

| Path | Manager | Runtime | Responsibility |
|------|---------|---------|----------------|
| `frontend/` | npm workspace | Angular 22 / Node >=22.22.3 | Product SPA (deml.app) |
| `backend/` | uv | Django + Ninja / Python 3.12 | BFF, identity, billing, FORJD adapters |
| `deml-ui` (sibling) | GitHub package | Design system | Product UI SoT |
| `packages/deml-crypto` | hatch/uv | Python | AES-GCM + GCP KMS envelopes |
| `packages/deml-rate-limit` | hatch/uv | Python | Redis/Dragonfly rate-limit helpers |
| `packages/deml-contracts` | npm + hatch | TS + Python | Use-case contract SoT |
| `deml-ui-docs/` | npm workspace | Storybook | Kit docs |
| `infrastructure/studio` | npm workspace | tooling | Studio infra |
| `native/` | Xcode | Swift/macOS | Security workbench |
| `tests/` | Playwright | Node | Visual checks |
| `forjd` (sibling) | uv / cargo / npm | FastAPI + Rust | Data plane (external) |
