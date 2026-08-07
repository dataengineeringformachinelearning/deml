/**
 * Canonical DEML use-case TypeScript contracts.
 * Narrative SoT: docs/use-cases/CANONICAL.md
 */

// --- Cross-cutting ---
export type ErrorCode =
  | 'forjd_degraded'
  | 'forjd_forbidden'
  | 'pro_required'
  | 'validation_error'
  | 'rate_limit_exceeded'
  | 'rate_limiter_unavailable'
  | 'rate_limited'
  | 'not_authenticated'
  | 'not_found'
  | 'checkout_disabled'
  | 'lifecycle_blocked'
  | 'live_updates_disabled'
  | 'forjd_reads_disabled'
  | 'forjd_writes_disabled';

export interface ErrorEnvelope {
  detail: string;
  code?: ErrorCode;
}

export type DemlRole = 'Viewer' | 'Operator' | 'Security Admin';

// --- UC-AUTH-* ---
export interface AuthUserResponse {
  status: string;
  /** Human display name only — never a Firebase UID fallback. */
  user?: string | null;
  display_name?: string | null;
  user_id?: number | null;
  role?: DemlRole | string | null;
}

/** Alias of AuthUserResponse for revoke/logout success envelopes. */
export type SuccessSchema = AuthUserResponse;

export interface DeleteAccountOut {
  status: string;
  job_id?: string | null;
  completed: boolean;
}

export interface APIKeyGenerateIn {
  name?: string;
}

export interface APIKeyGenerateOut {
  status: string;
  name: string;
  /** One-time secret; never stored client-side after display. */
  key: `deml_${string}`;
  prefix: string;
}

export interface APIKeyOut {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
}

export interface HandoffGenerateIn {
  code_challenge?: string | null;
  client_name?: string;
}

export interface HandoffGenerateOut {
  status: string;
  token: string;
}

export interface HandoffVerifyIn {
  token: string;
  code_verifier?: string | null;
}

export interface DesktopAuthOut {
  status: string;
  user: string;
  email: string;
  user_id: number;
  role: string;
  desktop_token?: string | null;
}

export interface DesktopSessionIn {
  desktop_token: string;
}

export interface SessionRegisterIn {
  session_id: string;
  user_agent?: string;
}

export interface SessionRegisterOut {
  status: string;
  session_id: string;
}

/** GET /api/v1/auth/sessions item (unix timestamps). */
export interface SessionOut {
  session_id: string;
  user_agent?: string;
  ip?: string;
  created_at?: number;
  last_seen?: number;
}

export interface LogoutIn {
  session_id?: string | null;
  revoke_all?: boolean;
}

// --- UC-INGEST-001/002 ---
export interface EncryptionOptions {
  mode: 'e2ee';
  algo: 'aes-256-gcm';
}

export interface EncryptedEnvelope {
  algo: 'aes-256-gcm';
  key_id: string;
  nonce: string;
  ciphertext: string;
  ciphertext_sha256: string;
  ratchet_header?: string | null;
}

export type SealedEventType = 'deml.metric' | 'deml.alert';

export interface SealedEvent {
  tenant_id: string;
  client_event_id: string;
  content_type: 'application/forjd-telemetry+v1';
  event_type: SealedEventType;
  schema_version: number;
  workflow_id: 'deml_telemetry';
  encryption: EncryptionOptions;
  envelope: EncryptedEnvelope;
  metadata?: Record<string, string | string[]>;
}

export interface SealedEventBatch {
  events: SealedEvent[];
}

export const MAX_INGEST_BATCH_EVENTS = 25 as const;
export const MAX_INGEST_BODY_BYTES = 8 * 1024 * 1024;
export const TELEMETRY_CONTENT_TYPE = 'application/forjd-telemetry+v1' as const;
export const TELEMETRY_WORKFLOW_ID = 'deml_telemetry' as const;
export const FORJD_TELEMETRY_WORKFLOW_ID = 'threat_telemetry' as const;

export const EVENT_TYPE_TO_FORJD = {
  'deml.metric': 'threat.metric',
  'deml.alert': 'threat.alert',
} as const;

