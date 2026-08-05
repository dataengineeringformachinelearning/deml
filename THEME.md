# DEML Design System — deml-ui (new-from-the-start)

> **LOCKED LAW — MANDATORY EVERYWHERE.**  
> The **new-from-the-start (warm ash)** look is the **only** allowed visual style for
> every DEML product surface. **Any deviation is forbidden.** Do not invent parallel
> palettes, type stacks, chart contracts, or app-local chrome. Expand from this
> system inside **deml-ui** only.

**Look:** **new-from-the-start (warm ash)** — expand from this system only.  
**Canonical package:** [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)  
**Token SoT:** `deml-ui/styles/tokens.css` · `deml-ui/styles/base.css` · `deml-ui/components/*`  
**Storybook:** [ui.deml.app](https://ui.deml.app)  
**App integration:** [docs/DEML_UI.md](docs/DEML_UI.md) · [.cursorrules](.cursorrules) · [AGENTS.md](AGENTS.md)

`deml-ui` is the **single source of truth** for product visuals. Viking-UI is **retired**.
Do **not** layer cold seven-color locks, Syne/Fraunces display stacks, or void-black /
electric `#2176ff` chrome on top of NFTS — that creates a frankenstein UI and is **forbidden**.

---

## Mandate (non-negotiable)

| Rule | Requirement |
|------|-------------|
| Style | **new-from-the-start (warm ash)** only |
| Ownership | All visual values originate in **deml-ui** |
| Product tree | Angular at repo-root `src/` (not `frontend/`) |
| Type | **Geist only** — no Syne, Fraunces, Inter product stacks |
| Charts | Fixed `140` / `280` heights; width `100%`; shared y-scale; never theme-invert |
| Layout | 8px grid; fluid `minmax(--tile-row-unit, auto)` peer rows |
| Theme | Dual `data-theme="light"\|"dark"` via deml-ui tokens |
| A11y | WCAG 2.0 AA — focus-visible, contrast, ≥44px hit targets, reduced motion |

**Forbidden:** Viking-UI / `packages/viking-ui` / `viking-*` / `--viking-*`; void-black + `#2176ff`;
cold seven-color frankenstein palettes; Syne/Fraunces; Material / Bootstrap / Tailwind utility
styling; app-level DS chrome CSS; hand-edited `backend/static/deml-ui.css`; fixed-only
`grid-auto-rows` that squash tiles/charts; see-through navbar shells; overflow that breaks
page scaffolding.

---

## Surfaces

| Surface | Stack | Theme entry |
|---------|-------|-------------|
| [deml.app](https://deml.app) | Angular 22+ (`src/`) on Vercel | `deml-ui/dist/styles/deml-ui.css` via `angular.json` |
| [ui.deml.app](https://ui.deml.app) | deml-ui Storybook on Vercel | deml-ui tokens + components |
| [backend.deml.app](https://backend.deml.app) | Django templates | `backend/static/deml-ui.css` (synced from deml-ui) |

---

## Warm ash palette (NFTS)

Canonical hex values (case-insensitive in CSS; prefer lowercase in tokens):

| Hex | Role |
|-----|------|
| `#35312D` | Dark page ground (`theme-color` dark) · `--color-bg` |
| `#1C1916` | Deep surface / plot · `--color-surface` / `--color-plot` |
| `#F3F0EA` | Cream elevated modules / card fill · `--color-card` / dark `--color-text` |
| `#D4CEC5` | Light page ground (`theme-color` light) · light `--color-bg` |
| `#2F5F8F` | Primary / focus · `--color-primary` |
| `#3F6B54` | Success / positive · `--color-accent-gold` / `--color-success` |
| `#9E3D47` | Danger / accent · `--color-accent-red` / `--color-error` |
| `#C6C0B7` | Muted text on dark ground · `--color-text-secondary` |
| `#4A453F` | Secondary text on cream modules · `--color-card-text-secondary` |
| `#9BB8D4` | Highlight on dark ground · `--color-highlight` |

**Dark default:** cream modules (`#F3F0EA`) on warm ash ground (`#35312D`), deep surface `#1C1916`.  
**Light:** cream cards on `#D4CEC5` ground; ink `#1C1916`.  
**Plot wells:** always dark plot (`#1C1916`) with light ink — **never theme-invert chart series**.

On-primary / on-accent text: `#FFFFFF`.

---

## Typography

**Geist only** for display, marks, intro, and body.  
`--font-display` / `--font-mark` / `--font-secondary` / `--font-body` / `--font-sans` all resolve to Geist.

| Role | Treatment |
|------|-----------|
| Primary headings | Geist bold (`--font-weight-display: 700`), tight tracking (`--tracking-display` / `--tracking-tight`) |
| Marks / eyebrows | Geist semibold (`--font-weight-mark: 600`), wide tracking (`--tracking-mark` / `--tracking-eyebrow: 0.22em`), uppercase |
| Intro / lede | Geist regular, `--tracking-intro: 0.06em`, `--leading-body: 1.5` |
| Body | Geist regular, readable line-height (`--leading-body`) |

**Forbidden type:** Syne, Fraunces, Inter-as-product-UI, decorative display mixes.

Scale (8px-linked): `--font-size-xs` … `--font-size-2xl` via deml-ui tokens. Do not invent off-scale sizes.

---

## Spacing & layout

1. **8px grid** — `--grid: 8px`; use `--space-*` only.
2. **Tile rhythm** — `--tile-gap`, `--tile-row-unit`, `--module-pad` / `--module-pad-lg`.
3. **Fluid equal cells** — `grid-auto-rows: minmax(var(--tile-row-unit), auto)` so tiles in a row stretch equally; **never** squash with fixed-only row tracks.
4. **Sharp modules** — `--radius-sm/md/lg: 0` (pill radius for chips/controls only).
5. **Content widths** — `--content-width*` / `--reading-width`; page body uses deml-ui `.page` / `.page-body` recipes.
6. **No overflow** — page chrome must not introduce horizontal page scroll; clip/contain within scaffolding (`overflow-x: clip` on body per deml-ui base). Dynamic boards grow with content; do not force fixed heights that clip charts or CTAs.
7. **Navbar** — solid opaque shell (`--navbar-bg` / `--navbar-surface`); equal inset (`--navbar-inset`); never frosted/see-through over content.
8. **Hit targets** — `--hit-target` ≥ 44px (`--space-6`).

---

## Charts (locked contract)

> **CHART RULES LOCKED:** height fixed, width 100%, shared global scale — **DO NOT CHANGE**
> unless the user explicitly asks. Regenerating a chart component must keep the same
> size constants (`140` / `280`) and `computeSharedDomain`.

| Token / rule | Value / law |
|--------------|-------------|
| `--chart-height-spark` | `140px` — stat / spark stages only |
| `--chart-height-panel` | `280px` — full-width / chart-card / chart-panel stages |
| Width | Always `100%` of parent; resize only in width |
| Shared y-scale | `computeSharedDomain` over **all** line series on the board; no per-chart auto-scale |
| Stage ink | `--chart-stage-ink` (`#121212`) on panel activity graphs; sparks stay transparent |
| Inset | Equal `--chart-inset` from plot-well edges to SVG/stage |
| Component | One shared `app-area-chart` (SVG activity graph) for spark + panel |
| Placement | `app-area-chart` / `app-bar-chart` **inside** `app-chart-card` only |
| Series | `--chart-series-*` from warm-ash tokens; do not invent hex |
| Forbidden | Aspect-driven taller-when-wider for line charts; data-driven height; independent y-domains; theme-inverting plot ink |

Peer tiles letterbox; **never** change the chart stage height.

---

## Light / dark behavior

- Attribute: `data-theme="light"|"dark"` on `<html>` (aliases `.light` / `.dark` in deml-ui).
- Boot: `src/index.html` sets theme from `localStorage['deml-theme']` or `prefers-color-scheme` (default dark).
- Runtime: `ThemeService` updates `data-theme`, `color-scheme`, and `theme-color` (`#35312D` / `#D4CEC5`).
- Toggle: `app-theme-toggle` in the navbar.
- Semantic colors flip via deml-ui token blocks only — components must not hardcode mode-specific hex.

---

## Composition recipes (deml app)

| Intent | Components |
|--------|------------|
| Page hero | `app-banner` (`variant="hero"` on home; default elsewhere) |
| Site footer | `app-site-footer` |
| Catalog / prose region | `app-page-section` (`variant="catalog"|"prose"|"auth"`) |
| Section title | `app-section-header` |
| Dynamic boards | `app-tile-board` → `app-dashboard-grid` + typed tiles |
| KPI | `app-stat-card` |
| Charts | `app-chart-card` + `app-area-chart` / `app-bar-chart` |
| Marketing cards | `app-card-grid` + `app-card` |
| Shell | `app-navbar`, `app-theme-toggle` |

**Scaffolding order:** shell → banner → page-section → section-header → tile-board / grids → cards/charts.

**Angular wrappers** under `src/app/components/*`:
- `ViewEncapsulation.None`
- **no** `styleUrl` / `styleUrls` / inline `styles` for design-system chrome
- Class contracts and CSS variables come from deml-ui only

**Dynamic components:** prefer deml-ui primitives + typed tile boards; do not grow one-off page CSS for modularity.

---

## Ownership law

1. Edit visuals in **deml-ui** `components/<name>/`, `styles/tokens.css`, `styles/base.css`.
2. `npm run build` in deml-ui (committed `dist/` for `github:` installs).
3. Bump deml’s `deml-ui` dependency / lockfile.
4. Sync Django static with `./scripts/sync_deml_ui_static.sh` — never hand-edit the mirror.
5. Product pages only compose `app-*` wrappers and bind content/data.

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

- Treat NFTS warm ash as **mandatory** on every route and surface.
- Expand from warm-ash NFTS only inside deml-ui.
- Keep Geist-only type.
- Keep fluid `minmax` dash-rows and fixed chart aspect.
- Compose product pages only from deml-ui `app-*` wrappers.

### Don't

- Deviate from NFTS for “experiments,” “atelier,” cold seven-color locks, or Viking revival — **forbidden**.
- Mix Syne/Fraunces or Viking chrome on top of NFTS.
- Squash charts/tiles with fixed-only grid rows.
- Add app-level DS chrome CSS.
- Restore Viking-UI or put product UI under `frontend/`.

**Confirmation:** Product UI must look like **new-from-the-start** — warm ash, Geist, fluid boards, locked charts — and nothing else.

---

## Automated enforcement

| Gate | Command | Wired |
|------|---------|-------|
| deml consumer | `npm run check:nfts` → `scripts/check_nfts_style.mjs` | CI quality + frontend · pre-commit |
| deml-ui library | In deml-ui: `npm run check:nfts` | deml-ui CI |

There are **no escape hatches**. Drift from NFTS fails the gate.
