# AGENTS.md — DEML Platform

**Mission:** Build DEML as a zero-compromise, user-focused learning platform.
DEML owns identity, profiles, roles, subscriptions, consent, account lifecycle,
and user interactions. FORJD is the universal secure streaming engine for intake,
processing, analytics, projections, replay, and machine learning.
Integration contract: [docs/FORJD_INTEGRATION.md](docs/FORJD_INTEGRATION.md).
Scale guidance: [docs/SCALE.md](docs/SCALE.md).

## Repo map

| Repo | Role |
|------|------|
| **This repo (`deml`)** | Control plane — Angular product (`src/`) + Django BFF + **deml-ui** |
| [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui) | Design system SoT — tokens, HTML/CSS components, WC + Angular, Storybook (`ui.deml.app`) |
| [`forjd`](https://github.com/dataengineeringformachinelearning/forjd) | Data plane — sealed streaming engine |
| [`dataengineeringformachinelearning`](https://github.com/dataengineeringformachinelearning/dataengineeringformachinelearning) | Community / marketing site + public BOOK |

## DEML ↔ FORJD Boundary

- Keep the complete Angular product surface intact: dashboards, analytics, status
  pages, vulnerability views, monitoring UI, onboarding, Pipeline Studio
  (`/pipeline` — compose/export FORJD YAML only), and generated API contracts.
- Django is the Firebase-authenticated user control plane and backend-for-frontend.
  Identity, profiles, roles, billing, consent, API credentials, issue reports,
  learning/library content, and account lifecycle remain local.
- FORJD owns sealed intake, streaming, transformation, projections, analytics, ML,
  threat processing, replay, and DLQ. FORJD is the exclusive data plane; do not
  introduce DEML-local stream brokers, OLAP warehouses, or parallel projection workers.
- DEML calls FORJD with a tenant-bound opaque `fjsvc_` service token. It never calls
  an OAuth token endpoint, uses Supabase `service_role`, or forwards Firebase
  end-user tokens.
- DEML stores an explicit account-to-FORJD-tenant mapping and a secret reference,
  never a plaintext service token. Body/query tenant IDs must match the mapped
  tenant or fail closed.
- Missing FORJD capabilities are explicit dependencies — never filled with DEML
  stream workers or direct FORJD database access.

**Operations:** [docs/FORJD_INTEGRATION.md](docs/FORJD_INTEGRATION.md),
[docs/CONNECTION_MAP.md](docs/CONNECTION_MAP.md),
[docs/PRODUCTION_DEPLOY.md](docs/PRODUCTION_DEPLOY.md),
[docs/PRODUCTION_CHECKLIST.md](docs/PRODUCTION_CHECKLIST.md).

**Steady-state flags (`deml-backend`):** `FORJD_WRITE_MODE=forjd` and
`FORJD_READ_MODE=forjd` are the production defaults (`FORJD_CUTOVER_PHASE=2`
is an equivalent legacy alias).

## Core Philosophy

- **Zero-Compromise Standards:** Quality is non-negotiable. Automate enforcement.
- **Precision Engineering:** Focus on architectural logic, not trivia.
- **Path of Least Resistance:** Tooling guides developers to the right thing.
- **Symmetrical Multi-Account Control Plane:** Account-scoped Django paths treat
  every mapped account identically. Stream processing and ML are FORJD’s job.
- **FORJD Data Plane:** Sealed ingest, projections, replay/DLQ, analytics, and
  threat/ML execute exclusively in FORJD via tenant-bound `fjsvc_` tokens.
- **Defense-in-Depth Security:** Firebase at DEML; Supabase Auth + service
  principals at FORJD; least privilege; automated scanning.
- **Observability as First-Class:** Product UI observability stays DEML-owned;
  sealed telemetry and analytics live in FORJD.
- **Automation Over Vigilance:** Pre-commit hooks, CI enforcement, doc sync.
- **Pragmatic & Sovereign:** Own identity, billing, consent, and learning content
  locally.
- **Inclusive & Accessible:** WCAG 2.0 Level AA (or greater) / Section 508.
- **Future-Proof:** Plan for PQC and FORJD-backed ML. Use `state_dict` only
  (no pickle) if any local model artifacts remain.

## Quality gates

| Layer | Command |
|-------|---------|
| Frontend | Root `npm test` · `npx ng build` · axe / a11y via deml-ui Storybook |
| Design system | In deml-ui: `npm run build` · `npm run storybook` · a11y addon |
| Backend | `cd backend && pytest` (touched modules) · Ruff via pre-commit |
| Full | `uvx pre-commit run --all-files` |
| CI | `.github/workflows/ci.yml`, `production-smoke.yml`, `publish-*.yml` |

- **Frontend:** Prettier + ESLint; WCAG AA; **deml-ui only**
  ([THEME.md](THEME.md), [.cursorrules](.cursorrules), [docs/DEML_UI.md](docs/DEML_UI.md)).
- **Backend (Python/Django):** Ruff; `uv` / `uvx pre-commit`; Postgres UUID PKs;
  AES-256-GCM + GCP KMS for secrets; no pickle for models.
- **Security:** Semgrep/Trivy/gitleaks in pre-push; Firebase Auth at DEML edge;
  sealed E2EE + tenant-bound `fjsvc_` to FORJD.

## Architecture & Data Principles

- **Decoupling:** Client (Angular) ↔ Server (Django) via REST + CORS.
  Streaming/processing ↔ FORJD via sealed envelopes + `fjsvc_` tokens.
- **Storage (DEML-owned):** Postgres (accounts, billing, consent, credentials,
  FORJD tenant mapping, learning progress); sessions in Postgres.
  Firebase is Auth-only — no Firestore, Storage, or Cloud Functions.
- **Storage (FORJD-owned):** Sealed events, projections, replay/DLQ, analytics, ML.
- **Multi-Tenancy:** Absolute isolation. Explicit
  `company_account → forjd_tenant_id` mapping. UUIDs everywhere.
- **UI/Frontend:** Angular 22+ at repo-root `src/`; Signals; **deml-ui** design
  system (not FORJD `forjd-ui`, not retired Viking-UI); Django SSE live updates;
  Headless Sanity for learning content. Browser never holds `fjsvc_`.
- **Deployment:** Django on Fly (`deml-backend`, `docs/FLY.md`); Angular on
  Vercel (`deml`, `docs/VERCEL.md`); deml-ui Storybook on Vercel (`ui.deml.app`).

## Workflows & Automation

- Pre-commit: `uvx pre-commit run --all-files`
- Docs start in BOOK.md/README; `scripts/sync_content.py` propagates
- Design changes land in **deml-ui** first, then bump deml’s `deml-ui` dependency

## What Agents Must Do

- Follow automated rules (lint, theme, a11y).
- Align features with symmetrical tenancy, zero-compromise security, and the
  DEML control plane / FORJD data plane boundary.
- Update BOOK.md first if architectural.
- Never introduce: hardcoded tenants, sequential IDs, pickle for models,
  inaccessible UI, DEML-local stream processing, or **Viking-UI / `packages/viking-ui`**.
- Treat [THEME.md](THEME.md) as the locked visual contract for all product UI.

## Key Tools & Scripts

- `scripts/git_flow.py` — versioning, PR automation
- `scripts/run_axe.js` — a11y enforcement (when present)
- `scripts/sync_content.py` — doc sync
- `scripts/sync_deml_ui_static.sh` — copy deml-ui CSS into Django static
- `.cursorrules` — deml-ui + THEME.md enforcement
- Pre-commit, ruff, eslint, prettier, uv, Docker (unprivileged)

## Project-Specific Agent Rules

### CORS and Dynamic Domains

- **NEVER** hardcode customer or tenant domains into `CORS_ALLOWED_ORIGINS`.
- Origin validation uses `monitor.cors_utils.is_domain_registered` against Postgres.

### Core Architectural Invariants

- **FORJD Exclusive Data Plane:** All sealed ingest, projections, analytics, and
  ML execute in FORJD. Contract: [docs/FORJD_INTEGRATION.md](docs/FORJD_INTEGRATION.md).
- **Tenant UUID Normalization:** Never use string literals like `"platform"` as
  foreign keys.
- **Account → FORJD Tenant Binding:** Every authenticated FORJD call resolves
  `deml_account_id → forjd_tenant_id → secret_ref` and fails closed on mismatch.
- **Angular Surface Intact:** Django adapters keep established Angular paths stable.

### deml-ui Uniformity Law (new-from-the-start)

All DEML product chrome uses **deml-ui** — the **new-from-the-start (warm ash)**
look. Expand from that system only. Do **not** mix cold seven-color locks,
Syne/Fraunces display stacks, or Viking chrome on top of NFTS (frankenstein UI).

Canonical docs: [.cursorrules](.cursorrules), [THEME.md](THEME.md),
[docs/DEML_UI.md](docs/DEML_UI.md), deml-ui [AGENTS.md](https://github.com/dataengineeringformachinelearning/deml-ui/blob/main/AGENTS.md).

**Warm ash palette:** `#35312D` `#1C1916` `#F3F0EA` `#D4CEC5` `#2F5F8F`
`#3F6B54` `#9E3D47` (+ muted `#C6C0B7` / `#4A453F`). `theme-color`:
`#35312D` / `#D4CEC5`.

- **SoT:** sibling / GitHub package `deml-ui` owns tokens (`styles/tokens.css`),
  component HTML/CSS (`components/<name>/`), Web Components, and Angular markup.
- **App shape:** Product UI lives at repo-root `src/`. Depend on
  `deml-ui` (`github:…/deml-ui#main`). Load
  `node_modules/deml-ui/dist/styles/deml-ui.css` via `angular.json`.
- **Behavioral wrappers:** `src/app/components/*` use `ViewEncapsulation.None`
  and deml-ui class contracts — **zero app-level DS chrome CSS**.
- **Compose pages** with `app-banner` → `app-page-section` → `app-section-header`
  → `app-tile-board` / `app-dashboard-grid` / `app-card-grid`.
- **Charts:** `app-area-chart` / `app-bar-chart` inside `app-chart-card` only.
  Keep `--chart-aspect: 2.4`; fluid `minmax(--tile-row-unit, auto)` rows — never
  squash with fixed-only tracks.
- **Theme:** `data-theme="light"|"dark"`; deml-ui warm-ash tokens only.
- **Typography:** **Geist only** for display, intro, and body.
- **A11y:** WCAG 2.0 AA — focus-visible, contrast, ≥44px `--hit-target`,
  reduced motion.
- **Retired — do not use:** Viking-UI, void-black / `#2176ff`, cold seven-color
  frankenstein palettes, Syne/Fraunces product stacks, `frontend/` product tree.
- After deml-ui changes: build deml-ui, bump deml’s dependency, run
  `scripts/sync_deml_ui_static.sh` for Django static mirrors.

### Critical Code Styling & Theming Law

Before editing HTML/CSS, conform to **THEME.md** and **.cursorrules**.
Use deml-ui warm-ash tokens. Angular product components must not add `styleUrl` /
`styleUrls` / inline `styles` for DS chrome.

### Code Style & Modernization

- Prefer `const`; arrow functions; `async`/`await` with proper error handling.
- Python: type annotations on all args/returns; `typing.Final` for constants.
- Tests must follow the same style rules.

### Documentation Rules

- **BOOK.md** — authoritative architecture and operations narrative.
- **WHITEPAPER.md** — concise value proposition and diagrams.
- Architectural changes start in BOOK.md; sync via `scripts/sync_content.py`.
- Design-system contribution docs live primarily in the **deml-ui** repo;
  consumer contract is locked in [THEME.md](THEME.md).

Update this file whenever BOOK.md evolves core principles.
