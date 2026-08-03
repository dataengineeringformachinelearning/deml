# deml-ui integration

Design system SoT: [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)
(main). Visual language: **new-from-the-start (warm ash)** — expand from that
system only. See [THEME.md](../THEME.md).

## App consumption

- Dependency: `"deml-ui": "github:dataengineeringformachinelearning/deml-ui#main"`
  (local iteration may use `file:../deml-ui`).
- Global styles: `node_modules/deml-ui/dist/styles/deml-ui.css` in `angular.json`
  (Geist only via `index.html`).
- Behavioral Angular components live in `src/app/components` with
  `ViewEncapsulation.None` and **no local CSS** for DS chrome — class contracts
  come from deml-ui.
- Pages compose `app-banner` → `app-page-section` → `app-section-header` →
  `app-tile-board` / grids / cards.
- Theme: `data-theme` on `<html>`; `ThemeService` + `app-theme-toggle`
  (`theme-color` `#35312D` / `#D4CEC5`).

## Django

- Sync CSS: `./scripts/sync_deml_ui_static.sh` → `backend/static/deml-ui.css`
- Templates load `{% static 'deml-ui.css' %}` (not `viking-ui.css`).

## Retired

- `packages/viking-ui`
- `@dataengineeringformachinelearning/viking-ui`
- Product tree under `frontend/` (only a Vercel `rootDirectory` shim remains)
- `--viking-*` tokens and `viking-*` components
- Cold seven-color / Syne–Fraunces frankenstein overlays on NFTS

## Related

- [THEME.md](../THEME.md)
- [.cursorrules](../.cursorrules)
- [AGENTS.md](../AGENTS.md)
- Storybook: https://ui.deml.app
