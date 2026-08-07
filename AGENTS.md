# AGENTS.md — DEML

Control plane for identity, public status, and site settings. FORJD is the sealed data plane.

| Repo | Role |
|------|------|
| **deml** (this) | Angular `src/` + Django BFF |
| [deml-ui](https://github.com/dataengineeringformachinelearning/deml-ui) | Design system (warm ash NFTS) |
| [forjd](https://github.com/dataengineeringformachinelearning/forjd) | Sealed streaming / status SoT |
| [community](https://github.com/dataengineeringformachinelearning/dataengineeringformachinelearning) | Marketing + BOOK + blog |

## Boundary

- Product routes: `/`, `/explore`, `/status/:slug`, auth, `/settings` — [`docs/SIMPLIFIED_SURFACE.md`](docs/SIMPLIFIED_SURFACE.md). Blog is on the community site (`/blog` on deml.app redirects there).
- DEML owns Firebase auth, profiles, billing, consent, account→FORJD tenant map.
- FORJD owns sealed ingest, status pages, probes. Call with tenant-bound `fjsvc_` only — never end-user tokens.
- Missing FORJD capabilities stay unavailable (501) — do not rebuild them in DEML.

## Visual law

Warm ash NFTS only — [THEME.md](THEME.md), [.cursorrules](.cursorrules), [`docs/DEML_UI.md`](docs/DEML_UI.md). Geist only. No Viking, no app-level DS CSS (`npm run check:nfts`).

## Gates

| Gate | Command |
|------|---------|
| NFTS | `npm run check:nfts` |
| Frontend | `npm test -- --watch=false` · `npx ng build` |
| Backend | `cd backend && .venv/bin/pytest` |
| Contracts | `npm run validate:contracts` · `npm run validate:usecase-coverage` |

Architecture: [`docs/MINIMAL_ARCHITECTURE.md`](docs/MINIMAL_ARCHITECTURE.md) · FORJD: [`docs/FORJD_INTEGRATION.md`](docs/FORJD_INTEGRATION.md).
