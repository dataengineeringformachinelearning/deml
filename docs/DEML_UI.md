# deml-ui integration

Design system SoT: [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)
(main). Visual language: **new-from-the-start (NFTS) / heritage** — seven-color
palette only (`#0066B2` `#3D3D3D` `#BDBDBD` `#121212` `#FFFFFF` `#3C7A4A`
`#C41E3A`). See [THEME.md](../THEME.md).

## App consumption

- Dependency: `"deml-ui": "github:dataengineeringformachinelearning/deml-ui#main"`
  (local iteration may use `file:../deml-ui`).
- Global styles: `node_modules/deml-ui/dist/styles/deml-ui.css` in `angular.json`
  (plus Geist / Syne / Fraunces via `index.html` or fontsource).
- Behavioral Angular components live in `src/app/components` with
  `ViewEncapsulation.None` and **no local CSS** for DS chrome — class contracts
  come from deml-ui.
- Pages compose `app-banner` → `app-page-section` → `app-section-header` →
  `app-tile-board` / grids / cards.
- Theme: `data-theme` on `<html>`; `ThemeService` + `app-theme-toggle`.

## Django

- Sync CSS: `./scripts/sync_deml_ui_static.sh` → `backend/static/deml-ui.css`
- Templates load `{% static 'deml-ui.css' %}` (not `viking-ui.css`).

## Retired

- `packages/viking-ui`
- `@dataengineeringformachinelearning/viking-ui`
- Product tree under `frontend/` (only a Vercel `rootDirectory` shim remains)
- `--viking-*` tokens and `viking-*` components

## Related

- [THEME.md](../THEME.md)
- [.cursorrules](../.cursorrules)
- [AGENTS.md](../AGENTS.md)
- Storybook: https://ui.deml.app
