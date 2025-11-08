# alexbon.com (Astro 5)

Personal publishing space rebuilt on [Astro](https://astro.build) with Cloudflare Pages SSR, React islands, Tailwind CSS v4, and Algolia search.

## 🧭 Features

- Multi‑language routing (UA / RU / EN) with shared layouts and translated content.
- React islands for navigation, search, theme toggle, language prompts.
- Algolia-powered search fed from static feeds after each build.
- Tailwind v4 design system with custom tokens.
- Cloudflare Pages adapter for SSR deployment.

## 🚀 Quick start

```bash
npm install
npm run start
```

`npm run start` installs dependencies (if needed), clears Vite’s prebundle cache, frees port 4321, then launches the dev server on <http://localhost:4321>.

Other scripts:

| Command                  | Description                                                                 |
|--------------------------|-----------------------------------------------------------------------------|
| `npm run dev`            | Astro dev server (reads cached post summaries, no cache cleanup)            |
| `npm run build`          | Production build (runs `prebuild` → rebuilds cache)                         |
| `npm run preview`        | Preview the production build locally                                        |
| `npm run cache:build`    | Rebuild `src/lib/.cache/post-summaries.json` (auto-runs in `predev/prebuild`)|
| `npm run test`           | Vitest suite                                                                |
| `npm run algolia:sync`   | Push latest feeds to Algolia (run after build; supports `-- --full`)        |

Рекомендованный деплой-порядок: `npm run cache:build` → `git add/commit` → `npm run build` → `npm run algolia:sync` → `git push`.

## 🗂️ Project structure

```
/
├── public/                 # Static assets copied as-is
├── src/
│   ├── components/         # Astro/React components (islands live here)
│   ├── content/            # Markdown/MDX content collections
│   ├── layouts/            # Page layouts (SiteLayout, etc.)
│   ├── messages/           # Locale dictionaries (JSON)
│   ├── pages/              # Astro routes (`/`, `/ru`, `/search`, feeds, sitemap)
│   └── styles/             # Tailwind config and global styles
├── scripts/
│   ├── push-algolia.mjs    # Sync feeds with Algolia (incremental)
│   └── start-dev.sh        # Dev bootstrap (cache cleanup + server)
└── astro.config.mjs        # Astro + Cloudflare adapter config
```

Algolia feeds (`dist/*/feed-full.json`) are consumed by `scripts/push-algolia.mjs`. The script diffs records locally and supports `--full` to force a full reindex.

### Content timestamps

`updatedAt` values in MDX are now maintained manually. Keep them equal to `publishedAt` unless a post really changes — there is no longer an automated sync with git history.

## 🔑 Environment variables

Create `.env` (see `.env.example`) with the following keys:

```
PUBLIC_ALGOLIA_APP_ID=
PUBLIC_ALGOLIA_SEARCH_API_KEY=
PUBLIC_ALGOLIA_INDEX_NAME=
PUBLIC_ALGOLIA_INDEX_NAME_UA=
PUBLIC_ALGOLIA_INDEX_NAME_RU=
PUBLIC_ALGOLIA_INDEX_NAME_EN=
ALGOLIA_APP_ID=
ALGOLIA_ADMIN_API_KEY=
ALGOLIA_INDEX_NAME=
ALGOLIA_INDEX_UA=
ALGOLIA_INDEX_RU=
ALGOLIA_INDEX_EN=
ASTRO_SESSION_SECRET=
```

- `npm run dev` needs the `PUBLIC_*` variables.
- `npm run algolia:sync` requires the admin/write API key.
- `ASTRO_SESSION_SECRET` is used by the cookie-based session driver. Generate one via `openssl rand -base64 32` (or similar) and set it in Cloudflare Pages.

## 🌩 Deployment

1. `npm run build`
2. `npm run algolia:sync` (optional but recommended, requires env keys)
3. Deploy `dist/` with Cloudflare Pages Functions:
   ```bash
   npx wrangler pages deploy dist
   ```

## ✅ Recommendations

- Commit only generated feeds when deploying (Algolia sync reads them).
- Keep `.env` out of version control (already in `.gitignore`).
- Use `npm run start` when developing to avoid stale Vite caches.
- Regenerate Algolia indices after publishing new content: `npm run build` → `npm run algolia:sync`.
