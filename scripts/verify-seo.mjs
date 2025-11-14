#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.resolve(scriptDir, "..");
const distDir = path.join(rootDir, "dist");
const sitemapPath = path.join(distDir, "sitemap.xml");
const SITE_URL = "https://www.alexbon.com";
const REQUIRED_LOCALES = ["ua", "ru", "en"];
const BANNED_PATTERNS = [
  { pattern: /feed-full/i, message: "Sitemap should not include feed-full JSON entries" },
  { pattern: /feed\.xml/i, message: "Sitemap should not include feed xml entries" },
  { pattern: /search\//i, message: "Sitemap should not include search routes because they are noindex" },
  { pattern: /\.json/i, message: "Sitemap should not reference JSON endpoints" },
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function ok(message) {
  console.log(`✅ ${message}`);
}

async function ensureSitemap() {
  try {
    await fs.access(sitemapPath);
  } catch {
    fail("dist/sitemap.xml is missing. Run `npm run build` first.");
  }
}

function extractLocs(xml) {
  const matches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g));
  return matches.map(([, url]) => url.trim());
}

function hasExtension(url) {
  const lastSegment = url.split("/").filter(Boolean).pop() ?? "";
  return /\.[a-z0-9]+$/i.test(lastSegment);
}

async function run() {
  await ensureSitemap();
  const xml = await fs.readFile(sitemapPath, "utf8");

  for (const { pattern, message } of BANNED_PATTERNS) {
    if (pattern.test(xml)) {
      fail(message);
    }
  }

  const locs = extractLocs(xml);
  if (locs.length === 0) {
    fail("No <loc> entries were found in sitemap.xml");
  }

  const duplicates = locs.filter((loc, index) => locs.indexOf(loc) !== index);
  if (duplicates.length > 0) {
    fail(`Sitemap contains duplicated <loc> entries: ${duplicates.join(", ")}`);
  }

  const urlsWithoutSlash = locs.filter((loc) => !hasExtension(loc) && !loc.endsWith("/"));
  if (urlsWithoutSlash.length > 0) {
    fail(`Some sitemap URLs are missing a trailing slash: ${urlsWithoutSlash.join(", ")}`);
  }

  const missingLocales = REQUIRED_LOCALES.filter(
    (locale) => !locs.some((loc) => loc.startsWith(`${SITE_URL}/${locale}/`)),
  );
  if (missingLocales.length > 0) {
    fail(`Sitemap is missing locale roots for: ${missingLocales.join(", ")}`);
  }

  ok(`Sitemap contains ${locs.length} URLs with expected structure.`);
}

run().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
