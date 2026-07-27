# Use-case flow diagrams

Companion to [`CANONICAL.md`](CANONICAL.md). Each UC links here under **How it works**.

---

## Auth identity {#auth-identity}

```mermaid
sequenceDiagram
  participant Browser
  participant Firebase
  participant BFF as DEML BFF
  Browser->>Firebase: signIn
  Firebase-->>Browser: ID token
  Browser->>BFF: GET /api/v1/auth/user (Bearer)
  BFF-->>Browser: AuthUserResponse
```

Used by: UC-AUTH-001, UC-AUTH-004, UC-AUTH-005.

---

## Browser sessions & handoff {#auth-sessions}

```mermaid
flowchart LR
  Login --> Register["POST /auth/sessions"]
  Register --> PG[(browser_sessions)]
  PG --> Header["X-DEML-Session-Id"]
  Desktop --> Handoff["POST /auth/handoff/*"]
  Handoff --> PG
```

Used by: UC-AUTH-002, UC-AUTH-003.

---

## Account deletion saga {#auth-delete}

```mermaid
sequenceDiagram
  participant UI
  participant BFF as DEML BFF
  participant FORJD
  UI->>BFF: DELETE /auth/delete-account
  BFF->>FORJD: POST /tenants/{id}/erase
  FORJD-->>BFF: ok / degraded
  BFF->>BFF: revoke keys · Stripe · Firebase · Django
  BFF-->>UI: DeleteAccountOut
```

Used by: UC-AUTH-006.

---

## Billing entitlement {#billing}

```mermaid
sequenceDiagram
  participant UI
  participant BFF as DEML BFF
  participant Stripe
  UI->>BFF: checkout / cancel / resume
  BFF->>Stripe: Checkout or Subscription API
  Stripe-->>BFF: webhook
  BFF->>BFF: sync Pro entitlement
```

Used by: UC-BILL-001 … UC-BILL-003.

---

## Consent & newsletter {#consent}

```mermaid
flowchart LR
  Browser --> ConsentAPI["POST consent / newsletter"]
  ConsentAPI --> PG[(Postgres)]
```

Used by: UC-CONSENT-001, UC-CONSENT-002.

---

## Dashboard & analytics (control → data plane) {#analytics}

```mermaid
sequenceDiagram
  participant UI
  participant BFF as DEML BFF
  participant FORJD
  UI->>BFF: Firebase Bearer + tenant-bound proxy
  BFF->>BFF: resolve fjsvc_ secret_ref
  BFF->>FORJD: tenant-scoped API
  FORJD-->>BFF: projections / cases / SIEM / vulns
  BFF-->>UI: JSON or SSE ticks
```

Used by: UC-DASH-001, UC-ANALYTICS-*, UC-SIEM-001, UC-VULN-001, UC-PROJ-001, UC-EXPORT-001, UC-ML-001, UC-COMPLY-001, UC-REPORT-001.

---

## Sealed ingest {#ingest}

```mermaid
sequenceDiagram
  participant Browser
  participant BFF as DEML BFF
  participant FORJD
  Browser->>Browser: seal AES-256-GCM (deml-crypto helpers)
  Browser->>BFF: sealed envelope + Firebase Bearer
  BFF->>FORJD: forward with fjsvc_
  FORJD-->>BFF: accept / receipt
  BFF-->>Browser: typed response
```

Used by: UC-INGEST-001 … UC-INGEST-003, UC-WIDGET-001.

---

## Pipeline Studio {#pipeline}

```mermaid
flowchart LR
  Studio["/pipeline UI"] --> YAML["Compose workflow YAML"]
  YAML --> Export["Validate / export"]
  Export --> Partner["Partner deploys to FORJD"]
```

Used by: UC-PIPE-001. DEML does not write partner workflows via API.

---

## Status pages {#status}

```mermaid
flowchart LR
  Admin["Authenticated admin"] --> BFF
  Public["/status /explore"] --> BFF
  BFF --> PG[(status config)]
  BFF --> FORJD["optional continuity signals"]
```

Used by: UC-STATUS-001, UC-STATUS-002.

---

## Integrations & webhooks {#integrations}

```mermaid
flowchart LR
  Vendor --> Webhook["BFF webhook / integration API"]
  Webhook --> Audit[(metadata audit)]
  Webhook --> FORJD["optional forward"]
```

Used by: UC-INTEG-001, UC-INTEG-002.

---

## Health & CORS {#ops}

```mermaid
flowchart LR
  Probe["GET /api/v1/health|/ready"] --> BFF
  BFF --> DB[(Postgres)]
  BFF --> Creds["FORJD credential presence"]
  Origin["Customer origin"] --> CORS["DB-registered CORS"]
```

Used by: UC-HEALTH-001, UC-CORS-001.

---

## Settings / account / onboarding {#settings}

```mermaid
flowchart LR
  UI["Settings / Account / Onboarding"] --> BFF
  BFF --> Local["DEML-owned prefs"]
  UI --> Pipeline["Pipeline Studio entry"]
```

Used by: UC-SETTINGS-001, UC-ACCOUNT-001, UC-ONBOARD-001.

---

## Learning (deferred) {#learning}

Learning progress remains deferred — see [`DEAD_CODE.md`](DEAD_CODE.md) and UC-LEARN-001.
Anti-regression tests must keep plaintext learning ingest rejected.
