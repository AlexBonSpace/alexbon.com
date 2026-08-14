# Claude Code Context - alexbon.com

## Project Overview
Personal blog built with Astro 7 in server mode, deployed to Cloudflare **Workers** (static
assets + SSR). Multilingual content (UA/RU/EN) with creative writing (articles, notes,
stories) managed through MDX files.

> **Migration note (Astro 5 -> 7 / Pages -> Workers):** `@astrojs/cloudflare` v13+ dropped
> Cloudflare Pages support, so the site now deploys as a Worker. Build output is split into
> `dist/client` (static assets) and `dist/server` (Worker). The adapter generates
> `dist/server/wrangler.json` at build time; `wrangler deploy` uses that. Key consequence:
> **`src/middleware.ts` does NOT run for static-asset requests** (prerendered pages), so
> edge redirects and security headers live in generated `_redirects` / `_headers` files -
> see `scripts/build-edge-config.mjs`.

## Technology Stack
- **Framework**: Astro 7 with server-side rendering
- **Deployment**: Cloudflare Workers adapter (`@astrojs/cloudflare` v14), static assets + SSR
- **Styling**: Tailwind CSS v4 with custom design tokens in `src/styles/globals.css`
- **Interactivity**: React islands (navbar, search page, theme toggle, reading progress) marked with `client:*` directives
- **Content**: MDX via Astro Content Collections with translation helpers in `src/i18n/` and blog utilities in `src/lib/blog.ts`
- **Search**: Optional Algolia integration; indexing via `scripts/push-algolia.mjs` reading locale feeds from `dist/client/*/feed-full*.json`. Three indexes: `TOMA` (ua), `posts_ru`, `posts_en`
- **Testing**: Vitest with happy-dom (93 tests covering locale utils, blog utils, feed utils, SEO)
- **Code Quality**: ESLint + Prettier with automatic formatting
- **Git Hooks**: Husky pre-commit hooks (format, test, security audit)
- **CI/CD**: GitHub Actions for automated checks on push

### React Components (9 active files)
**Interactive UI (on every page):**
- `NavigationShell.tsx` - Main navigation wrapper with theme/locale contexts
- `Navbar.tsx` - Navigation menu with mobile support
- `ThemeToggle.tsx` - Theme switcher (default/dark/sky/sand)
- `LanguagePrompt.tsx` - Language selector prompt for default locale
- `ReadingProgress.tsx` - Reading progress bar (client-side only)

**Search functionality:**
- `SearchApp.tsx` - Algolia-powered search interface

**Contexts & utilities:**
- `theme-context.tsx` - Theme state management
- `i18n-context.tsx` - Internationalization context
- `navigation.tsx` - Navigation helpers

## Project Structure
```
src/
├── components/           # React/Astro components
│   ├── blog/            # Blog-specific components
│   ├── search/          # Search functionality
│   ├── system/          # System pages (404, etc.)
│   └── NavigationShell.tsx  # Hosts navbar + language prompt
├── content/             # MDX content collections
│   └── posts/           # Organized by locale then type
│       ├── en/          # English content
│       ├── ru/          # Russian content
│       └── ua/          # Ukrainian content (default)
├── lib/                 # Core utilities
│   ├── .cache/         # Generated build cache (never edit manually)
│   ├── post-summaries.ts # Reads the build-time metadata cache
│   ├── blog.ts         # Blog data helpers
│   └── http.ts         # Shared 404 handling
├── config/             # Shared JSON: security-headers.json, legacy-redirects.json
├── pages/              # File-based routing (/, /[locale]/*, feeds, sitemap; locale-less /about /blog /search are edge redirects, not pages)
├── contexts/           # React contexts (theme, i18n)
├── messages/           # Translation dictionaries (JSON)
└── styles/             # Global CSS and Tailwind tokens
```

## Key Features & Behaviors

