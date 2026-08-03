# DEML canonical use-case contracts

Single source of truth for product use-cases in the **deml** control-plane monorepo.
Machine-readable twins live in [`packages/deml-contracts/`](../../packages/deml-contracts/).
Coverage vs current code: [`MATRIX.md`](MATRIX.md).
Flow diagrams: [`DIAGRAMS.md`](DIAGRAMS.md) (linked from each UC **How it works**).

**Legend — ownership packages**

| Code | Package / surface |
|------|-------------------|
| `frontend` | `src/` Angular SPA (deml.app) |
| `backend` | `backend/` Django/Ninja BFF (backend.deml.app) |
| `deml-ui` | sibling repo `deml-ui` (design system) |
| `deml-crypto` | `packages/deml-crypto` |
| `deml-rate-limit` | `packages/deml-rate-limit` |
| `deml-contracts` | `packages/deml-contracts` (**contract SoT** — import from here) |
| `forjd` | External repo `forjd` (data plane — not owned here) |
| `native` | `native/` macOS workbench |

**Shared invariants (all FORJD-backed UCs)**

1. Browser holds Firebase ID token only — never `fjsvc_`.
2. BFF resolves `deml_account_id → forjd_tenant_id → service_token_secret_ref` and fails closed.
3. Body/query `tenant_id` must match mapped tenant.
4. Privileged denials/successes → metadata-only DEML audit (no ciphertext, tokens, bodies).
5. Steady state: `FORJD_WRITE_MODE=forjd`, `FORJD_READ_MODE=forjd`.
6. Correlation: propagate `X-Request-ID` (8–128 chars); surface `X-FORJD-Request-ID`.
7. Typed outage: `503` + `code=forjd_degraded` (never healthy empty collection for threat/case/vuln/export).
8. Pro entitlement on premium writes: `tier=Pro` + `subscription_active` or `403` + `code=pro_required`.

**Shared error envelope (DEML BFF JSON)** — schema `ErrorEnvelope` in deml-contracts:

```json
{ "detail": "string", "code": "forjd_degraded|forjd_forbidden|pro_required|validation_error|rate_limited|…" }
```

---

## UC-AUTH-001 — Firebase login & identity probe

