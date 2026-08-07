# Simplified product surface

Core job: **identity + public status + site management**.

Architecture: [`MINIMAL_ARCHITECTURE.md`](./MINIMAL_ARCHITECTURE.md).

## deml.app

```
/                 Hero — Explore / Log in (or Settings)
/explore          Status directory
/status/:slug     Status detail
/login · /signup · /mfa
/settings         Account · Security (MFA) · Connected accounts · API keys · Sessions · Sites · Delete
/auth-bridge      Headless iframe bridge for Django chrome (not nav)
```

Thin alias: `/status` → explore. Post-login default: `/settings`.

**Nav:** Guest → Explore · Book · Whitepaper · Docs · Blog · Compliance · Auth → + Settings · Chrome: brand, theme, Log in / Log out.  
Community writing links open on `dataengineeringformachinelearning.com`.  
**Footer:** Book · Whitepaper · Docs · Blog · Compliance · Privacy · Terms · Status · © DEML.

`/blog` and `/learn` redirect permanently to the community blog.

## Marketing (community repo)

`/book` · `/whitepaper` · `/documentation` · `/blog` · `/privacy` · `/terms` · `/compliance`. Writing and blog live here — not on deml.app.

## FORJD / deml-ui

FORJD is API-only (`backend.forjd.co`). deml-ui owns warm-ash NFTS (Storybook: ui.deml.app).

## Removed from product

In-app Blog / Blue Notes · dashboard / analytics / SIEM / ML / exports / vulns / playbooks / pipeline · toast chrome · GA/Clarity/Cloudflare OAuth sync UI. Settings keeps API keys + linked providers; partners call FORJD with `fjsvc_`; retired BFF analytics-integration paths return **501**.