### Routing & Redirects
- **Locale-first routing**: All content under locale prefixes (`/ua/`, `/ru/`, `/en/`)
- **Root `/` uses SSR** for instant locale detection and 308 redirect
  - Priority: `ALEXBON_LOCALE` cookie → `Accept-Language` header → `ua` fallback
  - Server-side redirect (no white screen, zero visual delay)
  - Minimal Worker invocations due to low traffic (<10 visits/day)
- Locale roots redirect to their blog index
- Trailing slashes: under Workers the static-asset layer normalizes them (307). `src/middleware.ts`
  still has a 308 rule, but it only runs for Worker-served (SSR) responses - most pages are static
  and never reach it
- Legacy/section redirects are NOT in middleware for static paths: they live in the generated
  `_redirects` file (see `scripts/build-edge-config.mjs` + `src/config/legacy-redirects.json`),
  because middleware does not run for paths that match no route
- Language menu uses `navigationAlternatePaths` for deep-linking translated slugs

### Caching & Performance
- **Build-time caching**: Post summaries cached in `src/lib/.cache/post-summaries.json` (generated, never edit manually)
- **Cache optimization**: Only essential metadata stored (title, description, summary, tags, URLs, dates) - no full post text
  - Current size: ~448 KB for 318 posts (~1.4 KB per post)
  - Full post text read directly from MDX during build for RSS/JSON feeds (prerendered) - never bundled into the Worker
- **Cloudflare Workers size limit** (the "bundle" is the Worker code in `dist/server`, measured GZIPPED):
  - **Free plan: 3 MB gzipped · Paid plan: 10 MB gzipped**
  - Current Worker: **~271 KB gzipped** (~1.4 MB uncompressed) - about 9% of the free limit, huge headroom
  - Static assets (`dist/client`, ~25 MB across ~498 files) are served from Cloudflare's CDN and do
    NOT count toward the Worker size limit - only `dist/server` does
  - CI guards this: build fails if `dist/server` exceeds 10 MB uncompressed (see `.github/workflows/ci.yml`)
  - The whole caching + prerendering design exists to keep the Worker small (this used to be a fight
    against the old 5 MB Pages limit; on Workers there is now a ~10x margin). Keep it: metadata cache
    instead of full text, everything prerendered, MDX read only at build time
- **Prerendering strategy**: Content pages use `export const prerender = true` (except root `/` and the SSR redirect routes)
  - Blog posts (`/[locale]/blog/[slug]/`), tag pages, type pages, search page - all prerendered as static HTML
  - Root `/` and `/[locale]` use SSR for locale detection / redirects (`resolveRequestLocale`)
  - MDX content NOT included in Worker bundle, only the metadata cache
- Cache regenerates automatically before dev/build; rerun manually with `npm run cache:build`
- Blog listings, search, tag, and type pages consume build-time cache instead of `getCollection` in the Worker to minimize bundle size
- **Edge config**: `scripts/build-edge-config.mjs` runs after build (`postbuild` hook) and writes:
  - `dist/client/_redirects` - locale-less section landing pages (`/about/`, `/blog/`, `/search/`)
    plus legacy dead URLs from `src/config/legacy-redirects.json` (all -> homepage). Runs at the
    edge, which is required: middleware does not run for non-route paths under Workers.
  - `dist/client/_headers` - security headers from `src/config/security-headers.json`, applied to
    every response (the adapter only pre-fills immutable Cache-Control for `/_astro/*`).
  - `_routes.json` / the old 100-rule Pages limit no longer apply; Workers serves static assets
    from the CDN and only invokes the Worker for SSR routes automatically.

### Content Management
- **Manual timestamps**: Keep `updatedAt` = `publishedAt` unless content materially changes (no automated git sync)
- Content types: `article`, `note`, `story`
- Translation groups link content across locales

### Session & Theme
- **Sessions**: disabled (`session: false` in `astro.config.mjs`). The site does not use
  `Astro.session`; without this the Cloudflare adapter auto-provisions an unused SESSION KV binding.
- **Theme persistence**: Stored in both cookie and localStorage (`ALEXBON_THEME`)