| Field | Contract |
|-------|----------|
| **ID** | `UC-AUTH-001` |
| **Name** | Firebase login & identity probe |
| **Actors** | End user (browser), Firebase Auth, DEML BFF |
| **Trigger** | Navigate `/login` or guest CTA; Firebase sign-in completes |
| **Happy path** | `frontend` Firebase SDK → ID token → `GET /api/v1/auth/user` (Bearer) → Django verifies Firebase → returns `{status,user,user_id,role}` → Angular `AuthService` signals authenticated |
| **Errors / edges** | Invalid/expired token → `401`; unregistered Firebase user without session → middleware fail-closed; `/api/v1/auth/register` is monitor health only (not user create) |
| **Data contracts** | `AuthUserResponse` (`deml-contracts`); Firebase JWT claims; `User` + `UserProfile.role` (Django) |
| **Observability** | Structured log auth success/fail without token material; optional Sentry/Rollbar on BFF; no FORJD call |
| **How it works** | Browser signs in with Firebase; BFF verifies the ID token and returns AuthUserResponse — no FORJD call. Diagram: [`DIAGRAMS.md#auth-identity`](DIAGRAMS.md#auth-identity) |
| **Ownership** | SoT identity: `backend` + Firebase project config. UI: `frontend`. Types: `deml-contracts` |

---

## UC-AUTH-002 — Browser session registry

| Field | Contract |
|-------|----------|
| **ID** | `UC-AUTH-002` |
| **Name** | Browser session register / list / revoke |
| **Actors** | Authenticated end user |
| **Trigger** | Post-login session bootstrap; Settings/Account session list; revoke |
| **Happy path** | `POST /api/v1/auth/sessions` with client metadata → Postgres `browser_sessions` → `X-DEML-Session-Id` on subsequent calls → `GET/DELETE /api/v1/auth/sessions[/{id}]` |
| **Errors / edges** | Unauthenticated → `401`; unknown session → `404`; touch writes throttled (≤120s) per SCALE.md |
| **Data contracts** | `SessionRegisterIn/Out`, `SessionOut`; model `BrowserSession` |
| **Observability** | Audit session revoke; no secrets in logs |
| **How it works** | Post-login, the BFF registers a Postgres browser_session and echoes X-DEML-Session-Id for list/revoke. Diagram: [`DIAGRAMS.md#auth-sessions`](DIAGRAMS.md#auth-sessions) |
| **Ownership** | `backend` (models + api_auth). UI: `frontend` settings/account |

---

## UC-AUTH-003 — Auth handoff (desktop / cross-device)

| Field | Contract |
|-------|----------|
| **ID** | `UC-AUTH-003` |
| **Name** | Auth handoff generate / verify |
| **Actors** | Authenticated user, desktop/native client |
| **Trigger** | `POST /api/v1/auth/handoff/generate` then `POST /api/v1/auth/handoff/verify`; desktop `POST /api/v1/auth/desktop/session` |
| **Happy path** | Generate short-lived handoff token (Postgres) → verify once → establish session for target client |
| **Errors / edges** | Expired/used token → `401/410`; rate-limit abuse → `429` |
| **Data contracts** | `HandoffGenerateOut`, `HandoffVerifyIn/Out`; model `AuthHandoffToken` |
| **Observability** | Metadata-only handoff events; never log raw token |
| **How it works** | Short-lived handoff tokens in Postgres bridge web → desktop/native session establishment. Diagram: [`DIAGRAMS.md#auth-sessions`](DIAGRAMS.md#auth-sessions) |
| **Ownership** | `backend`; consumer `native` / desktop paths |

---

## UC-AUTH-004 — Logout

| Field | Contract |
|-------|----------|
| **ID** | `UC-AUTH-004` |
| **Name** | Server logout |
| **Actors** | Authenticated end user |
| **Trigger** | Sign-out control → `POST /api/v1/auth/logout` + Firebase client signOut |
| **Happy path** | Invalidate DEML server session association → client clears Firebase → redirect guest |
| **Errors / edges** | Idempotent if already logged out |
| **Data contracts** | `SuccessSchema` |
| **Observability** | Logout audit without PII beyond user id |
| **How it works** | BFF invalidates server session association; client Firebase signOut clears the browser principal. Diagram: [`DIAGRAMS.md#auth-identity`](DIAGRAMS.md#auth-identity) |
| **Ownership** | `backend` + `frontend` |

---

## UC-AUTH-005 — DEML API key lifecycle

| Field | Contract |
|-------|----------|
| **ID** | `UC-AUTH-005` |
| **Name** | Generate / list / revoke `deml_` API keys |
| **Actors** | Authenticated end user (Operator+ for headless use) |
| **Trigger** | Settings/Account credential UI |
| **Happy path** | `POST /api/v1/auth/api-keys/generate` → one-time `deml_{prefix}_{secret}` → hash stored → list/revoke by id |
| **Errors / edges** | Prefix collision retries; revoke unknown → `404`; never re-display secret |
| **Data contracts** | `APIKeyGenerateIn/Out`, `APIKeyOut`; model `APIKey` |
| **Observability** | Audit generate/revoke (prefix only) |
| **How it works** | Operator generates a one-time deml_ key; only the hash is stored; revoke by id. Diagram: [`DIAGRAMS.md#auth-identity`](DIAGRAMS.md#auth-identity) |
| **Ownership** | `backend`. UI: `frontend` |

---

## UC-AUTH-006 — Account deletion saga

| Field | Contract |
|-------|----------|
| **ID** | `UC-AUTH-006` |
| **Name** | Account deletion with FORJD tenant erase |
| **Actors** | Authenticated end user; DEML lifecycle worker; FORJD |
| **Trigger** | `DELETE /api/v1/auth/delete-account` |
| **Happy path** | Lifecycle job → `POST /api/v1/tenants/{id}/erase` (FORJD, `tenants:erase`) → revoke DEML keys → Stripe cancel best-effort → delete Firebase user → delete Django user → `{completed:true}` |
| **Errors / edges** | FORJD erase fail → `503`, identity left intact; job durable via `UserLifecycleJob` + reconcile worker |
| **Data contracts** | `DeleteAccountOut`; `UserLifecycleJob`; FORJD erase API (external) |
| **Observability** | Lifecycle state transitions; FORJD request id; never log erase payload secrets |
| **How it works** | Lifecycle job calls FORJD tenant erase first, then revokes DEML identity/billing artifacts fail-closed on erase outage. Diagram: [`DIAGRAMS.md#auth-delete`](DIAGRAMS.md#auth-delete) |
| **Ownership** | Orchestration SoT: `backend/account/lifecycle.py`. Erase data-plane: `forjd` |

---

## UC-BILL-001 — Pro checkout session

| Field | Contract |
|-------|----------|
| **ID** | `UC-BILL-001` |
| **Name** | Create Stripe Checkout session |
| **Actors** | Authenticated user, Stripe |
| **Trigger** | Pricing CTA → `POST /api/v1/billing/create-checkout-session` |
| **Happy path** | *(Contract)* When checkout enabled: create Stripe session → return URL → `/success` after Stripe redirect |
| **Errors / edges** | **Current product gate:** Pro checkout hard-disabled (`_PRO_CHECKOUT_ENABLED=False`) → unavailable message; missing `STRIPE_PRICE_ID` → fail closed; webhook secret required for mutations via webhook path |
| **Data contracts** | Checkout session response; Stripe Customer/Subscription ids on `UserProfile` |
| **Observability** | Stripe error_type logs; no card data at DEML |
| **How it works** | BFF creates a Stripe Checkout session for Pro; success path lands back in Settings/billing. Diagram: [`DIAGRAMS.md#billing`](DIAGRAMS.md#billing) |
| **Ownership** | `backend/billing`. UI: `frontend` product-home/settings |

---

## UC-BILL-002 — Stripe webhook & entitlement sync

| Field | Contract |
|-------|----------|
| **ID** | `UC-BILL-002` |
| **Name** | Stripe webhook + subscription sync |
| **Actors** | Stripe, DEML BFF, daily_maintenance worker |
| **Trigger** | `POST /api/v1/billing/webhook`; `POST /api/v1/billing/sync`; daily maintenance watch |
| **Happy path** | Verify signature → update `tier` / `subscription_active` / period end → Pro entitlement gates FORJD premium writes |
| **Errors / edges** | Missing webhook secret → reject; resource_missing cancel paths; basil API period-end on items |
| **Data contracts** | Stripe event payloads; `UserProfile` billing fields |
| **Observability** | Webhook processing logs; sync outcomes |
| **How it works** | Stripe webhooks sync subscription_active / tier onto the DEML account entitlement. Diagram: [`DIAGRAMS.md#billing`](DIAGRAMS.md#billing) |
| **Ownership** | `backend/billing` + `monitor` maintenance |

---

## UC-BILL-003 — Cancel / resume subscription

| Field | Contract |
|-------|----------|
| **ID** | `UC-BILL-003` |
| **Name** | Cancel or resume Pro subscription |
| **Actors** | Authenticated Pro user |
| **Trigger** | Settings billing controls → `POST /api/v1/billing/cancel-subscription` \| `resume-subscription` |
| **Happy path** | Stripe API mutate → profile sync → UI reflects entitlement |
| **Errors / edges** | No subscription → typed error; Stripe 404 treated as missing |
| **Data contracts** | Billing status on profile |
| **Observability** | Cancel/resume audit |
| **How it works** | Authenticated cancel/resume mutates Stripe subscription and refreshes local entitlement. Diagram: [`DIAGRAMS.md#billing`](DIAGRAMS.md#billing) |
| **Ownership** | `backend/billing`. UI: `frontend` settings |

---

## UC-CONSENT-001 — Cookie consent telemetry

| Field | Contract |
|-------|----------|
| **ID** | `UC-CONSENT-001` |
| **Name** | Cookie consent record |
| **Actors** | Anonymous or authenticated visitor |
| **Trigger** | Consent banner → `POST /api/v1/telemetry/cookie-consent` or `POST /api/v1/users/consent` |
| **Happy path** | Persist consent choice locally (DEML Postgres) |
| **Errors / edges** | Validation fail → `422`; public anon write path allowlisted |
| **Data contracts** | Consent payload schema |
| **Observability** | Count-only metrics preferred; no fingerprinting beyond stated policy |
| **How it works** | Browser posts cookie consent choices; BFF persists metadata-only consent rows. Diagram: [`DIAGRAMS.md#consent`](DIAGRAMS.md#consent) |
| **Ownership** | `backend/monitor` |

---

## UC-CONSENT-002 — Newsletter subscribe

| Field | Contract |
|-------|----------|
| **ID** | `UC-CONSENT-002` |
| **Name** | Newsletter subscribe |
| **Actors** | Anonymous visitor |
| **Trigger** | Marketing/product form → `POST /api/v1/telemetry/subscribe` or `/api/v1/users/newsletter` |
| **Happy path** | Validate email → store / forward per Resend config |
| **Errors / edges** | Invalid email; rate limit |
| **Data contracts** | Newsletter subscribe in |
| **Observability** | Subscribe success/fail without full PII in info logs |
| **How it works** | Newsletter subscribe stores email preference under consent models (no FORJD). Diagram: [`DIAGRAMS.md#consent`](DIAGRAMS.md#consent) |
| **Ownership** | `backend/monitor` |

---

## UC-DASH-001 — Dashboard CES / KPI overview

| Field | Contract |
|-------|----------|
| **ID** | `UC-DASH-001` |
| **Name** | Authenticated dashboard overview |
| **Actors** | Viewer+ user |
| **Trigger** | Navigate `/dashboard` (authGuard) |
| **Happy path** | Angular loads → `GET /api/v1/analytics/overview` (+ tenants) via BFF → FORJD analytics → deml-ui metric/HUD/chart panels; optional onboarding checklist + stream status; SSE/poll refresh via UC-ANALYTICS-001 |
| **Errors / edges** | Unmapped tenant / FORJD down → `503` `forjd_degraded` + deml-ui callout; Viewer ok for reads |
| **Data contracts** | Analytics overview DTO (FORJD-shaped, BFF-adapted); `SuiteActivityEntry` / onboarding types from deml-ui |
| **Observability** | `X-Request-ID`; dashboard load latency; degraded flag |
| **How it works** | Dashboard loads CES/KPI via BFF; FORJD-backed metrics resolve through tenant-bound proxy. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | UI: `frontend` + `deml-ui`. Adapter: `backend/forjd`. Aggregates: `forjd` |

---

## UC-ANALYTICS-001 — Analytics page + live SSE

| Field | Contract |
|-------|----------|
| **ID** | `UC-ANALYTICS-001` |
| **Name** | Analytics surface with live projection ticks |
| **Actors** | Viewer+ user |
| **Trigger** | `/analytics`; `EventSource` → `GET /api/v1/analytics/live` |
| **Happy path** | Authorize read → resolve tenant `fjsvc_` → poll FORJD `GET /api/v1/projections?since=` → SSE events `ready` \| `projections` `{count,cursor}` \| keepalive \| `end`; client refreshes REST adapters; 60s poll fallback |
| **Errors / edges** | Auth/policy → `401/403` `forjd_forbidden`; upstream outage → SSE `degraded` + REST `503`; tune `DEML_LIVE_*` |
| **Data contracts** | `LiveSseReady`, `LiveSseProjections`, `LiveSseDegraded` in deml-contracts; never ciphertext in SSE |
| **Observability** | Stream open/close, degraded counts, poll duration |
| **How it works** | Analytics page hydrates FORJD projections; SSE ticks are count/cursor only from Django live endpoint. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | SSE bridge: `backend/forjd/live.py`. UI: `frontend` LiveUpdatesService. Data: `forjd` |

---

## UC-ANALYTICS-002 — Incident cases

| Field | Contract |
|-------|----------|
| **ID** | `UC-ANALYTICS-002` |
| **Name** | SOC incident cases list/detail/mutate |
| **Actors** | Viewer (read), Operator+ (write), Pro for writes |
| **Trigger** | Analytics incidents UI → `/api/v1/analytics/incidents[/id]` → FORJD `/api/v1/soc/cases` |
| **Happy path** | BFF policy → tenant bind → proxy → UI render |
| **Errors / edges** | Role/Pro denial → `403`; degraded → `503` not empty 200 |
| **Data contracts** | FORJD case schemas (external SoT); DEML path alias only |
| **Observability** | FORJD audit + DEML privileged audit |
| **How it works** | Incident cases are proxied from FORJD; outages return typed forjd_degraded, never empty-success. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | Data: `forjd`. Adapter/policy: `backend`. UI: `frontend` |

---

## UC-ANALYTICS-003 — SOAR playbooks execute / ack / retry

| Field | Contract |
|-------|----------|
| **ID** | `UC-ANALYTICS-003` |
| **Name** | Playbook admin, execute, action ack/retry |
| **Actors** | Operator+ / Security Admin; headless `deml_` key with header auth for ack/retry |
| **Trigger** | `/api/v1/analytics/playbooks*`, `playbook-runs*`, ack/retry |
| **Happy path** | Policy `playbook.execute` → inject mapped tenant → forward once → FORJD durable action results |
| **Errors / edges** | Ack body only `{succeeded, external_reference?, metadata?}`; retry empty object; **CSRF-exempt only with header auth** (`csrf_exempt_require_header_auth`); no cookie-only authority; hide webhook secrets/leases |
| **Data contracts** | `PlaybookActionAckIn`, `PlaybookActionRetryIn`; run action result shape (FORJD) |
| **Observability** | Action id stability across retries; DEML audit |
| **How it works** | Playbook execute/ack/retry proxy to FORJD SOAR with Pro gate and request-id correlation. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `forjd` playbooks; `backend` adapter + CSRF gate; UI `frontend` |

---

## UC-SIEM-001 — SIEM signals

| Field | Contract |
|-------|----------|
| **ID** | `UC-SIEM-001` |
| **Name** | SIEM signal read/write |
| **Actors** | Viewer read; Operator+ write + Pro |
| **Trigger** | `GET/POST /api/v1/siem/signals` |
| **Happy path** | Policy → tenant bind → FORJD SIEM |
| **Errors / edges** | Pro required on write; degraded typed |
| **Data contracts** | FORJD SIEM signal schema |
| **Observability** | Correlation ids preserved |
| **How it works** | SIEM signals list/detail proxy FORJD; BFF enforces tenant binding + degrade codes. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `forjd` + `backend` adapter |

---

## UC-VULN-001 — Vulnerabilities

| Field | Contract |
|-------|----------|
| **ID** | `UC-VULN-001` |
| **Name** | Vulnerability list / detail / mutate |
| **Actors** | Viewer read; Operator+ write + Pro |
| **Trigger** | `/vulnerabilities` → `/api/v1/agent/vulnerabilities[/id]` → FORJD `/api/v1/vulnerabilities` |
| **Happy path** | BFF proxy → virtual list UI |
| **Errors / edges** | Degraded ≠ empty; Pro on writes |
| **Data contracts** | FORJD vulnerability schema |
| **Observability** | Request correlation; UI loading/empty deml-ui states |
| **How it works** | Vulnerability views proxy FORJD scanners; same degrade / Pro invariants as other threat UCs. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `forjd` + `backend` + `frontend` |

---

## UC-STATUS-001 — Authenticated status page admin

| Field | Contract |
|-------|----------|
| **ID** | `UC-STATUS-001` |
| **Name** | Status pages / services / incidents CRUD |
| **Actors** | Security Admin (admin), Operator per policy |
| **Trigger** | `/status` authenticated flows → `/api/v1/system-status/status_pages*` |
| **Happy path** | BFF → FORJD `/api/v1/status/*` |
| **Errors / edges** | Unpublished pages not world-readable except explore rules |
| **Data contracts** | FORJD status page models |
| **Observability** | Admin mutations audited |
| **How it works** | Authenticated admin configures tenant status page content stored in DEML. Diagram: [`DIAGRAMS.md#status`](DIAGRAMS.md#status) |
| **Ownership** | `forjd` + `backend` + `frontend` `/status` |

---

## UC-STATUS-002 — Public / explore status

| Field | Contract |
|-------|----------|
| **ID** | `UC-STATUS-002` |
| **Name** | Public status by slug + explore gallery |
| **Actors** | Anonymous visitor |
| **Trigger** | `/explore`, `/status/:slug` → `GET .../status_pages/slug/{slug}` (public) |
| **Happy path** | Published-only via platform `FORJD_*` credential at BFF; continuity probe on landing |
| **Errors / edges** | Unpublished → 404; FORJD degraded → soft callout not fake OK |
| **Data contracts** | Public status page DTO |
| **Observability** | Public path rate limits; no user token |
| **How it works** | Public /explore status reads published config without end-user tokens. Diagram: [`DIAGRAMS.md#status`](DIAGRAMS.md#status) |
| **Ownership** | `backend` public adapters; `frontend` explore/isolated-status |

---

## UC-INGEST-001 — Sealed telemetry ingest (single)

| Field | Contract |
|-------|----------|
| **ID** | `UC-INGEST-001` |
| **Name** | Sealed single-event ingest |
| **Actors** | Operator+ (or headless `deml_` with ingest role); Angular sealer |
| **Trigger** | Client seals locally → `POST /api/v1/ingest` (native adapter) or Ninja `POST /api/v1/forjd/ingest` |
| **Happy path** | Validate `SealedEvent` → rewrite `deml_*` → `threat_*` → Authorization `fjsvc_` → FORJD ingest → receipt/`status_path` for processing poll |
| **Errors / edges** | Plaintext metadata rejected; batch size N/A; `REQUIRE_CRYPTO_SESSION` needs session key_id; write mode off → block; rate limit 429; max body 8 MiB |
| **Data contracts** | `SealedEvent`, `EncryptedEnvelope` (**deml-contracts** + today `backend/forjd/api.py`); FORJD ingest receipt |
| **Observability** | Audit ingest attempt (ids only); shadow receipts in dual mode |
| **How it works** | Browser seals a single event; BFF forwards ciphertext to FORJD with fjsvc_ — never plaintext. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | Wire validation: `backend` (moving to `deml-contracts`). Ciphertext pipeline: `forjd`. Seal UX: `frontend` + `deml-crypto` patterns |

---

## UC-INGEST-002 — Sealed batch ingest

| Field | Contract |
|-------|----------|
| **ID** | `UC-INGEST-002` |
| **Name** | Sealed batch ingest (≤25) |
| **Actors** | Same as UC-INGEST-001 |
| **Trigger** | `POST /api/v1/ingest/events:batch` or `/api/v1/forjd/ingest/events:batch` |
| **Happy path** | Validate `SealedEventBatch` → rewrite → FORJD batch → processing status `GET /api/v1/ingest/processing/{batch_id}` |
| **Errors / edges** | >25 events rejected; partial failure semantics owned by FORJD |
| **Data contracts** | `SealedEventBatch` |
| **Observability** | batch_id correlation |
| **How it works** | Batch sealed envelopes follow the same E2EE path with bounded batch validation. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | Same as UC-INGEST-001 |

---

## UC-INGEST-003 — Crypto sessions

| Field | Contract |
|-------|----------|
| **ID** | `UC-INGEST-003` |
| **Name** | FORJD crypto session register / revoke |
| **Actors** | Operator+ |
| **Trigger** | `/api/v1/sessions` GET/POST; revoke `DELETE/POST` session id |
| **Happy path** | BFF tenant bind → FORJD crypto sessions → client uses `envelope.key_id` |
| **Errors / edges** | Missing session when required → ingest 4xx from FORJD |
| **Data contracts** | FORJD session schemas |
| **Observability** | Session id only in logs |
| **How it works** | Crypto session bootstrap negotiates sealed-session material before ingest. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | `forjd` + `backend` adapter; seal helpers `frontend` |

---

## UC-PIPE-001 — Pipeline Studio compose / export

| Field | Contract |
|-------|----------|
| **ID** | `UC-PIPE-001` |
| **Name** | Pipeline Studio (YAML compose, no persist) |
| **Actors** | Authenticated user |
| **Trigger** | `/pipeline` or Account → studio; `GET /api/v1/workflows` |
| **Happy path** | Load FORJD workflow catalog via BFF → deml-ui pipeline-flow edit → client validate → copy/download YAML → human deploys under FORJD `backend/workflows/` + `npm run validate:workflows` |
| **Errors / edges** | DEML **never** persists workflow YAML; no partner workflow write API; catalog empty if FORJD degraded |
| **Data contracts** | Workflow catalog + `pipeline_steps` cards; export YAML string (client) |
| **Observability** | Catalog fetch correlation only |
| **How it works** | Pipeline Studio composes FORJD YAML in-browser for export/validate; no partner workflow write API. Diagram: [`DIAGRAMS.md#pipeline`](DIAGRAMS.md#pipeline) |
| **Ownership** | Compose UI: `frontend` + `deml-ui`. Catalog: `forjd`. Deploy SoT: FORJD git YAML |

---

## UC-PROJ-001 — Projections, replay, DLQ

| Field | Contract |
|-------|----------|
| **ID** | `UC-PROJ-001` |
| **Name** | Projections query / run / replay / DLQ retry |
| **Actors** | Viewer read; Operator+ write + Pro where policy requires |
| **Trigger** | `/api/v1/projections*`, `/api/v1/replay*`, DLQ retry |
| **Happy path** | Tenant-bound proxy → FORJD durable projections / replay jobs |
| **Errors / edges** | `GET /api/v1/replay/{job_id}` **not** available; write mode gates; degraded typed |
| **Data contracts** | FORJD projection/DLQ schemas |
| **Observability** | Job/dlq ids |
| **How it works** | Projections / replay / DLQ are FORJD-owned; BFF proxies with tenant fail-closed. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `forjd` + `backend` |

---

## UC-EXPORT-001 — Durable exports

| Field | Contract |
|-------|----------|
| **ID** | `UC-EXPORT-001` |
| **Name** | Create / list / detail / download export |
| **Actors** | Viewer list/detail; Operator+ create + Pro |
| **Trigger** | `/api/v1/exports[/id][/download]` |
| **Happy path** | Create → `202` durable job → detail → download returns short-lived private URL (not byte proxy) |
| **Errors / edges** | Privilege on download; TTL expiry; degraded typed |
| **Data contracts** | FORJD export job schema |
| **Observability** | export_id; never log signed URL at info |
| **How it works** | Durable export jobs are requested via BFF → FORJD; status polled through proxy. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `forjd` + `backend` + UI settings/analytics as wired |

---

## UC-ML-001 — ML read / train / predict

| Field | Contract |
|-------|----------|
| **ID** | `UC-ML-001` |
| **Name** | ML latest, forecast, threat report, train, predict |
| **Actors** | Viewer read; Security Admin / Operator+ train + Pro |
| **Trigger** | `/api/v1/ml/*`, `/api/v1/predict` |
| **Happy path** | BFF maps product paths → FORJD ML/analytics → Angular TrainingResponse shapes |
| **Errors / edges** | Train/admin Pro-gated; FORJD workers (`ml-training`, rollup) are upstream — DEML has no local ML workers |
| **Data contracts** | Product DTOs for latest/forecast/threat; FORJD score/fit APIs |
| **Observability** | model_id, training_run ids |
| **How it works** | ML catalog/train/predict calls proxy FORJD; DEML never loads pickle models. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | Compute: `forjd`. Adapter/UI: `backend` + `frontend` |

---

## UC-COMPLY-001 — SOC compliance status

| Field | Contract |
|-------|----------|
| **ID** | `UC-COMPLY-001` |
| **Name** | SOC compliance status |
| **Actors** | Viewer+ |
| **Trigger** | `GET /api/v1/ml/compliance/soc-status` → FORJD `/api/v1/compliance/soc` |
| **Happy path** | Proxy → UI badge/panel |
| **Errors / edges** | Degraded typed |
| **Data contracts** | FORJD compliance DTO |
| **Observability** | Standard correlation |
| **How it works** | SOC compliance status is read through the FORJD-backed proxy surface. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `forjd` + `backend` |

---

## UC-REPORT-001 — Issue report → FORJD documents

| Field | Contract |
|-------|----------|
| **ID** | `UC-REPORT-001` |
| **Name** | Report issue (durable outbox) |
| **Actors** | Authenticated user |
| **Trigger** | `POST /api/v1/agent/report-issue` |
| **Happy path** | Redact → bound body → opaque `acct:<hmac>` pseudonym → FORJD `reports/documents`; else local `bug_reports` outbox → `reconcile_forjd_reports --watch` |
| **Errors / edges** | Never send account UUID/Firebase id; idempotent `client_report_id` |
| **Data contracts** | Report issue in/out; `bug_reports` outbox model |
| **Observability** | Delivery state machine logs |
| **How it works** | Issue reports become FORJD report documents via tenant-bound BFF proxy. Diagram: [`DIAGRAMS.md#analytics`](DIAGRAMS.md#analytics) |
| **Ownership** | `backend/agent` + reconcile worker; store `forjd` |

---

## UC-INTEG-001 — Analytics vendor integrations

| Field | Contract |
|-------|----------|
| **ID** | `UC-INTEG-001` |
| **Name** | GA / Clarity / Cloudflare credential integrations |
| **Actors** | Security Admin |
| **Trigger** | `/api/v1/system-status/integrations*` (DEML-local sealed credentials) |
| **Happy path** | OAuth/save/delete → secrets via `deml-crypto` / KMS refs → list status |
| **Errors / edges** | No plaintext secrets in API responses after save |
| **Data contracts** | Integration list/save schemas; encrypted secret refs |
| **Observability** | Integration id + provider only |
| **How it works** | Vendor analytics integrations are configured/checked on the BFF control plane. Diagram: [`DIAGRAMS.md#integrations`](DIAGRAMS.md#integrations) |
| **Ownership** | `backend/monitor/integrations.py` + `deml-crypto` |

---

## UC-INTEG-002 — Security alert webhook

| Field | Contract |
|-------|----------|
| **ID** | `UC-INTEG-002` |
| **Name** | Forward security alert to FORJD |
| **Actors** | Operator+ / integration |
| **Trigger** | `POST /api/v1/integrations/security-alert` |
| **Happy path** | Policy → FORJD integrations API |
| **Errors / edges** | Write mode / role / rate limit |
| **Data contracts** | FORJD security-alert schema |
| **Observability** | Alert id correlation |
| **How it works** | Inbound security alert webhooks are authenticated, audited metadata-only, optionally forwarded. Diagram: [`DIAGRAMS.md#integrations`](DIAGRAMS.md#integrations) |
| **Ownership** | `forjd` + `backend` |

---

## UC-WIDGET-001 — Public widget telemetry

| Field | Contract |
|-------|----------|
| **ID** | `UC-WIDGET-001` |
| **Name** | Public widget telemetry (server-sealed) |
| **Actors** | Anonymous embed / status widget |
| **Trigger** | `POST /api/v1/system-status/widget-telemetry` |
| **Happy path** | IP rate-limit → DEML seals server-side → FORJD ingest |
| **Errors / edges** | Abuse → 429; write mode off blocks |
| **Data contracts** | Widget telemetry in; sealed event out (server) |
| **Observability** | Rate-limit headers; no end-user token |
| **How it works** | Public widgets may emit sealed/minimal telemetry through constrained BFF paths. Diagram: [`DIAGRAMS.md#ingest`](DIAGRAMS.md#ingest) |
| **Ownership** | `backend/forjd/widget_telemetry.py` |

---

## UC-HEALTH-001 — Control-plane health & continuity

| Field | Contract |
|-------|----------|
| **ID** | `UC-HEALTH-001` |
| **Name** | Liveness, readiness, FORJD continuity |
| **Actors** | Load balancers, product-home, operators |
| **Trigger** | `GET /api/v1/health`, `/api/v1/ready`; proxies `/api/v1/system-status/{health,ready}`; `GET /api/v1/forjd/capabilities` |
| **Happy path** | health=liveness; ready=200 when Postgres + FORJD creds configured even if soft FORJD probe degraded (`forjd_health` + `mode`) |
| **Errors / edges** | Never optimistic OK on landing continuity probe timeout |
| **Data contracts** | `ReadyResponse` `{status, forjd_health, mode}`; capabilities contract version `1.0` |
| **Observability** | Fly/Vercel probes; structured ready payload |
| **How it works** | /health is liveness; /ready checks DB + FORJD credential presence for continuity. Diagram: [`DIAGRAMS.md#ops`](DIAGRAMS.md#ops) |
| **Ownership** | `backend/config/api.py` + `forjd` client |

---

## UC-SETTINGS-001 — Settings surface

| Field | Contract |
|-------|----------|
| **ID** | `UC-SETTINGS-001` |
| **Name** | Account settings (billing, consent, keys, sessions, integrations) |
| **Actors** | Authenticated user |
| **Trigger** | `/settings` |
| **Happy path** | Compose UC-AUTH-002/005, UC-BILL-*, UC-CONSENT-*, UC-INTEG-001; **no FORJD product UI** on this page beyond entitlement reflection |
| **Errors / edges** | Partial section failures isolated in UI |
| **Data contracts** | Union of child UCs |
| **Observability** | Per-section |
| **How it works** | Settings shell composes billing, consent, sessions, and credentials under deml-ui. Diagram: [`DIAGRAMS.md#settings`](DIAGRAMS.md#settings) |
| **Ownership** | `frontend` page shell; APIs `backend` |

---

## UC-ACCOUNT-001 — Account preferences / pipeline entry

| Field | Contract |
|-------|----------|
| **ID** | `UC-ACCOUNT-001` |
| **Name** | Account page (preferences, pipeline deep link) |
| **Actors** | Authenticated user |
| **Trigger** | `/account` |
| **Happy path** | deml-ui preferences panel; disclosure; link to UC-PIPE-001 |
| **Errors / edges** | Preferences local/browser; no server workflow persist |
| **Data contracts** | deml-ui preference types |
| **Observability** | Minimal |
| **How it works** | Account prefs stay DEML-local; pipeline entry deep-links to Pipeline Studio. Diagram: [`DIAGRAMS.md#settings`](DIAGRAMS.md#settings) |
| **Ownership** | `frontend` + `deml-ui` |

---

## UC-ONBOARD-001 — Onboarding checklist & suite activity

| Field | Contract |
|-------|----------|
| **ID** | `UC-ONBOARD-001` |
| **Name** | Onboarding checklist |
| **Actors** | Authenticated new user |
| **Trigger** | Dashboard mount; local/suite activity store |
| **Happy path** | deml-ui onboarding checklist steps; record suite activity |
| **Errors / edges** | Local storage absence → defaults |
| **Data contracts** | `OnboardingStore`, `deml-uiOnboardingStep` (deml-ui) |
| **Observability** | None required beyond client |
| **How it works** | Onboarding checklist tracks suite activity in DEML until first sealed ingest succeeds. Diagram: [`DIAGRAMS.md#settings`](DIAGRAMS.md#settings) |
| **Ownership** | `deml-ui` + `frontend` onboarding.service |

---

## UC-CORS-001 — Dynamic CORS registration

| Field | Contract |
|-------|----------|
| **ID** | `UC-CORS-001` |
| **Name** | Database-driven CORS allowlist |
| **Actors** | Browser origins, DEML BFF |
| **Trigger** | Any browser API call |
| **Happy path** | `monitor.cors_utils.is_domain_registered` against Postgres — **never** hardcoded customer domains in settings |
| **Errors / edges** | Unregistered origin rejected |
| **Data contracts** | Registered domain model |
| **Observability** | Reject counts |
| **How it works** | Customer origins must be DB-registered; static CORS allowlists are forbidden. Diagram: [`DIAGRAMS.md#ops`](DIAGRAMS.md#ops) |
| **Ownership** | `backend/monitor/cors_utils.py` |

---

## UC-LEARN-001 — Learning progress (deferred)

| Field | Contract |
|-------|----------|
| **ID** | `UC-LEARN-001` |
| **Name** | Learning / learner progress |
| **Actors** | Learner (future) |
| **Trigger** | *Not in live FORJD contract* |
| **Happy path** | DEML-owned progress remains local until agreed `deml_learning_v1` |
| **Errors / edges** | Must not place lesson/PII/scores in FORJD ingest metadata |
| **Data contracts** | **TBD** `deml_learning_v1` — reserved |
| **Observability** | N/A |
| **How it works** | Deferred — learning ingest remains rejected; see DEAD_CODE.md anti-regression tests. Diagram: [`DIAGRAMS.md#learning`](DIAGRAMS.md#learning) |
| **Ownership** | Reserved: `backend` local; community BOOK content is out of this repo's runtime |

---

## Cross-cutting configuration keys (contract)

| Key | Owning UC | Declared in |
|-----|-----------|-------------|
| `FORJD_API_URL` | FORJD-backed | `backend/.env.example`, settings, FORJD_INTEGRATION |
| `FORJD_SERVICE_TOKEN` / `FORJD_TENANT_ID` | platform bind | same |
| `FORJD_PROVISION_TOKEN` | auto provision | FORJD_INTEGRATION |
| `FORJD_WRITE_MODE` / `FORJD_READ_MODE` | all FORJD | settings default `forjd` |
| `FORJD_REQUIRED_CONTRACT_VERSION` | UC-HEALTH-001 | docs |
| `DEML_HEADLESS_*_RPM` | ingest/headless | docs |
| `DEML_LIVE_*` | UC-ANALYTICS-001 | docs |
| `ENABLE_LEGACY_PLAINTEXT_TELEMETRY` | UC-INGEST-* | must be `false` prod |
| `STRIPE_*` | UC-BILL-* | settings |
| `FIREBASE_*` | UC-AUTH-* | settings / frontend env |
| `SENTRY_DSN` / `ROLLBAR_*` | observability | settings |

---

## ID index

| ID | Name |
|----|------|
| UC-AUTH-001 | Firebase login & identity probe |
| UC-AUTH-002 | Browser session registry |
| UC-AUTH-003 | Auth handoff |
| UC-AUTH-004 | Logout |
| UC-AUTH-005 | API key lifecycle |
| UC-AUTH-006 | Account deletion saga |
| UC-BILL-001 | Pro checkout |
| UC-BILL-002 | Stripe webhook & sync |
| UC-BILL-003 | Cancel / resume |
| UC-CONSENT-001 | Cookie consent |
| UC-CONSENT-002 | Newsletter |
| UC-DASH-001 | Dashboard overview |
| UC-ANALYTICS-001 | Analytics + live SSE |
| UC-ANALYTICS-002 | Incident cases |
| UC-ANALYTICS-003 | SOAR playbooks |
| UC-SIEM-001 | SIEM signals |
| UC-VULN-001 | Vulnerabilities |
| UC-STATUS-001 | Status admin |
| UC-STATUS-002 | Public / explore status |
| UC-INGEST-001 | Sealed ingest single |
| UC-INGEST-002 | Sealed ingest batch |
| UC-INGEST-003 | Crypto sessions |
| UC-PIPE-001 | Pipeline Studio |
| UC-PROJ-001 | Projections / replay / DLQ |
| UC-EXPORT-001 | Durable exports |
| UC-ML-001 | ML read/train/predict |
| UC-COMPLY-001 | SOC compliance |
| UC-REPORT-001 | Issue report |
| UC-INTEG-001 | Analytics integrations |
| UC-INTEG-002 | Security alert |
| UC-WIDGET-001 | Widget telemetry |
| UC-HEALTH-001 | Health & continuity |
| UC-SETTINGS-001 | Settings surface |
| UC-ACCOUNT-001 | Account preferences |
| UC-ONBOARD-001 | Onboarding checklist |
| UC-CORS-001 | Dynamic CORS |
| UC-LEARN-001 | Learning (deferred) |
