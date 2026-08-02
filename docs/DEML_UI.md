# deml-ui integration

- Design system SoT: sibling repo `deml-ui` (`style/new-from-the-start` branch during migration).
- App consumes `deml-ui` via `file:../deml-ui` (local) and `deml-ui/dist/styles/deml-ui.css` in `angular.json`.
- Behavioral Angular components live in `src/app/components` with `ViewEncapsulation.None` and **no local CSS** — styles come from deml-ui.
- `packages/viking-ui` and `frontend/` are retired on this branch.
