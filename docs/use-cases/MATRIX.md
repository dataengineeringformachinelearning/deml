# Use-case implementation matrix

Legend: `full` · `partial` · `retired` (BFF 501) · `na` · `deferred`

Contracts: [`CANONICAL.md`](CANONICAL.md) + `packages/deml-contracts`.

| UC ID | SPA | BFF | FORJD | Notes |
|-------|-----|-----|-------|-------|
| UC-AUTH-001…006 | full/partial | full | erase on 006 | Firebase + sessions + keys + delete |
| UC-BILL-001…003 | partial | full/partial | na | Checkout gated; webhook/sync live |
| UC-CONSENT-001…002 | full/partial | full | na | Consent + newsletter |
| UC-STATUS-001…002 | full | full | full | Owned CRUD + public explore/slug |
| UC-INGEST-001…003 | partial | full | full | Sealed ingest + sessions |
| UC-WIDGET-001 | embed | full | full | Public widget telemetry |
| UC-HEALTH-001 | full | full | soft | health/ready/capabilities |
| UC-SETTINGS-001 | full | full | status | Account + sites |
| UC-ACCOUNT-001 | full | auth APIs | na | Preferences under `/settings` |
| UC-REPORT-001 | partial | full | full | report-issue + outbox |
| UC-CORS-001 | na | full | na | DB-registered origins |
| UC-DASH / ANALYTICS / SIEM / VULN / PIPE / PROJ / EXPORT / ML / COMPLY / INTEG / ONBOARD | retired | **501** | partner-direct | Not on product surface |
| UC-LEARN-001 | deferred | missing | missing | Reserved; plaintext learning ingest rejected |

## Package inventory

| Path | Role |
|------|------|
| `src/` | Angular product SPA |
| `backend/` | Django/Ninja BFF |
| `packages/deml-contracts` | Wire DTO + `USE_CASE_IDS` SoT |
| `deml-ui` (sibling) | Design system |
| `forjd` (sibling) | Data plane |
