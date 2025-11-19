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
| `npm run lint`           | Run ESLint to check code quality                                            |
| `npm run lint:fix`       | Run ESLint and auto-fix issues                                              |
| `npm run format`         | Format all code with Prettier                                               |
| `npm run format:check`   | Check if code is formatted correctly                                        |
| `npm run test`           | Vitest suite                                                                |
| `npm run verify:seo`     | Validate `dist/sitemap.xml` (requires a fresh `npm run build`)              |
| `npm run verify`         | Runs audit + tests + build + `verify:seo` for complete validation           |
| `npm run algolia:sync`   | Push latest feeds to Algolia (run after build; supports `-- --full`)        |

Рекомендованный деплой-порядок: `npm run cache:build` → `git add/commit` → `npm run build` → `npm run algolia:sync` → `git push`.

## 🧪 Automated checks

- `npm run lint` checks code quality with ESLint (TypeScript + Astro rules)
- `npm run format:check` verifies consistent code formatting with Prettier
- `npm run test` exercises helpers around content cleanup, localized URL builders, and middleware normalization
- `npm run verify:seo` parses `dist/sitemap.xml` to ensure only canonical HTML routes are published (no feeds, search, or JSON endpoints) and that every locale has coverage
- `npm run verify` combines security audit, Vitest suite, production build, and sitemap check for complete validation
- **Pre-commit hooks** (Husky) automatically run lint, tests, and security audit before each commit
- **GitHub Actions CI** runs full validation suite on every push to main/master/claude branches

## 🤖 AI feeds

- `/{locale}/feed-full*.json` files are plain-text JSON Feed archives sorted by `date_modified`, limited to 500 entries per page, and chained with `next_url`.
- Crawlers should start with `feed-full.json` and keep following `next_url` until it disappears; no HTML crawling is required for AI ingestion.
- Each feed item carries the full `content_text`, canonical metadata, tags, and type info; `authors` and `license` live in the feed header to minimize per-item duplication.
- Feeds are **prerendered** during build (`export const prerender = true`) and read full post text directly from MDX files via `getPostsByLocale()`, not from cache.
- The feeds refresh weekly; rerun `npm run cache:build && npm run build` before syncing Algolia or deploying.

## ⚡ Performance optimization

The project uses an optimized prerendering + caching strategy to stay within Cloudflare's 5MB worker bundle limit:

- **Prerendering**: All content pages use `export const prerender = true`
  - Blog posts, tag pages, search page - all prerendered as static HTML at build time
  - MDX content NOT included in worker bundle, only in static HTML files
  - Worker bundle: 1.5 MB (138 posts) → ~2.2 MB (500 posts) ✅
- **Cache** (`src/lib/.cache/post-summaries.json`): Stores only essential metadata (title, description, summary, tags, URLs, dates) - no full post text
  - Current: ~235 KB for 138 posts (~1.7 KB per post)
  - Projected at 500 posts: ~870 KB cache (included in worker bundle)
  - Minimal growth due to prerendering strategy
- **Feeds** (RSS/JSON): Read full post content directly from MDX during build time using `getPostsByLocale()`, since they're prerendered
- **File count**: ~1,000 files (138 posts) → ~1,900 files (500 posts) - well under Cloudflare's 20,000 file limit

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
│   ├── verify-seo.mjs      # Ensures sitemap output has only canonical URLs
│   └── start-dev.sh        # Dev bootstrap (cache cleanup + server)
└── astro.config.mjs        # Astro + Cloudflare adapter config
```

Algolia feeds (`dist/*/feed-full*.json`) are consumed by `scripts/push-algolia.mjs`. The script diffs records locally and supports `--full` to force a full reindex, following `next_url` pointers to read every page.

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
