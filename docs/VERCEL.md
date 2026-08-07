# DEML Angular on Vercel

| Project | Repo | Root | Host |
|---------|------|------|------|
| `deml` | this repo | `.` | `https://deml.app` |
| `deml-ui` | deml-ui | `.` | `https://ui.deml.app` |
| marketing | community repo | `marketing` | community apex |

```text
Browser (deml.app) → Django Fly (backend.deml.app) → FORJD (fjsvc_)
```

## Project `deml`

| Setting | Value |
|---------|-------|
| Build | `node set-env.js && npm run build:contracts && npx ng build --configuration vercel` |
| Output | `dist/deml/browser` |
| Node | 24.x |
| Dependency | `deml-ui` git SHA pin (see `package.json`) |

## Env (Production)

| Variable | Example |
|----------|---------|
| `FRONTEND_URL` | `https://deml.app` |
| `BACKEND_URL` | `https://backend.deml.app` |
| `MARKETING_URL` | `https://dataengineeringformachinelearning.com` |
| Firebase web config | from Firebase console |

Never point `BACKEND_URL` at `backend.forjd.co`. Theme: [`THEME.md`](../THEME.md). Config: [`CONFIGURATION.md`](CONFIGURATION.md).

## Redirects (`vercel.json`)

Permanent (301) to the community site:

- `/docs`, `/redoc`, `/swagger` → `…/documentation`
- `/blog`, `/blog/`, `/blog/:slug`, `/blog/rss.xml` → community blog URLs
- `/learn`, `/learn/`, `/learn/:slug` → community blog URLs

Product SEO assets in `public/`: `robots.txt`, `sitemap.xml` (no blog URLs — blog is community-owned).