### Search
- `/[locale]/search/` prerendered as static HTML with recent posts and `robots="noindex, follow"`
- Loads Algolia-powered React app lazily (no request until user types)
- Uses cached post summaries for fallback content

### Feeds & SEO
- **RSS feeds**: Prerendered with HTML content at `/[locale]/feed.xml`
- **JSON feeds**: Full-text feeds paginated at 500 records per page (`/[locale]/feed-full.json`, `/[locale]/feed-full-page-[page].json`)
- Sitemap prerendered with `export const prerender = true`
- Structured data via JSON-LD for blog collections and breadcrumbs

### Mobile & Typography
- Mobile layout uses full-width (`w-full`) containers with padding (not `w-[92%]`)
- Story/article text uses larger clamp: `clamp(1.1rem, 3vw, 1.2rem)`

### Error Handling
- Shared 404: `src/lib/http.ts` returns branded error page from `src/components/system/not-found.html`
- Same markup served by `src/pages/404.astro` and SSR fallbacks

### Security
- **Headers**: single source in `src/config/security-headers.json`. Applied via `_headers` to
  static-asset responses (most of the site) AND via `src/middleware.ts` to SSR responses - under
  Workers, prerendered pages bypass the middleware, so `_headers` is what actually protects them.
  - Content-Security-Policy: Protects against XSS, allows scripts from self and Algolia
  - X-Frame-Options: DENY (prevents clickjacking)
  - X-Content-Type-Options: nosniff (prevents MIME-type confusion)
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: Restricts camera, microphone, geolocation

### Social & Metadata
- `rel=me` and `sameAs` point to GitHub (`https://github.com/AlexBonSpace/alexbon.com`)
- Mastodon links removed from head metadata and content defaults

## Development Commands
```bash
# Development
npm run dev           # Fast Astro dev server (Vite). NOTE: redirects/_headers/_redirects/404
                      #   behave differently here than in production - it is NOT the real Worker
npm run preview       # Build + run the REAL Worker locally (astro build && wrangler dev) - use this
                      #   to verify redirects, security headers, 404 as they will actually behave
npm run cache:build   # Regenerate src/lib/.cache/post-summaries.json (runs automatically in dev/build)

# Code Quality
npm run lint          # Run ESLint to check for code issues
npm run lint:fix      # Run ESLint and automatically fix issues
npm run format        # Format all code with Prettier
npm run format:check  # Check if code is formatted correctly

# Testing & Verification
npm run test          # Execute Vitest suite (93 tests: locale-utils, blog-utils, feed-utils, seo)
npm run test:watch    # Watch mode for Vitest during development
npm run verify:seo    # Check built sitemap for banned URLs/duplicates/trailing slashes (requires build first)
npm run verify        # Run full suite: audit + test + build + verify:seo

# Build & Deployment
npm run build         # Build Worker (dist/server) + static assets (dist/client) + edge config
npx wrangler dev      # Local preview on the real workerd runtime (astro preview is NOT supported by the adapter)
npx wrangler deploy   # Deploy to Cloudflare Workers (uses adapter-generated dist/server/wrangler.json)

# Algolia (Optional)
npm run algolia:sync         # Incremental sync: push only changed records to Algolia
npm run algolia:sync -- --full  # Full reindex: replace entire Algolia index

# Content Analysis (For Claude Code)
npm run tags:analyze      # Analyze all story tags, generate cache with translations and popularity

# Astro Integrations (AI Agent-Friendly)
astro add <integration> --yes  # Add Astro integration without interactive prompts
                               # Perfect for AI agents (Claude Code, Cursor, Copilot)
                               # Examples: astro add react --yes, astro add tailwind --yes
```

## Automation & CI/CD

### Pre-commit Hooks (Husky)
Automatically run before every `git commit`:
- ✅ Code formatting (`npm run format`)
- ✅ Test suite (`npm run test`) — 93 tests
- ✅ Security audit (`npm audit --audit-level=critical`)

