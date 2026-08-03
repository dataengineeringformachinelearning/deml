# DEML Design System — deml-ui (new-from-the-start)

**Canonical package:** [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)  
**Storybook:** [ui.deml.app](https://ui.deml.app)  
**App integration:** [docs/DEML_UI.md](docs/DEML_UI.md) · [.cursorrules](.cursorrules) · [AGENTS.md](AGENTS.md)

Viking-UI (`packages/viking-ui`, `@dataengineeringformachinelearning/viking-ui`, `--viking-*`) is **retired**. Do not add or restore it.

---

## Surfaces

| Surface | Stack | Theme entry |
|---------|-------|-------------|
| [deml.app](https://deml.app) | Angular 22+ (`src/`) on Vercel | `deml-ui/dist/styles/deml-ui.css` via `angular.json` |
| [ui.deml.app](https://ui.deml.app) | deml-ui Storybook on Vercel | deml-ui tokens + components |
| [backend.deml.app](https://backend.deml.app) | Django templates | `backend/static/deml-ui.css` (synced from deml-ui) |

---

## Design philosophy (new-from-the-start)

The product look is the **new-from-the-start** composition carried by deml-ui’s
**atelier** tokens:

- **8px grid** — all spacing resolves to `--grid` / `--space-*`
- **Equal distribution** — dashboard tiles use `--tile-row-unit` (dash-row)
  with `minmax(..., auto)` and shared `--tile-gap`; cards and microcards share
  the same gutter language
- **Letterspaced marks** — eyebrows / meta use wide tracking (`--tracking-eyebrow`)
- **Bold display** — large headings use `--font-display` (Syne) with tight tracking
- **Readable intros** — ledes use `--font-serif` (Fraunces) with intro tracking
- **Dual theme** — `data-theme="light"` / `data-theme="dark"` on `<html>`
- **Light modules on ink ground (dark)** / limestone ground (light)
- **Charts never squash** — fixed `--chart-aspect` (2.4); area plots lock aspect;
  chart cards fill the plot band without distorting the viewBox
- **WCAG 2.0 AA** — contrast, `:focus-visible`, ≥44px hit targets (`--hit-target`),
  `prefers-reduced-motion`

Directional quality bars inform craft only. Do **not** import third-party UI kits
or copy external visual systems into deml.

---

## Token entry points

| Artifact | Path |
|----------|------|
| Tokens | `deml-ui/styles/tokens.css` → package `deml-ui/tokens.css` |
| Base + type | `deml-ui/styles/base.css` |
| Full kit | `deml-ui/dist/styles/deml-ui.css` |
| Components | `deml-ui/components/<name>/<name>.{html,css}` |

### Core token families

| Family | Examples |
|--------|----------|
| Color | `--color-bg`, `--color-surface`, `--color-card`, `--color-primary`, `--color-accent-gold`, `--color-accent-red`, `--color-text`, `--color-highlight` |
| Chart paint | `--chart-plot`, `--chart-accent`, `--chart-grid`, `--chart-aspect`, `--chart-min-block`, `--chart-max-block` |
| Space | `--grid`, `--space-1`…, `--tile-gap`, `--tile-row-unit`, `--tile-row-card`, `--module-pad` |
| Type | `--font-sans`, `--font-display`, `--font-serif`, `--tracking-eyebrow`, `--tracking-display`, `--tracking-intro` |
| Focus | `--color-focus`, `--focus-ring-width`, `--focus-ring-offset`, `--hit-target` |

Aliases such as `--bg`, `--ink`, `--surface`, `--accent` remain for component CSS
compatibility and must resolve to the families above.

---

## Composition recipes (deml app)

| Intent | Components |
|--------|------------|
| Page hero | `app-banner` |
| Catalog / prose region | `app-page-section` (`variant="catalog"|"prose"|"auth"`) |
| Section title | `app-section-header` |
| Dynamic boards | `app-tile-board` → `app-dashboard-grid` + typed tiles |
| KPI | `app-stat-card` |
| Charts | `app-chart-card` + `app-area-chart` / `app-bar-chart` / `app-metric-list` |
| Marketing cards | `app-card-grid` + `app-card` |
| Shell | `app-navbar`, `app-theme-toggle` |

Pages pass **data**; shared components own markup and deml-ui classes.
Prefer `@for` + `app-tile-board` over one-off grids.

---

## Theme runtime

- Boot: `src/index.html` sets `data-theme` from `localStorage['deml-theme']` or
  `prefers-color-scheme` (default dark).
- Runtime: `ThemeService` (`src/app/services/theme.ts`) updates `data-theme`,
  `color-scheme`, and `theme-color` meta (`#2A2622` / `#E4DDD0`).
- Toggle: `app-theme-toggle` in the navbar; account page may also toggle.

Storybook (deml-ui) uses the same `data-theme` attribute via the theme toolbar.

---

## Development workflow

```bash
# Design system
cd ../deml-ui
npm install
npm run storybook          # http://localhost:6006
npm run build              # refresh dist/ (committed for github: consumers)

# Product app
cd ../deml
npm install                # pulls deml-ui#main (or file:../deml-ui locally)
npx ng serve

# Django static mirror after deml-ui CSS changes
./scripts/sync_deml_ui_static.sh
```

---

## Laws for agents and PRs

1. **Extend deml-ui first** — new primitives, tokens, or surfaces land in deml-ui,
   then deml consumes them.
2. **No app-owned DS CSS** — do not add page-level design systems under `src/app`
   except thin auth/learn layout helpers that only use deml-ui tokens.
3. **No Viking** — no `viking-*` classes, `--viking-*` tokens, or viking package imports.
4. **Tokens only** — no arbitrary hex/rgb in product chrome.
5. **Equal spacing** — gutters and tile gaps from `--tile-gap` / page-body rules;
   do not invent one-off margins between boards.
6. **Chart golden rule** — never squash, stretch, or freely resize plots outside
   `--chart-aspect` / min-max block tokens.

---

## Historical note

Older suite docs that mention Viking-UI, `packages/viking-ui`, or void-black /
electric-teal command chrome describe a **retired** system. Treat those sections
as superseded by this file and deml-ui.
