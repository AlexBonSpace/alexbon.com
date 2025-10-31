## alexbon.com (Astro rebuild)

**Stack & Tooling**
- Astro 5 running in server mode with the Cloudflare Pages adapter (`@astrojs/cloudflare`).
- React islands handle interactivity (navbar, search page, theme toggle) marked with `client:*`.
- Tailwind CSS v4 + custom tokens in `src/styles/globals.css`.
- Algolia is optional: used only for interactive search; indexing happens via `scripts/push-algolia.mjs` that reads locale feeds from `dist/*/feed.json`.
- Content sources:
  - Markdown/MDX pulled via Astro Content collections (`src/content`).
  - Translation-aware helpers in `src/lib/pages.ts` and `src/lib/blog.ts`.

**Project Layout**
- `src/pages` – Astro routes mirroring `/`, `/about`, `/blog`, `/search`, feeds, sitemap.
- `src/components` – shared React/Astro components; `NavigationShell` hosts navbar + language prompt.
- `src/lib` – data loaders, SEO helpers, search mappers.
- `src/contexts` – lightweight React providers for theme & i18n (used by islands).
- `src/messages` – JSON translation dictionaries.
- `src/styles` – global Tailwind setup and design tokens.

**Key Behaviors**
- “Only [locale]” routing: each locale lives under its own prefix (`/ua/…`, `/ru/…`, `/en/…`). The bare root `/` 308-redirects to `/ua/`, and locale roots redirect to the local blog index.
- Blog listings and pagination render server-side from local content (no Algolia dependency). `PostGrid` consumes `paginatePosts` results.
- Language menu & browser prompt use `navigationAlternatePaths` to deep-link translated slugs.
- Theme preference stored in cookie + localStorage (`ALEXBON_THEME`).
- `/[locale]/search/` renders SSR fallback with recent posts, `robots="noindex, follow"`, and loads the Algolia-powered React app lazily (no request until the user types).
- Sitemap, RSS, JSON feeds generated via `/sitemap.xml.ts`, `/feed.xml.ts`, `/feed.json.ts`.

**Commands**
- `npm run dev` – Astro dev server with SSR on Cloudflare shim.
- `npm run build` – Cloudflare SSR bundle + prerendered feeds/sitemap (run before syncing Algolia or deploying).
- `npm run preview` – local preview of the SSR build.
- `npm run algolia:sync` – optional; parses `dist/*/feed.json`, diffs against `scripts/.algolia-cache.json`, and pushes only changed Algolia records (requires env keys).
- `npm run algolia:sync -- --full` – optional; force a full Algolia reindex and refresh the cache manifest.
- `npx wrangler pages deploy dist` – deploy to Cloudflare Pages Functions.

**Algolia Sync Notes**
- Incremental mode keeps a manifest at `scripts/.algolia-cache.json` (ignored by git); reruns only push changed/removed records.
- Full mode (`--full`) replaces the entire index via `replaceAllObjects` and rebuilds the manifest, matching the legacy behaviour.
