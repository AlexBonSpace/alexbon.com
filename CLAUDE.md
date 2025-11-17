# Claude Code Context - alexbon.com

## Project Overview
Personal blog built with Astro 5 in server mode, deployed to Cloudflare Pages. Multilingual content (UA/RU/EN) with creative writing (articles, notes, stories) managed through MDX files.

## Technology Stack
- **Framework**: Astro 5 with server-side rendering
- **Deployment**: Cloudflare Pages adapter (`@astrojs/cloudflare`)
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Interactivity**: React islands for navbar, search, theme toggle
- **Content**: MDX via Astro Content Collections
- **Search**: Optional Algolia integration for interactive search
- **Testing**: Vitest with happy-dom

## Project Structure
```
src/
├── components/           # React/Astro components
│   ├── blog/            # Blog-specific components
│   ├── search/          # Search functionality
│   └── system/          # System pages (404, etc.)
├── content/             # MDX content collections
│   └── posts/           # Organized by locale then type
│       ├── en/          # English content
│       ├── ru/          # Russian content
│       └── ua/          # Ukrainian content (default)
├── lib/                 # Core utilities
│   ├── .cache/         # Generated build cache (never edit manually)
│   └── ...             # Blog helpers, SEO, feeds
├── pages/              # File-based routing
├── contexts/           # React contexts (theme, i18n)
├── messages/           # Translation dictionaries
└── styles/             # Global CSS and tokens
```

## Key Features & Behaviors
- **Locale-first routing**: All content under locale prefixes (`/ua/`, `/ru/`, `/en/`)
- **Build-time caching**: Post summaries cached in `src/lib/.cache/post-summaries.json`
- **Manual timestamps**: Keep `updatedAt` = `publishedAt` unless content materially changes
- **Session management**: Cookie-based with `ASTRO_SESSION_SECRET` for production
- **Theme persistence**: Stored in both cookie and localStorage (`ALEXBON_THEME`)
- **Search**: SSR fallback with lazy Algolia app loading
- **Feeds**: Prerendered RSS/JSON feeds with pagination

## Development Commands
```bash
npm run dev          # Start dev server with SSR
npm run build        # Build for production
npm run test         # Run Vitest suite
npm run test:watch   # Watch mode testing
npm run verify       # Full verification (test + build + SEO check)
npm run cache:build  # Regenerate post summaries cache
```

## Content Management
- All content in `src/content/posts/{locale}/{type}/`
- Types: `articles`, `notes`, `stories`
- Use translation groups for linked content across locales
- Cache regenerates automatically on build, manually via `npm run cache:build`

## SEO & Performance
- Prerendered sitemap and feeds
- Structured data with JSON-LD
- Mobile-first responsive design
- Full-width containers with consistent padding

## Optional Features
- **Algolia Search**: Configured via `scripts/push-algolia.mjs`
- **Incremental sync**: Tracks changes in `scripts/.algolia-cache.json`

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