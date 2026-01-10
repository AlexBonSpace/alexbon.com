# Claude Code Context - alexbon.com

## Project Overview
Personal blog built with Astro 5 in server mode, deployed to Cloudflare Pages. Multilingual content (UA/RU/EN) with creative writing (articles, notes, stories) managed through MDX files.

## Technology Stack
- **Framework**: Astro 5 with server-side rendering
- **Deployment**: Cloudflare Pages adapter (`@astrojs/cloudflare`)
- **Styling**: Tailwind CSS v4 with custom design tokens in `src/styles/globals.css`
- **Interactivity**: React islands (navbar, search page, theme toggle, reading progress) marked with `client:*` directives
- **Content**: MDX via Astro Content Collections with translation helpers in `src/i18n/` and blog utilities in `src/lib/blog.ts`
- **Search**: Optional Algolia integration; indexing via `scripts/push-algolia.mjs` reading locale feeds from `dist/*/feed-full*.json`
- **Testing**: Vitest with happy-dom (93 tests covering locale utils, blog utils, feed utils, SEO)
- **Code Quality**: ESLint + Prettier with automatic formatting
- **Git Hooks**: Husky pre-commit hooks (format, test, security audit)
- **CI/CD**: GitHub Actions for automated checks on push

### React Components (9 active files, ~700 KB in worker bundle for SSR)
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
  - Current size: ~287 KB for 168 posts (~1.7 KB per post)
  - Projected at 500 posts: ~870 KB cache → ~3.6 MB total worker bundle (safely under 5MB Cloudflare limit)
  - Worker bundle size: **3.0 MB** (168 posts) → ~3.6 MB (500 posts) - minimal growth due to prerendering
  - Bundle includes React runtime (~700 KB) required for SSR rendering of interactive components (navigation, search, theme toggle)
  - Full post text read directly from MDX during build for RSS/JSON feeds (which are prerendered)
- **Prerendering strategy**: Content pages use `export const prerender = true` (except root `/`)
  - Blog posts (`/[locale]/blog/[slug]/`), tag pages, search page - all prerendered as static HTML
  - Root `/` uses SSR for intelligent locale detection (`resolveRequestLocale`)
  - MDX content NOT included in worker bundle, only metadata cache
  - Worker bundle contains: runtime code (~2.3 MB including React SSR) + post summaries (~287 KB) + routing (~400 KB)
- Cache regenerates automatically before dev/build; rerun manually with `npm run cache:build`
- Blog listings, search, tag, and type pages consume build-time cache instead of `getCollection` in worker to minimize bundle size
- **Routes optimization**: `scripts/normalize-routes.mjs` runs automatically after build (`postbuild` hook) to optimize `_routes.json`
  - Cloudflare Pages has 100-rule limit for routing configuration
  - Current configuration: 24 optimized entries (6 static assets + 18 wildcards for localized paths)
  - Uses wildcards like `/{locale}/blog/*` instead of individual post routes
  - Reduces Worker invocations: blog posts served from CDN, only dynamic routes invoke Worker

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
npm run test          # Execute Vitest suite (93 tests: locale-utils, blog-utils, feed-utils, seo)
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
- Direct speech start: `\-` instead of `-` (e.g., `\- Да, - сказал он`)
- Empty line between paragraphs
- Section dividers: `***` (renders as `✦ ✦ ✦`)

**Notes (Телеграммы от Реальности) - special format:**
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
    - 'https://www.facebook.com/AlexBonSpace'
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
    - 'https://www.facebook.com/AlexBonSpace'
license: CC BY 4.0
canonical: https://www.alexbon.com/{locale}/blog/{slug}/
---
```

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

**For content creation tasks (new posts):**
- **ALWAYS run `npm run tags:analyze` first** to get current tag inventory
- Reference `scripts/.tags-cache.json` for tag translations
- Prioritize rare tags (shown first in console and cache) to build content hubs
- If cache is stale (>1 week old), regenerate it before selecting tags