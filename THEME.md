# DEML Design System — deml-ui (LOCKED)

**Status:** Locked for all future work.  
**Look:** **new-from-the-start (NFTS) / heritage** — seven-color palette only  
**Canonical package:** [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui)  
**Storybook:** [ui.deml.app](https://ui.deml.app)  
**App integration:** [docs/DEML_UI.md](docs/DEML_UI.md) · [.cursorrules](.cursorrules) · [AGENTS.md](AGENTS.md)

`deml-ui` is the **single source of truth** for product visuals. Viking-UI
(`packages/viking-ui`, `@dataengineeringformachinelearning/viking-ui`,
`viking-*`, `--viking-*`, void-black / electric `#2176ff`) is **fully retired**.
Do **not** restore atelier-cream / limestone hexes (`#2A2622`, `#E4DDD0`,
`#F4F1EA`) or any parallel kit.

---

## Surfaces

| Surface | Stack | Theme entry |
|---------|-------|-------------|
| [deml.app](https://deml.app) | Angular 22+ (`src/`) on Vercel | `deml-ui/dist/styles/deml-ui.css` via `angular.json` |
| [ui.deml.app](https://ui.deml.app) | deml-ui Storybook on Vercel | deml-ui tokens + components |
| [backend.deml.app](https://backend.deml.app) | Django templates | `backend/static/deml-ui.css` (synced from deml-ui) |

Every surface must share the same locked rules: **7-color palette only**, equal
outer spacing (8px multiples), identical tile/card/bento heights, fixed
`--chart-aspect`, WCAG 2.0 AA, and dual `data-theme`.

---

## Locked palette (exact — seven colors only)

| Hex | Role |
|-----|------|
| `#0066B2` | Primary / focus / chart accent |
| `#3D3D3D` | Charcoal surface / secondary text (light) |
| `#BDBDBD` | Muted / border / secondary text (dark) |
| `#121212` | Ink / dark ground / card text on light modules |
| `#FFFFFF` | White / light ground / on-primary |
| `#3C7A4A` | Success / positive accent (`--color-accent-gold`) |
| `#C41E3A` | Danger / accent red |

Dark/light **role swaps** only — no new hexes. Hovers and translucent chrome may
`color-mix` **only** among these seven. Chart series colors come from this
palette only. `theme-color` meta: dark `#121212`, light `#FFFFFF`.

---

## Locked design rules (mandatory)

These rules are non-negotiable for agents, PRs, and product UI:

1. **Seven colors only** — product chrome uses deml-ui tokens that resolve to the
   palette above (`--color-*`, `--palette-*`). No arbitrary hex/rgb in app or
   component chrome outside deml-ui `tokens.css`.
2. **8px equal outer spacing** — all layout lengths resolve to `--grid` /
   `--space-*` (8px multiples). Outer gutters identical on all four sides
   (`.page-body` / `--module-pad` / `--tile-gap`). Do not invent asymmetric
   one-off margins.
3. **Identical card / bento heights** — dashboard tiles / bento rows use
   `--tile-row-unit` (dash-row) with shared `--tile-gap`; cards and microcards
   fill equal grid tracks. No free-height drift between siblings in a row.
4. **Fixed charts** — `--chart-aspect` is **2.4**. Area/bar plots live inside
   equal-height `app-chart-card` shells and size via aspect tokens only; never
   squash, stretch, or override plot height outside
   `--chart-aspect` / `--chart-min-block` / `--chart-max-block`.
5. **Typography hierarchy** —
   - Primary headings: `--font-display` (Syne), bold/800, **tight** tracking
     (`--tracking-display` / `--tracking-tight`)
   - Secondary / eyebrows / marks: same sans family, **generous** letter-spacing
     (`--tracking-eyebrow` / `--tracking-mark`)
   - Intro / lede: readable with **generous** tracking (`--tracking-intro`;
     `--font-serif` / Fraunces)
   - Body: highly readable `--font-sans` (Geist)
6. **Dual theme** — `data-theme="light"` | `data-theme="dark"` on `<html>`.
   Dark: light modules on ink ground. Light: white ground, charcoal ink.
7. **WCAG 2.0 AA** — contrast, `:focus-visible`, ≥44px hit targets (`--hit-target`),
   `prefers-reduced-motion`.
8. **Compose deml-ui only** — pages use `app-*` wrappers that mirror deml-ui
   class contracts. **Zero app-level design-system CSS** for product chrome
   (`styleUrl` / `styleUrls` / inline `styles` forbidden on DS wrappers).
9. **Extend deml-ui first** — new primitives, tokens, or surfaces land in deml-ui,
   then deml consumes them (bump dependency / sync Django static).
10. **No Viking / cream / parallel kits** — no Viking-UI, atelier-cream leftovers,
    Material, Bootstrap, Tailwind utilities, or a second local design system.

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
| Palette | `--palette-blue`, `--palette-charcoal`, `--palette-gray`, `--palette-ink`, `--palette-white`, `--palette-green`, `--palette-red` |
| Color | `--color-bg`, `--color-surface`, `--color-card`, `--color-primary`, `--color-accent-gold`, `--color-accent-red`, `--color-text` |
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

**Angular wrappers** under `src/app/components/*`:
- `ViewEncapsulation.None`
- **no** `styleUrl` / `styleUrls` / inline `styles` for design-system chrome
- Thin auth/learn layout helpers may use deml-ui tokens only (not a parallel DS)

---

## Theme runtime

- Boot: `src/index.html` sets `data-theme` from `localStorage['deml-theme']` or
  `prefers-color-scheme` (default dark).
- Runtime: `ThemeService` (`src/app/services/theme.ts`) updates `data-theme`,
  `color-scheme`, and `theme-color` meta (`#121212` / `#FFFFFF`).
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

## Hard Do / Don't (anti-drift)

### Do

- Use only the seven locked hexes (via tokens).
- Keep equal outer spacing on all four sides (`--space-*` / `--tile-gap` /
  `--module-pad`).
- Keep identical card/bento/grid row heights (`--tile-row-unit` + stretch).
- Host charts in aspect-locked containers inside equal-height chart-cards.
- Preserve type hierarchy (display condensed tight / intro generous / readable body).
- Compose product pages only from deml-ui `app-*` wrappers.

### Don't

- Add hexes outside the seven-color set (including cream `#E4DDD0` / `#F4F1EA`,
  void `#2A2622`, electric `#2176ff`).
- Squash or stretch charts; override `--chart-aspect` with free heights.
- Add app-level DS chrome CSS (`styleUrl` on product wrappers/pages).
- Restore Viking-UI (`viking-*`, `--viking-*`, `packages/viking-ui`).
- Invent one-off spacing, asymmetric module padding, or parallel tokens.

---

## Laws for agents and PRs

1. **Extend deml-ui first** — new primitives, tokens, or surfaces land in deml-ui,
   then deml consumes them.
2. **No app-owned DS CSS** — do not add page-level design systems under `src/app`
   except thin auth/learn layout helpers that only use deml-ui tokens.
3. **No Viking / cream** — no `viking-*`, `--viking-*`, void-black / `#2176ff`,
   or atelier-cream hexes.
4. **Seven colors only** — no arbitrary hex/rgb in product chrome.
5. **Equal spacing** — gutters and tile gaps from `--tile-gap` / page-body rules.
6. **Identical tile heights** — use `--tile-row-unit` / dash-row rhythm.
7. **Chart golden rule** — never squash, stretch, or freely resize plots outside
   `--chart-aspect` / min-max block tokens.
8. **WCAG 2.0 AA** — preserve focus, contrast, hit targets, reduced motion.

---

## Historical note

Older suite docs that mention Viking-UI, `packages/viking-ui`, void-black /
electric `#2176ff`, or atelier-cream / limestone grounds describe a **retired**
system. Treat those sections as superseded by this file and deml-ui `tokens.css`.

**Confirmation:** The new-from-the-start / heritage seven-color deml-ui style is
locked for all future deml product work. Agents must not drift back to Viking or
cream atelier looks.
