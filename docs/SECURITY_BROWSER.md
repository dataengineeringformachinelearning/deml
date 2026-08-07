# Browser security: XSS and CSRF

Partner boundary: [`FORJD_INTEGRATION.md`](./FORJD_INTEGRATION.md).

## Threat split

| Threat | Control |
|--------|---------|
| **CSRF** | Prefer non-cookie credentials on writes; Django CSRF where cookies matter |
| **XSS** | CSP + Angular escaping + nosniff / frame controls |

## CSRF

```text
Cookie/form paths → CsrfViewMiddleware + CSRF_TRUSTED_ORIGINS
SPA → Authorization: Bearer <Firebase> (+ optional X-DEML-Session-Id)
Headless → X-API-Key: deml_… or Authorization: Bearer/ApiKey deml_…
```

FORJD adapters require Firebase or `deml_` header auth — session cookies alone
do not authorize (`forjd/policy.py`). Shared gate: `backend/config/csrf_header_auth.py`.

## XSS

| Layer | Location |
|-------|----------|
| SPA (Vercel) | `vercel.json` CSP + hardening |
| Django HTML | `config.csp_middleware` |
| Defaults | `SECURE_CONTENT_TYPE_NOSNIFF`, `X_FRAME_OPTIONS` |

Prefer text binding over `innerHTML` for user-controlled strings.
`'unsafe-inline'` remains for bootstrap shells until nonce CSP.

## Operator checks

See [`PRODUCTION_CHECKLIST.md`](./PRODUCTION_CHECKLIST.md) § D.