If any check fails, the commit is blocked until issues are resolved.

### GitHub Actions CI
Runs **checks only** (no deploy) on push to `main`/`master`/`claude/**` and on PRs to `main`/`master`:
- Code linting and formatting checks
- Full test suite
- Production build
- SEO validation
- Bundle size verification (`dist/server` < 10MB uncompressed)
- Security audit

### Deployment (Cloudflare Workers Builds)
Deployment is handled by **Cloudflare Workers Builds** (dashboard Git integration), NOT GitHub Actions -
the same "connect repo, push to `main`, auto-deploy" model Pages used, with no GitHub secrets. Build
command `npm run build`, deploy command `npx wrangler deploy`. The Worker name in the dashboard must
match `name` in `wrangler.toml` (`alexbon-astro`). Build-time env vars (e.g. `PUBLIC_ALGOLIA_*` for
search) are set in the Worker's **Build** variables, not runtime.

### VS Code Integration
Auto-formatting configured in `.vscode/settings.json`:
- Format on save with Prettier
- Auto-fix ESLint issues on save
- Recommended extensions listed in settings

## Content Management
- All content in `src/content/posts/{locale}/{type}/`
- Types: `article`, `note`, `story` (singular in frontmatter)
- Use translation groups for linked content across locales
- Cache regenerates automatically on build, manually via `npm run cache:build`

### Tags Management (For Claude Code)
When creating new story posts, use consistent tags to create content "hubs":

**Quick Tag Reference:**
```bash
npm run tags:analyze  # Generate fresh analysis of all tags with translations
```

This creates `scripts/.tags-cache.json` (gitignored) containing:
- Tags per locale sorted by rarity (rare tags first for hub building)
- Total story count

**Best Practices:**
1. **Prioritize rare tags** to build hubs (they appear first in the cache)
2. **Focus on psychology**: Tags should reflect internal processes (emotions, conflicts, transformations)
3. **Avoid generic tags**: Prefer specific psychological concepts over broad terms
4. **3-5 tags per story**: Enough to categorize without diluting relevance

**Tag Selection Process:**
```bash
# 1. Run analysis to see current tags
npm run tags:analyze

# 2. Console output shows RARE tags first (use these to build hubs)
# 3. Check existing tags in each locale separately
# 4. Add new tags only if existing ones don't capture the story's core themes
```

**Tag Cache Structure:**
```json
{
  "generatedAt": "2025-12-12T...",
  "totalStories": 32,
  "byLocale": {
    "ru": { "редкий тег": 1, "частый тег": 5 },
    "en": { "rare tag": 1, "common tag": 5 },
    "ua": { "рiдкiсний тег": 1, "частий тег": 5 }
  }
}
```

### Creating New Posts (For Claude Code)

**User provides:**
1. **Section**: stories / articles / okna / notes (or Claude asks)
2. **Title** in Russian
3. **Text** in Russian
4. **Date** (optional, defaults to today)

**Claude does automatically:**
- Translate to Ukrainian and English (natural, preserving style)
- Run `npm run tags:analyze` and select 3-5 appropriate tags
- Create slugs for each locale (check uniqueness)
- Write description based on content
- Generate frontmatter using template below
- Create 3 MDX files in `src/content/posts/{locale}/{section}/`
- Run `npm run build` to verify

**Formatting rules:**
- Long dash `—` → regular dash `-` (in text, description, translations)
- **Direct speech (RU/UA)**: `\-` instead of `-` (e.g., `\- Да, - сказал он`)
- **Direct speech (EN)**: Use quotation marks, not dashes (e.g., `"Yes," he said.`)
- Empty line between paragraphs
- Section dividers: `***` (renders as `✦ ✦ ✦`)

