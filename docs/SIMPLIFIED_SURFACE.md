# Simplified product surface

Core job only: **identity + public status + site management**.

Architecture + reliability: [`MINIMAL_ARCHITECTURE.md`](./MINIMAL_ARCHITECTURE.md).

## Structure

### deml.app

```
/                 Hero — Explore / Log in (or Settings)
/explore          Status directory (title · pill · uptime · click)
/status/:slug     Status detail (services · uptime · incidents)
/login · /signup · /mfa
/settings         Account (name) + Sites
/blog · /blog/:slug   Addressable notes (not in primary nav)
```

**Primary nav**

- Guest: Explore
- Auth: Explore · Settings
- Chrome: brand, theme, log in/sign up or log out

**Footer:** Privacy · Terms · Status · © DEML

**Post-login default:** `/settings`

### Pruned (SPA)

| Removed | Why |
|---------|-----|
| Dashboard / analytics / vulns / pipeline / learn pages | Redirects only; modules deleted |
| ML / SSE / sealed telemetry clients | Not on critical path |
| Chart / tile-board chrome | Dashboard-only |
| Monitor enrichment + integrations CRUD | Racey / unused by Settings |
| Sealed heartbeat + analytics sync workers | Opt-in via env |

### Hierarchy rules

1. Hero alone may use brand preheader.
2. Other pages: H1 + one lede (+ one CTA group).
3. Body = the job. No parallel chrome sections.
4. Writing stays addressable; never competes in primary nav.
