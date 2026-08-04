# DEML Design System — deml-ui (new-from-the-start)

**Look:** **new-from-the-start (warm ash)** — expand from this system only.  
**Canonical package:** [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)  
**Storybook:** [ui.deml.app](https://ui.deml.app)  
**App integration:** [docs/DEML_UI.md](docs/DEML_UI.md) · [.cursorrules](.cursorrules) · [AGENTS.md](AGENTS.md)

`deml-ui` is the **single source of truth** for product visuals. Viking-UI is **retired**.
Do **not** layer cold seven-color locks, Syne/Fraunces display stacks, or void-black /
electric `#2176ff` chrome on top of NFTS — that creates a frankenstein UI.

---

## Surfaces

| Surface | Stack | Theme entry |
|---------|-------|-------------|
| [deml.app](https://deml.app) | Angular 22+ (`src/`) on Vercel | `deml-ui/dist/styles/deml-ui.css` via `angular.json` |
| [ui.deml.app](https://ui.deml.app) | deml-ui Storybook on Vercel | deml-ui tokens + components |
| [backend.deml.app](https://backend.deml.app) | Django templates | `backend/static/deml-ui.css` (synced from deml-ui) |

---

## Warm ash palette (NFTS)

| Hex | Role |
|-----|------|
| `#35312D` | Dark page ground (`theme-color` dark) |
| `#1C1916` | Deep surface / plot |
| `#F3F0EA` | Cream elevated modules / card fill |
| `#D4CEC5` | Light page ground (`theme-color` light) |
| `#2F5F8F` | Primary / focus |
| `#3F6B54` | Success / positive |
| `#9E3D47` | Danger / accent |
| `#C6C0B7` | Muted text on dark ground |
| `#4A453F` | Secondary text on cream modules |

Dark default: light cream modules on warm ash ground. Light: cream cards on `#D4CEC5`.

---

## Type

**Geist only** for display, marks, intro, and body (`--font-display` / `--font-mark` /
`--font-secondary` / `--font-sans` all resolve to Geist). Do not ship Syne or Fraunces
in the product UI.

| Role | Treatment |
|------|-----------|
| Primary headings | Geist bold via `--font-display`, tight tracking (`--tracking-display`) |
| Marks / eyebrows | Geist semibold via `--font-mark`, wide tracking (`--tracking-mark`; `--tracking-eyebrow` aliases it) |
| Intro / lede | Geist regular, slight tracking (`--tracking-intro`) |
| Body | Geist regular, readable line-height (`--leading-body`) |

---

## Layout & charts

1. **8px grid** — `--grid` / `--space-*` / `--tile-gap` / `--module-pad`.
2. **Fluid equal cells** — `grid-auto-rows: minmax(var(--tile-row-unit), auto)` so tiles in a row stretch equally; never squash with fixed-only row tracks.
3. **Charts** — `--chart-aspect: 2.4` with equal `--chart-inset` inside `app-chart-card`; plot wells fill card width (capped by `--chart-stage-max-inline`) so wider cards grow taller. Never `height: 100%` / max-height squash on stages — letterbox peer tiles, not the SVG.
4. **Sharp modules** — `--radius-sm/md/lg: 0` (pill radius for chips only).
5. **Dual theme** — `data-theme="light"|"dark"` on `<html>`.
6. **WCAG 2.0 AA** — contrast, `:focus-visible`, ≥44px hit targets, reduced motion.

---

## Composition recipes (deml app)

| Intent | Components |
|--------|------------|
| Page hero | `app-banner` |
| Catalog / prose region | `app-page-section` (`variant="catalog"|"prose"|"auth"`) |
| Section title | `app-section-header` |
| Dynamic boards | `app-tile-board` → `app-dashboard-grid` + typed tiles |
| KPI | `app-stat-card` |
| Charts | `app-chart-card` + `app-area-chart` / `app-bar-chart` |
| Marketing cards | `app-card-grid` + `app-card` |
| Shell | `app-navbar`, `app-theme-toggle` |

**Angular wrappers** under `src/app/components/*`:
- `ViewEncapsulation.None`
- **no** `styleUrl` / `styleUrls` / inline `styles` for design-system chrome

---

## Theme runtime

- Boot: `src/index.html` sets `data-theme` from `localStorage['deml-theme']` or
  `prefers-color-scheme` (default dark).
- Runtime: `ThemeService` updates `data-theme`, `color-scheme`, and `theme-color`
  (`#35312D` / `#D4CEC5`).
- Toggle: `app-theme-toggle` in the navbar.

---

## Development workflow

```bash
# Design system
cd ../deml-ui
npm install
npm run storybook   # http://localhost:6006
npm run build

# Product app
cd ../deml
npm install
npx ng serve

# Django static mirror after deml-ui CSS changes
./scripts/sync_deml_ui_static.sh
```

---

## Hard Do / Don't

### Do

- Expand from warm-ash NFTS only.
- Keep Geist-only type.
- Keep fluid `minmax` dash-rows and fixed chart aspect.
- Compose product pages only from deml-ui `app-*` wrappers.

### Don't

- Mix seven-color cold palettes, Syne/Fraunces, or Viking on top of NFTS.
- Squash charts/tiles with fixed-only grid rows.
- Add app-level DS chrome CSS.
- Restore Viking-UI.

**Confirmation:** Product UI must look like **new-from-the-start** — warm ash, Geist, fluid boards — not a hybrid of later experiments.