**Notes (Искры и проблески) - special format:**
- `title` = full quote text (the actual insight, not a label)
- `body` = empty (no content after frontmatter)
- `description` = not needed (auto-generated from title)
- Schema: `@type: SocialMediaPosting` (author's original insights, not external quotes)
- H1 on page shows the title as main content

**Frontmatter template (story/article/okna):**
```yaml
title: ...
type: story | article | okna
publishedAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
tags:
  - tag1
  - tag2
translationGroup: slug-YYYY-MM-DD
author: Alex Bon
authorDisplay:
  ua: Алекс Бон
  ru: Алекс Бон
  en: Alex Bon
authorSchema:
  sameAs:
    - 'https://www.alexbon.com/en/about/'
    - 'https://www.alexbon.com/ru/about/'
    - 'https://www.alexbon.com/ua/about/'
    - 'https://github.com/AlexBonSpace/alexbon.com'
    - 'https://www.youtube.com/@AlexBonSpace'
    - 'https://open.spotify.com/artist/6oFimUSI5K66NlDyUQyIyU'
    - 'https://music.apple.com/us/artist/alex-bon-space/1879505673'
    - 'https://www.tiktok.com/@alexbonspace'
license: CC BY 4.0
canonical: https://www.alexbon.com/{locale}/blog/{slug}/
description: |-
  ...
```

**Frontmatter template (note) - minimal:**
```yaml
title: Полный текст цитаты здесь. Без сокращений.
type: note
publishedAt: YYYY-MM-DD
updatedAt: YYYY-MM-DD
tags:
  - tag1
  - tag2
translationGroup: slug-YYYY-MM-DD
author: Alex Bon
authorDisplay:
  ua: Алекс Бон
  ru: Алекс Бон
  en: Alex Bon
authorSchema:
  sameAs:
    - 'https://www.alexbon.com/en/about/'
    - 'https://www.alexbon.com/ru/about/'
    - 'https://www.alexbon.com/ua/about/'
    - 'https://github.com/AlexBonSpace/alexbon.com'
    - 'https://www.youtube.com/@AlexBonSpace'
    - 'https://open.spotify.com/artist/6oFimUSI5K66NlDyUQyIyU'
    - 'https://music.apple.com/us/artist/alex-bon-space/1879505673'
    - 'https://www.tiktok.com/@alexbonspace'
license: CC BY 4.0
canonical: https://www.alexbon.com/{locale}/blog/{slug}/
---
```

## Algolia Search (Optional)
- **Indexing**: `scripts/push-algolia.mjs` reads all `dist/client/*/feed-full*.json` pages (follows `next_url`)
- **Three indexes**: `TOMA` (ua), `posts_ru`, `posts_en`. UA uses `TOMA` on both write (sync) and read
  (search) - the name is legacy but consistent
- **Incremental mode**: Maintains manifest at `scripts/.algolia-cache.json` (gitignored); only pushes changed/removed records
- **Full mode** (`--full` flag): Replaces entire index via `replaceAllObjects` and rebuilds manifest
- **Env vars**: run `npm run algolia:sync` locally with `.env` (holds `ALGOLIA_ADMIN_API_KEY`). The Worker
  build needs only the public `PUBLIC_ALGOLIA_*` vars (search runs client-side); admin key never goes to Cloudflare

## Analysis Instructions for Claude
**Always perform deep technical analysis:**
- Use `rg -n` (ripgrep) or `Grep` tool to search codebase before making conclusions
- Show exact code lines with `file:line` references for all claims
- Trace complete execution paths from request to response
- Check middleware, layouts, components, and configurations
- Verify assumptions with concrete code evidence
- For URL behavior: trace through middleware.ts → pages → layouts → components
- For build processes: check package.json scripts, astro.config.mjs, build scripts
- Never guess - always find the actual code that implements the behavior
- When analyzing issues, search for ALL instances: `rg -A5 -B5 "pattern"`

**For content creation tasks (new posts):**
- **ALWAYS run `npm run tags:analyze` first** to get current tag inventory
- Reference `scripts/.tags-cache.json` for tag translations
- Prioritize rare tags (shown first in console and cache) to build content hubs
- If cache is stale (>1 week old), regenerate it before selecting tags