# Contributing to DEML

Thank you for helping build DEML. Product UI uses **deml-ui** (new-from-the-start /
atelier). The retired Viking-UI package is not accepted in PRs.

**Design system docs:** [ui.deml.app](https://ui.deml.app) · [THEME.md](THEME.md) · [docs/DEML_UI.md](docs/DEML_UI.md)

### Platform / FORJD contributors

DEML is the Firebase control plane; FORJD owns sealed streams. Product UI changes
stay in this repo (and deml-ui for shared chrome). Integration contract:
[`docs/FORJD_INTEGRATION.md`](docs/FORJD_INTEGRATION.md). Architectural narrative:
[`BOOK.md`](BOOK.md). After BOOK/WHITEPAPER/AGENTS edits, run
`python scripts/sync_content.py`.

---

## Where to contribute

| Area | Path | When to edit |
|------|------|--------------|
| **Angular product** | `src/` | Routes, services, behavioral `app-*` wrappers |
| **Design system** | [`deml-ui`](https://github.com/dataengineeringformachinelearning/deml-ui) | Tokens, components, Storybook |
| **Django BFF** | `backend/` | APIs, auth, templates (use synced `deml-ui.css`) |
| **Contracts** | `packages/deml-contracts` | Shared schemas |
| **Governance** | `THEME.md`, `AGENTS.md`, `.cursorrules` | Visual / agent policy |

New shared UI **always** belongs in **deml-ui** first. Application code consumes
public entrypoints (`deml-ui`, `deml-ui/styles.css`, `deml-ui/angular`).

---

## Development setup

### Prerequisites

- **Node.js** ≥ 22
- **npm**
- **Python 3.12+** with [uv](https://docs.astral.sh/uv/) for pre-commit hooks

### Clone and run locally

```bash
git clone https://github.com/dataengineeringformachinelearning/deml.git
git clone https://github.com/dataengineeringformachinelearning/deml-ui.git

cd deml-ui && npm install && npm run build && npm run storybook   # :6006
cd ../deml && npm install && npx ng serve                         # product
```

Production installs resolve `deml-ui` from the npm registry (`^1.1.0`+). For local
DS work, you may temporarily use `"deml-ui": "file:../deml-ui"`, then restore the
npm pin before merge.

---

## Contribution workflow

1. **Fork** and branch: `cursor/your-feature` or `feature/your-feature`.
2. **Read** [THEME.md](THEME.md), [.cursorrules](.cursorrules), and [AGENTS.md](AGENTS.md).
3. **Implement** design changes in deml-ui; product behavior in `src/`.
4. **Run quality gates** (below).
5. **Open a pull request** with description and UI screenshots when visual.

---

## Quality gates

```bash
# deml
npm test
npx ng build --configuration development

# deml-ui
npm run build
npm run storybook   # a11y panel

# repo hooks
uvx pre-commit run --all-files
```

Do not add Viking-UI dependencies, `viking-*` components, or `--viking-*` tokens.

---

## Design rules (short)

- 8px grid; equal tile gaps via `--tile-gap` / dashboard row units
- `data-theme` light/dark
- Charts keep fixed `--chart-height-spark: 140px` / `--chart-height-panel: 280px` and shared y-scale — never data-size or auto-scale independently
- WCAG 2.0 AA / Section 508
- Compose with shared `app-*` components and dynamic tile data

See [THEME.md](THEME.md) for the full contract.
