# DEML canonical use-cases

SoT for product use-cases. Contracts: [`packages/deml-contracts/`](../../packages/deml-contracts/).  
Matrix: [`MATRIX.md`](MATRIX.md) · Diagrams: [`DIAGRAMS.md`](DIAGRAMS.md).

**Invariants (FORJD-backed):** Browser never holds `fjsvc_`. BFF binds
`account → tenant → secret_ref` and fails closed. Steady state
`FORJD_WRITE_MODE=forjd` / `FORJD_READ_MODE=forjd`. Typed outage:
`503` + `code=forjd_degraded`. Retired product facades → **501**.

---

## UC-AUTH-001 — Firebase login & identity probe

| Field | Contract |
|-------|----------|
| **Trigger** | `/login` · Firebase sign-in |
| **Happy path** | Firebase ID token → `GET /api/v1/auth/user` → AuthUserResponse |
| **Errors** | Invalid token → `401` |
| **How it works** | Browser signs in with Firebase; BFF verifies the ID token — no FORJD. Diagram: [`DIAGRAMS.md#auth-identity`](DIAGRAMS.md#auth-identity) |
| **Ownership** | `backend` + Firebase · UI `src/` · types `deml-contracts` |

---

## UC-AUTH-002 — Browser session registry

| Field | Contract |
|-------|----------|
| **Trigger** | Post-login bootstrap; list/revoke sessions |
| **Happy path** | `POST/GET/DELETE /api/v1/auth/sessions` → Postgres `browser_sessions` + `X-DEML-Session-Id` |
| **Errors** | `401` / `404`; touch writes throttled |
| **How it works** | BFF registers a Postgres browser_session and echoes X-DEML-Session-Id. Diagram: [`DIAGRAMS.md#auth-sessions`](DIAGRAMS.md#auth-sessions) |
| **Ownership** | `backend` · UI settings |

---

## UC-AUTH-003 — Auth handoff (desktop / cross-device)

| Field | Contract |
|-------|----------|
| **Trigger** | `POST /api/v1/auth/handoff/*` · desktop session |
| **Happy path** | Short-lived handoff token → verify once → target session |
| **Errors** | Expired/used → `401/410`; abuse → `429` |
| **How it works** | Handoff tokens in Postgres bridge web → desktop/native. Diagram: [`DIAGRAMS.md#auth-sessions`](DIAGRAMS.md#auth-sessions) |
| **Ownership** | `backend` · `native` |

---

## UC-AUTH-004 — Logout

| Field | Contract |
|-------|----------|
| **Trigger** | Sign-out → `POST /api/v1/auth/logout` + Firebase signOut |
| **Happy path** | Invalidate server session; clear client principal |
| **Errors** | Idempotent if already logged out |
| **How it works** | BFF invalidates session association; client Firebase signOut. Diagram: [`DIAGRAMS.md#auth-identity`](DIAGRAMS.md#auth-identity) |
| **Ownership** | `backend` + `src/` |

---

## UC-AUTH-005 — DEML API key lifecycle

| Field | Contract |
|-------|----------|
| **Trigger** | Settings credential UI |
| **Happy path** | Generate one-time `deml_` key → hash stored → list/revoke |
| **Errors** | Unknown revoke → `404`; never re-display secret |
| **How it works** | Operator generates a deml_ key; only the hash is stored. Diagram: [`DIAGRAMS.md#auth-identity`](DIAGRAMS.md#auth-identity) |
| **Ownership** | `backend` · UI settings |

---

## UC-AUTH-006 — Account deletion saga

| Field | Contract |
|-------|----------|
| **Trigger** | `DELETE /api/v1/auth/delete-account` |
| **Happy path** | FORJD tenant erase → revoke keys → Stripe cancel → delete Firebase/Django |
| **Errors** | Erase fail → `503`, identity left intact |
| **How it works** | Lifecycle calls FORJD erase first, then tears down DEML identity fail-closed. Diagram: [`DIAGRAMS.md#auth-delete`](DIAGRAMS.md#auth-delete) |
| **Ownership** | `backend/account/lifecycle.py` · erase `forjd` |

---

## UC-BILL-001 — Pro checkout session

| Field | Contract |
|-------|----------|
| **Trigger** | `POST /api/v1/billing/create-checkout-session` |
| **Happy path** | *(Gated)* Stripe Checkout session URL when enabled |
| **Errors** | Checkout currently hard-disabled; missing price → fail closed |
| **How it works** | BFF creates Stripe Checkout for Pro when gate is on. Diagram: [`DIAGRAMS.md#billing`](DIAGRAMS.md#billing) |
| **Ownership** | `backend/billing` |

---

## UC-BILL-002 — Stripe webhook & entitlement sync

| Field | Contract |
|-------|----------|
| **Trigger** | `POST /api/v1/billing/webhook` · sync · daily maintenance |
| **Happy path** | Verify signature → update `tier` / `subscription_active` |
| **Errors** | Missing webhook secret → reject |
| **How it works** | Stripe webhooks sync entitlement onto the DEML account. Diagram: [`DIAGRAMS.md#billing`](DIAGRAMS.md#billing) |
| **Ownership** | `backend/billing` |

---

## UC-BILL-003 — Cancel / resume subscription

| Field | Contract |
|-------|----------|
| **Trigger** | cancel/resume subscription APIs |
| **Happy path** | Stripe mutate → profile sync |
| **Errors** | No subscription → typed error |
| **How it works** | Authenticated cancel/resume refreshes local entitlement. Diagram: [`DIAGRAMS.md#billing`](DIAGRAMS.md#billing) |
| **Ownership** | `backend/billing` |

---

## UC-CONSENT-001 — Cookie consent telemetry

| Field | Contract |
|-------|----------|
| **Trigger** | Consent banner → telemetry/users consent POST |
| **Happy path** | Persist consent choice in Postgres |
| **Errors** | Validation → `422` |
| **How it works** | Browser posts cookie consent; BFF stores metadata-only rows. Diagram: [`DIAGRAMS.md#consent`](DIAGRAMS.md#consent) |
| **Ownership** | `backend/monitor` |

---

## UC-CONSENT-002 — Newsletter subscribe

| Field | Contract |
|-------|----------|
| **Trigger** | Newsletter form POST |
| **Happy path** | Validate email → store / Resend forward |
| **Errors** | Invalid email; rate limit |
| **How it works** | Newsletter subscribe stores email preference (no FORJD). Diagram: [`DIAGRAMS.md#consent`](DIAGRAMS.md#consent) |
| **Ownership** | `backend/monitor` |

---

## UC-DASH-001 — Dashboard CES / KPI overview

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Dashboard/analytics overview unmounted; partners call FORJD analytics with `fjsvc_`. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

Product SPA has no `/dashboard`. Catch-all proxy returns `501` `forjd_capability_unavailable`.

---

## UC-ANALYTICS-001 — Analytics page + live SSE

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Live SSE bridge removed; partners poll FORJD projections directly. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-ANALYTICS-002 — Incident cases

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | SOC cases facade unmounted; partners call FORJD `/api/v1/soc/cases`. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-ANALYTICS-003 — SOAR playbooks execute / ack / retry

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Playbook proxies unmounted; partners call FORJD playbooks/runs APIs. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-SIEM-001 — SIEM signals

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | SIEM proxy unmounted; partners call FORJD `/api/v1/siem/signals`. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-VULN-001 — Vulnerabilities

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Vuln proxy unmounted; partners call FORJD `/api/v1/vulnerabilities`. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-STATUS-001 — Authenticated status page admin

| Field | Contract |
|-------|----------|
| **Trigger** | Settings sites → `/api/v1/system-status/status_pages*` |
| **Happy path** | BFF product `fjsvc_` → FORJD status CRUD (platform filtered) |
| **Errors** | Platform page immutable; outage → `503` not empty list |
| **How it works** | Owned sites CRUD proxies FORJD with ownership preflight. Diagram: [`DIAGRAMS.md#status`](DIAGRAMS.md#status) |
| **Ownership** | Adapter `backend/forjd` · data `forjd` · UI settings |

---

## UC-STATUS-002 — Public / explore status

| Field | Contract |
|-------|----------|
| **Trigger** | `/explore` · `/status/:slug` |
| **Happy path** | Public directory + slug embed via BFF (unauth FORJD client) |
| **Errors** | FORJD 5xx → `503`; missing/unknown → Unknown (never invent green) |
| **How it works** | Explore and slug pages read published FORJD status only. Diagram: [`DIAGRAMS.md#status`](DIAGRAMS.md#status) |
| **Ownership** | `backend/forjd` · UI explore/isolated-status |

---

## UC-INGEST-001 — Sealed telemetry ingest (single)

| Field | Contract |
|-------|----------|
| **Trigger** | `POST /api/v1/ingest` (Firebase or `deml_` key) |
| **Happy path** | Sealed envelope → rewrite wire ids → FORJD ingest |
| **Errors** | Write mode off / degrade → typed error; never plaintext |
| **How it works** | Client-sealed event forwarded with tenant-bound `fjsvc_`. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | `backend/forjd` · contracts `SealedEvent` |

---

## UC-INGEST-002 — Sealed batch ingest

| Field | Contract |
|-------|----------|
| **Trigger** | Batch ingest (≤25 events, body cap) |
| **Happy path** | Same as single, batched |
| **Errors** | Oversized → reject |
| **How it works** | Sealed batch forward with same tenant bind + limits. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | `backend/forjd` |

---

## UC-INGEST-003 — Crypto sessions

| Field | Contract |
|-------|----------|
| **Trigger** | `/api/v1/sessions*` |
| **Happy path** | Register/open crypto session for sealed envelopes |
| **Errors** | Unmapped / degraded → typed failure |
| **How it works** | Crypto-session proxy enables sealed ingest key_id registration. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | `backend/forjd` · `forjd` |

---

## UC-PIPE-001 — Pipeline Studio compose / export

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | `/pipeline` and workflows catalog unmounted; partners author YAML on FORJD. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-PROJ-001 — Projections, replay, DLQ

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Projections/replay/DLQ proxies unmounted; partners call FORJD. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-EXPORT-001 — Durable exports

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Exports proxy unmounted; partners call FORJD exports APIs. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-ML-001 — ML read / train / predict

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | ML/predict proxies unmounted; partners call FORJD `/api/v1/ml/*`. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-COMPLY-001 — SOC compliance status

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Compliance SOC proxy unmounted; partners call FORJD compliance APIs. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-REPORT-001 — Issue report → FORJD documents

| Field | Contract |
|-------|----------|
| **Trigger** | `POST /api/v1/agent/report-issue` |
| **Happy path** | Redact → FORJD report document; outbox retry if degraded |
| **Errors** | Unmapped/outage → durable local outbox, not silent drop |
| **How it works** | Issue reports become FORJD documents with opaque acct pseudonym. Diagram: [`DIAGRAMS.md#report`](DIAGRAMS.md#report) |
| **Ownership** | `backend` + reconcile worker · `forjd` |

---

## UC-INTEG-001 — Analytics vendor integrations

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | GA/Clarity/Cloudflare settings unmounted; not on status path. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Unmounted |

---

## UC-INTEG-002 — Security alert webhook

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Security-alert proxy unmounted; partners call FORJD integrations. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Partner → `forjd` |

---

## UC-WIDGET-001 — Public widget telemetry

| Field | Contract |
|-------|----------|
| **Trigger** | `POST /api/v1/system-status/widget-telemetry` |
| **Happy path** | Public IP-limited path → seal server-side → FORJD ingest |
| **Errors** | Rate limit → `429`; FORJD degrade typed |
| **How it works** | Anonymous status-widget events sealed and forwarded. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | `backend/forjd` |

---

## UC-HEALTH-001 — Control-plane health & continuity

| Field | Contract |
|-------|----------|
| **Trigger** | `GET /api/v1/health` · `/ready` · `/forjd/capabilities` |
| **Happy path** | Liveness ok; readiness reports DB + FORJD credential presence (soft forjd_health) |
| **Errors** | Missing secrets fail PaaS boot; soft FORJD degrade does not take BFF offline |
| **How it works** | Ops probes stay DEML-owned with soft FORJD signal. Diagram: [`DIAGRAMS.md#ops`](DIAGRAMS.md#ops) |
| **Ownership** | `backend/config` |

---

## UC-SETTINGS-001 — Settings surface

| Field | Contract |
|-------|----------|
| **Trigger** | Navigate `/settings` |
| **Happy path** | Account display name + owned sites CRUD (UC-STATUS-001) |
| **Errors** | Offline blocks writes; owned list outage → error not empty |
| **How it works** | Settings composes DEML identity APIs + owned status pages. Diagram: [`DIAGRAMS.md#settings`](DIAGRAMS.md#settings) |
| **Ownership** | UI `src/app/pages/settings` · BFF auth + forjd |

---

## UC-ACCOUNT-001 — Account preferences

| Field | Contract |
|-------|----------|
| **Trigger** | `/settings` account section |
| **Happy path** | Display name, email (read-only), sessions, API keys, delete |
| **Errors** | Auth required; delete follows UC-AUTH-006 |
| **How it works** | Account prefs live under Settings — no parallel account app. Diagram: [`DIAGRAMS.md#settings`](DIAGRAMS.md#settings) |
| **Ownership** | UI settings · `backend` auth |

---

## UC-ONBOARD-001 — Onboarding checklist & suite activity

| Field | Contract |
|-------|----------|
| **Status** | **Retired on DEML BFF — returns 501** |
| **How it works** | Dashboard onboarding/suite activity removed with the dashboard. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Unmounted |

---

## UC-CORS-001 — Dynamic CORS registration

| Field | Contract |
|-------|----------|
| **Trigger** | Cross-origin browser call to BFF |
| **Happy path** | Origin validated via `monitor.cors_utils.is_domain_registered` |
| **Errors** | Unregistered origin rejected — never hardcode tenant domains |
| **How it works** | CORS allowlist is Postgres-backed per registered domain. Diagram: [`DIAGRAMS.md#ops`](DIAGRAMS.md#ops) |
| **Ownership** | `backend/monitor` |

---

## UC-LEARN-001 — Learning progress (deferred)

| Field | Contract |
|-------|----------|
| **Status** | **Retired / deferred on DEML BFF — returns 501** |
| **How it works** | No learning ingest on the BFF; plaintext learning payloads stay rejected. Partners do not use DEML for course progress. Diagram: [`DIAGRAMS.md#retired`](DIAGRAMS.md#retired) |
| **Ownership** | Reserved — not a live DEML product path |
