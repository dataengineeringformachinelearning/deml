# App components

Thin Angular wrappers over **deml-ui** class contracts (`ViewEncapsulation.None`, no local DS CSS).

| Component | Purpose | Key inputs |
|-----------|---------|------------|
| `banner` | Page hero / section title | `heading`, `lede`, `data-variant` |
| `navbar` | Top nav + theme + auth | uses `nav-links` |
| `site-footer` | Categorized Resources/Legal links + Made in U.S.A. / Joe Alongi credit | `SITE_FOOTER_GROUPS` |
| `explore-card` | Status directory/detail card | `layout`, `name`, `status`, `services`, `incidents` |
| `empty-state` / `error-state` | Empty / error modules | `title`, `description`, actions slot |
| `skeleton` | Loading placeholder | `lines`, `block` |
| `callout` | Inline continuity / alert | `tone`, `heading`, `text` |
| `sheet` / `confirm-sheet` | Overlay panels | sheet: `open`/`title`; confirm via `DialogService` |
| `button` / `button-group` | Actions | deml-ui button classes |
| `text-field` / `checkbox-field` / `form-panel` | Forms | standard control inputs |
| `theme-toggle` | Light/dark | — |
| `page-section` | Page scaffolding | — |

Export barrel: `index.ts`. Visual SoT: deml-ui / [THEME.md](../../../THEME.md).
