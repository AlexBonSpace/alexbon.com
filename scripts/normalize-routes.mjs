#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ROUTES_FILE = path.join(ROOT, "dist", "_routes.json");
const TAG_ROUTE_PATTERN = /^\/([a-z]{2})\/blog\/tag\//i;

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
  const exclude = Array.isArray(config.exclude) ? config.exclude : [];

  const result = [];
  const seen = new Set();
  const tagLocales = new Set();

  for (const route of exclude) {
    if (typeof route !== "string" || !route) continue;
    const trimmed = route.trim();

    const tagMatch = TAG_ROUTE_PATTERN.exec(trimmed);
    if (tagMatch) {
      tagLocales.add(tagMatch[1]);
      continue;
    }

    if (trimmed.length > 100) {
      console.warn(`[routes] skipping overlong rule: ${trimmed}`);
      continue;
    }

    if (!seen.has(trimmed)) {
      result.push(trimmed);
      seen.add(trimmed);
    }
  }

  for (const locale of Array.from(tagLocales).sort()) {
    const wildcard = `/${locale}/blog/tag/*`;
    if (!seen.has(wildcard)) {
      result.push(wildcard);
      seen.add(wildcard);
    }
  }

  config.exclude = result;
  await writeFile(ROUTES_FILE, `${JSON.stringify(config, null, 2)}\n`);
  const wildcards = Array.from(tagLocales).sort();
  console.log(
    `[routes] normalized ${result.length} exclude entries (tag wildcards: ${
      wildcards.length ? wildcards.join(", ") : "none"
    })`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
