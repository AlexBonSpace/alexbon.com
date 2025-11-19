# Claude Code Context - alexbon.com

## Project Overview
Personal blog built with Astro 5 in server mode, deployed to Cloudflare Pages. Multilingual content (UA/RU/EN) with creative writing (articles, notes, stories) managed through MDX files.

## Technology Stack
- **Framework**: Astro 5 with server-side rendering
- **Deployment**: Cloudflare Pages adapter (`@astrojs/cloudflare`)
- **Styling**: Tailwind CSS v4 with custom design tokens in `src/styles/globals.css`
- **Interactivity**: React islands (navbar, search page, theme toggle) marked with `client:*` directives
- **Content**: MDX via Astro Content Collections with translation-aware helpers in `src/lib/pages.ts` and `src/lib/blog.ts`
- **Search**: Optional Algolia integration; indexing via `scripts/push-algolia.mjs` reading locale feeds from `dist/*/feed-full*.json`
- **Testing**: Vitest with happy-dom
- **Code Quality**: ESLint + Prettier with automatic formatting
- **Git Hooks**: Husky pre-commit hooks (lint, test, security audit)
- **CI/CD**: GitHub Actions for automated checks on push

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
│   ├── pages.ts        # Translation-aware page helpers
│   ├── blog.ts         # Blog data helpers
│   └── http.ts         # Shared 404 handling
├── pages/              # File-based routing (/, /about, /blog, /search, feeds, sitemap)
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
- Trailing slashes enforced via 308 redirects in middleware
- Language menu uses `navigationAlternatePaths` for deep-linking translated slugs

### Caching & Performance
- **Build-time caching**: Post summaries cached in `src/lib/.cache/post-summaries.json` (generated, never edit manually)
- **Cache optimization**: Only essential metadata stored (title, description, summary, tags, URLs, dates) - no full post text
  - Current size: ~235 KB for 138 posts (~1.7 KB per post)
  - Projected at 500 posts: ~870 KB cache → ~2.2 MB total worker bundle (safely under 5MB Cloudflare limit)
  - Worker bundle size: 1.5 MB (138 posts) → ~2.2 MB (500 posts) - minimal growth due to prerendering
  - Full post text read directly from MDX during build for RSS/JSON feeds (which are prerendered)
- **Prerendering strategy**: Content pages use `export const prerender = true` (except root `/`)
  - Blog posts (`/[locale]/blog/[slug]/`), tag pages, search page - all prerendered as static HTML
  - Root `/` uses SSR for intelligent locale detection (`resolveRequestLocale`)
  - MDX content NOT included in worker bundle, only metadata cache
  - Worker bundle contains only runtime code + post summaries (~230 KB)
- Cache regenerates automatically before dev/build; rerun manually with `npm run cache:build`
- Blog listings, search, tag, and type pages consume build-time cache instead of `getCollection` in worker to minimize bundle size
- **Routes optimization**: `scripts/normalize-routes.mjs` runs automatically after build (`postbuild` hook) to optimize `_routes.json`
  - Cloudflare Pages has 100-rule limit for routing configuration
  - Before: 99 individual exclude entries (one per post/page) - hitting the limit
  - After: 24 optimized entries (6 static assets + 18 wildcards for localized paths)
  - Uses wildcards like `/{locale}/blog/*` instead of individual post routes
  - Reduces Worker invocations: blog posts now served from CDN, only dynamic routes invoke Worker

### Content Management
- **Manual timestamps**: Keep `updatedAt` = `publishedAt` unless content materially changes (no automated git sync)
- Content types: `article`, `note`, `story`
- Translation groups link content across locales

### Session & Theme
- **Session management**: Lightweight cookie driver; set `ASTRO_SESSION_SECRET` (e.g., `openssl rand -base64 32`) in production for secure signing
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
- **Headers**: Comprehensive security headers in `src/middleware.ts`
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
npm run dev           # Start Astro dev server with SSR on Cloudflare shim
npm run cache:build   # Regenerate src/lib/.cache/post-summaries.json (runs automatically in dev/build)

# Code Quality
npm run lint          # Run ESLint to check for code issues
npm run lint:fix      # Run ESLint and automatically fix issues
npm run format        # Format all code with Prettier
npm run format:check  # Check if code is formatted correctly

# Testing & Verification
npm run test          # Execute Vitest suite (unit helpers + component tests)
npm run test:watch    # Watch mode for Vitest during development
npm run verify:seo    # Check built sitemap for banned URLs/duplicates/trailing slashes (requires build first)
npm run verify        # Run full suite: audit + test + build + verify:seo

# Build & Deployment
npm run build         # Build Cloudflare SSR bundle + prerendered feeds/sitemap
npm run preview       # Local preview of the SSR build
npx wrangler pages deploy dist  # Deploy to Cloudflare Pages Functions

# Algolia (Optional)
npm run algolia:sync         # Incremental sync: push only changed records to Algolia
npm run algolia:sync -- --full  # Full reindex: replace entire Algolia index
```

## Automation & CI/CD

### Pre-commit Hooks (Husky)
Automatically run before every `git commit`:
- ✅ Lint check (`npm run lint`)
- ✅ Test suite (`npm run test`)
- ✅ Security audit (`npm audit --audit-level=high`)

If any check fails, the commit is blocked until issues are resolved.

### GitHub Actions CI
Automatically triggered on push to `main`, `master`, or `claude/**` branches:
- Code linting and formatting checks
- Full test suite
- Production build
- SEO validation
- Bundle size verification (<5MB for worker)
- Security audit

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

## Algolia Search (Optional)
- **Indexing**: `scripts/push-algolia.mjs` reads all `dist/*/feed-full*.json` pages (follows `next_url`)
- **Incremental mode**: Maintains manifest at `scripts/.algolia-cache.json` (gitignored); only pushes changed/removed records
- **Full mode** (`--full` flag): Replaces entire index via `replaceAllObjects` and rebuilds manifest
- Requires Algolia API keys in environment variables

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