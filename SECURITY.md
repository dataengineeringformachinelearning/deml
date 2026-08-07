# Security policy

## Reporting

Report suspected vulnerabilities privately to the maintainers. Do not open
public issues with exploit PoCs, credentials, or sealed plaintext.

## Control-plane / data-plane boundary

| Surface | Rule |
|---------|------|
| Firebase / `deml_` tokens | Terminate at Django — never forward to FORJD |
| FORJD calls | Tenant-bound `fjsvc_` only; secret refs in DB; never in browser |
| Ciphertext | Sealed envelopes only on the wire to FORJD |
| Retired BFF facades | Return **501** — partners call FORJD directly |

Contract: [`docs/FORJD_INTEGRATION.md`](docs/FORJD_INTEGRATION.md).  
Browser XSS/CSRF: [`docs/SECURITY_BROWSER.md`](docs/SECURITY_BROWSER.md).

## Automated gates

- NFTS: `npm run check:nfts`
- Pre-commit + CI Semgrep / Trivy / gitleaks
- Use-case coverage: `npm run validate:usecase-coverage`
