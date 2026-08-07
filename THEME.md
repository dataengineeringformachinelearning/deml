# DEML Design System — deml-ui (new-from-the-start)

> **LOCKED.** Warm ash NFTS is the **only** allowed product look. Expand in
> **deml-ui** only. No parallel palettes, type stacks, or chart contracts.

**Package:** [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)  
**Tokens:** `styles/tokens.css` · `styles/base.css` · `components/*`  
**Storybook:** [ui.deml.app](https://ui.deml.app)  
**App:** [docs/DEML_UI.md](docs/DEML_UI.md) · [.cursorrules](.cursorrules)

## Mandate

| Rule | Requirement |
|------|-------------|
| Style | Warm ash NFTS only |
| Product tree | Angular at repo-root `src/` |
| Type | **Geist only** (display 800 / tight tracking; mark caps 0.24em; intro 0.08em) |
| Charts | Fixed `140` / `280` heights; width `100%`; shared y-scale; never theme-invert |
| Layout | 8px grid; fluid `minmax(--tile-row-unit, auto)`; solid opaque navbar |
| Theme | `data-theme="light"|"dark"` |
| A11y | WCAG 2.0 AA — focus-visible, contrast, ≥44px hits, reduced motion |

**Forbidden:** Viking-UI / `viking-*` / `--viking-*`; void-black + `#2176ff`;
Syne/Fraunces; Material/Bootstrap/Tailwind utilities; app-level DS CSS;
hand-edited `backend/static/deml-ui.css`; frosted navbar.

## Palette

| Hex | Role |
|-----|------|
| `#35312D` | Dark ground (`theme-color` dark) |
| `#1C1916` | Surface / plot |
| `#F3F0EA` | Cream modules / dark text |
| `#D4CEC5` | Light ground (`theme-color` light) |
| `#2F5F8F` | Primary (dark) · light uses `#23486D` |
| `#3F6B54` / `#2F5540` | Success dark / light |
| `#9E3D47` / `#7A3038` | Danger dark / light |
| `#C6C0B7` / `#4A453F` | Muted |
| `#9BB8D4` | Highlight on dark |

Plot wells stay dark (`#1C1916`); never invert chart series. On-fill text `#FFFFFF`.

## Charts (locked)

| Token / rule | Law |
|--------------|-----|
| `--chart-height-spark` | `140px` |
| `--chart-height-panel` | `280px` |
| Width | `100%` |
| Scale | `computeSharedDomain` — no per-chart auto-scale |
| Stage | `--chart-stage-ink` (`#121212`) on panels |
| Placement | `app-area-chart` / `app-bar-chart` inside `app-chart-card` only |

## Ownership

1. Edit deml-ui → `npm run build`
2. Bump deml’s `deml-ui` dependency
3. Sync Django: `./scripts/sync_deml_ui_static.sh`
4. Compose product pages with deml-ui `app-*` wrappers (`ViewEncapsulation.None`, no DS chrome CSS)

**Gate:** `npm run check:nfts` — no escape hatches.