export const WORKFLOW_ID_TO_FORJD = {
  deml_telemetry: FORJD_TELEMETRY_WORKFLOW_ID,
} as const;

/** Shared BFF error code string constants (mirror ErrorCode). */
export const ERROR_CODES = {
  FORJD_DEGRADED: 'forjd_degraded',
  FORJD_FORBIDDEN: 'forjd_forbidden',
  PRO_REQUIRED: 'pro_required',
  VALIDATION_ERROR: 'validation_error',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  RATE_LIMITER_UNAVAILABLE: 'rate_limiter_unavailable',
  RATE_LIMITED: 'rate_limited',
  NOT_AUTHENTICATED: 'not_authenticated',
  NOT_FOUND: 'not_found',
  CHECKOUT_DISABLED: 'checkout_disabled',
  LIFECYCLE_BLOCKED: 'lifecycle_blocked',
  LIVE_UPDATES_DISABLED: 'live_updates_disabled',
  FORJD_READS_DISABLED: 'forjd_reads_disabled',
  FORJD_WRITES_DISABLED: 'forjd_writes_disabled',
} as const satisfies Record<string, ErrorCode>;

// --- UC-CONSENT-001/002 ---
export interface ConsentIn {
  necessary?: boolean;
  analytical?: boolean;
  marketing?: boolean;
}

export interface ConsentRecordOut {
  status: 'success' | 'recorded';
  id: string;
}

export interface NewsletterIn {
  email: string;
  consent_accepted: boolean;
}

export interface NewsletterSubscribeOut {
  status: 'success' | 'subscribed';
  id: string;
}

// --- UC-BILL-001..003 ---
export interface CheckoutSessionOut {
  checkout_url: string;
}

export interface BillingSyncOut {
  status: 'synced';
  active: boolean;
  cancel_at_period_end?: boolean;
  message?: string | null;
}

export interface SubscriptionMutateOut {
  status: 'cancelled' | 'resumed';
  cancel_at_period_end: boolean;
}

export interface BillingErrorOut {
  detail: string;
  code: string;
}

// --- UC-HEALTH-001 ---
export interface ReadyResponse {
  status: 'ok' | 'ready' | 'degraded';
  forjd_health?: 'ok' | 'degraded' | 'unknown' | 'unconfigured' | 'unreachable';
  mode?: 'full' | 'degraded';
  forjd_read_mode?: 'off' | 'forjd' | 'dual';
  forjd_write_mode?: 'off' | 'forjd' | 'dual';
  role?: string;
  database?: string;
  forjd_api_url?: string;
  forjd_token_configured?: boolean;
  forjd_tenant_configured?: boolean;
  [key: string]: unknown;
}

/** Stable use-case identifiers — keep in sync with docs/use-cases/CANONICAL.md */
export const USE_CASE_IDS = [
  'UC-AUTH-001',
  'UC-AUTH-002',
  'UC-AUTH-003',
  'UC-AUTH-004',
  'UC-AUTH-005',
  'UC-AUTH-006',
  'UC-BILL-001',
  'UC-BILL-002',
  'UC-BILL-003',
  'UC-CONSENT-001',
  'UC-CONSENT-002',
  'UC-DASH-001',
  'UC-ANALYTICS-001',
  'UC-ANALYTICS-002',
  'UC-ANALYTICS-003',
  'UC-SIEM-001',
  'UC-VULN-001',
  'UC-STATUS-001',
  'UC-STATUS-002',
  'UC-INGEST-001',
  'UC-INGEST-002',
  'UC-INGEST-003',
  'UC-PIPE-001',
  'UC-PROJ-001',
  'UC-EXPORT-001',
  'UC-ML-001',
  'UC-COMPLY-001',
  'UC-REPORT-001',
  'UC-INTEG-001',
  'UC-INTEG-002',
  'UC-WIDGET-001',
  'UC-HEALTH-001',
  'UC-SETTINGS-001',
  'UC-ACCOUNT-001',
  'UC-ONBOARD-001',
  'UC-CORS-001',
  'UC-LEARN-001',
] as const;

export type UseCaseId = (typeof USE_CASE_IDS)[number];
