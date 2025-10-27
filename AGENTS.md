## alexbon.com (Astro rebuild)

**Stack & Tooling**
- Astro 5 running in server mode with the Cloudflare Pages adapter (`@astrojs/cloudflare`).
- React islands handle interactivity (navbar, search, theme toggle) marked with `client:*`.
- Tailwind CSS v4 + custom tokens in `src/styles/globals.css`.
- Algolia search pushes data via manual script (`scripts/push-algolia.mjs`) that reads RSS feeds (per-locale indices).
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
- Language menu & browser prompt use `navigationAlternatePaths` to deep-link to translated slugs.
- Theme preference stored in cookie + localStorage (`ALEXBON_THEME`).
- Search routes mount the Algolia-powered React app (Algolia Lite `searchForHits`); query string (`?search=`/`?q=`) seeds the initial query and locale is selected via per-language index env vars.
- Sitemap, RSS, JSON feed generated via `/sitemap.xml.ts`, `/feed.xml.ts`, `/feed.json.ts`.

**Commands**
- `npm run dev` – Astro dev server with SSR on Cloudflare shim.
- `npm run build` – Cloudflare SSR bundle + prerendered feeds/sitemap (must run before syncing Algolia).
- `npm run preview` – local preview of the SSR build.
- `npm run algolia:sync` – parse `dist/*/feed.json`, diff against `scripts/.algolia-cache.json`, and publish only changed Algolia records (requires env keys, run after build).
- `npm run algolia:sync -- --full` – force a full Algolia reindex and refresh the cache manifest.
- `npx wrangler pages deploy dist` – deploy to Cloudflare Pages Functions.

**Algolia Sync Notes**
- Incremental mode keeps a manifest at `scripts/.algolia-cache.json` (ignored by git); reruns only push changed/removed records.
- Full mode (`--full`) replaces the entire index via `replaceAllObjects` and rebuilds the manifest, matching the legacy behaviour.
