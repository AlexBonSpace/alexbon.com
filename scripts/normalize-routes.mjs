#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ROUTES_FILE = path.join(ROOT, "dist", "_routes.json");

// Supported locales (should match astro.config.mjs i18n.locales)
const LOCALES = ["ua", "ru", "en"];

async function main() {
  let raw;
  try {
    raw = await readFile(ROUTES_FILE, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      console.warn(`[routes] ${ROUTES_FILE} not found, skipping normalization`);
      return;
    }
    throw error;
  }

  const config = JSON.parse(raw);
  const originalExclude = Array.isArray(config.exclude) ? config.exclude : [];

  // Collect static assets and non-locale paths
  const staticAssets = new Set();
  const seen = new Set();

  for (const route of originalExclude) {
    if (typeof route !== "string" || !route) continue;
    const trimmed = route.trim();

    // Keep static assets (/_astro/*, /images/*, /favicon.svg, etc.)
    if (
      trimmed.startsWith("/_astro/") ||
      trimmed.startsWith("/images/") ||
      trimmed === "/favicon.svg" ||
      trimmed === "/robots.txt" ||
      trimmed === "/sitemap.xml" ||
      trimmed === "/404" ||
      trimmed === "/index.html"
    ) {
      if (!seen.has(trimmed)) {
        staticAssets.add(trimmed);
        seen.add(trimmed);
      }
    }
  }

  // Build wildcard routes for all localized paths
  const wildcards = [];

  for (const locale of LOCALES) {
    // Main locale paths
    wildcards.push(`/${locale}/about`);
    wildcards.push(`/${locale}/search`);
    wildcards.push(`/${locale}/feed.xml`);
    wildcards.push(`/${locale}/feed-full.json`);
    wildcards.push(`/${locale}/feed-full-page-*.json`);

    // Blog wildcards (covers all posts, tags, types, pagination)
    wildcards.push(`/${locale}/blog/*`);
  }

  // Combine: static assets first, then wildcards
  const result = [...Array.from(staticAssets).sort(), ...wildcards];

  config.exclude = result;
  await writeFile(ROUTES_FILE, `${JSON.stringify(config, null, 2)}\n`);

  console.log(
    `[routes] optimized to ${result.length} exclude entries (${staticAssets.size} static, ${wildcards.length} wildcards for ${LOCALES.length} locales)`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
