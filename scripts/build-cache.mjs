#!/usr/bin/env node
import fg from "fast-glob";
import yaml from "js-yaml";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const POSTS_DIR = path.join(ROOT, "src/content/posts");
const CACHE_DIR = path.join(ROOT, "src/lib/.cache");
const CACHE_FILE = path.join(CACHE_DIR, "post-summaries.json");
const SITE_URL = "https://www.alexbon.com";
const MAX_TEXT_LENGTH = 300;

const { default: astroConfig } = await import("../astro.config.mjs");
const LOCALES = new Set(astroConfig?.i18n?.locales ?? ["ua", "ru", "en"]);
const FRONTMATTER_PATTERN = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

const ensurePlainText = (raw) =>
  raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`+/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_~>#]+/g, " ")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function createDescription(text, limit = 160) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit - 3).trimEnd()}...`;
}

function extractFirstSentence(text) {
  if (!text) return "";
  const match = text.match(/(.+?[.!?])(\s|$)/);
  return match ? match[1].trim() : text.trim();
}

function truncateToBoundary(text, limit) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;
  const sliced = normalized.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  return lastSpace > Math.floor(limit * 0.5) ? sliced.slice(0, lastSpace).trimEnd() : sliced.trimEnd();
}

function ensureEllipsis(text) {
  const trimmed = text.trimEnd();
  if (!trimmed) return "";
  if (/[.]{3}$/.test(trimmed) || trimmed.endsWith("…")) {
    return trimmed;
  }
  return `${trimmed}...`;
}

function buildCardSnippet(type, plainText, override) {
  const overrideValue = override?.trim();
  if (type === "note") {
    return overrideValue && overrideValue.length > 0 ? overrideValue : plainText;
  }
  if (overrideValue && overrideValue.length > 0) {
    return ensureEllipsis(overrideValue);
  }
  const auto = truncateToBoundary(plainText, 350);
  return ensureEllipsis(auto || plainText);
}

function createSearchContent(raw) {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_>#]/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

function resolveCollection(segment) {
  if (segment === "articles" || segment === "stories" || segment === "okna") return segment;
  return "notes";
}

function resolveType(collection, candidate) {
  if (collection === "articles") return "article";
  if (collection === "stories") return "story";
  if (collection === "okna") return "okna";
  if (candidate === "article" || candidate === "story" || candidate === "okna") return candidate;
  return "note";
}

function getGitTimestamp(relativePath) {
  try {
    const isoString = execFileSync("git", ["log", "-1", "--format=%cI", "--", relativePath], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return isoString || null;
  } catch {
    return null;
  }
}

function limitTextLength(text, limit = MAX_TEXT_LENGTH) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) {
    return normalized;
  }
  if (limit <= 1) {
    return normalized.slice(0, limit);
  }
  const slice = normalized.slice(0, limit - 1).trimEnd();
  return `${slice}…`;
}

function parseFrontmatter(raw, relativePath) {
  const normalized = raw.replace(/^\uFEFF/, "");
  const match = normalized.match(FRONTMATTER_PATTERN);
  if (!match) {
    return {
      data: {},
      content: normalized,
    };
  }

  let data = {};
  try {
    const parsed = yaml.load(match[1]) ?? {};
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      data = parsed;
    } else {
      throw new Error("frontmatter must be an object");
    }
  } catch (error) {
    throw new Error(`[cache] Failed to parse frontmatter in ${relativePath}: ${error.message}`);
  }

  const content = normalized.slice(match[0].length);
  return { data, content };
}

async function main() {
  const files = await fg("**/*.mdx", { cwd: POSTS_DIR });
  const summaries = [];

  for (const relativeFile of files) {
    const absolute = path.join(POSTS_DIR, relativeFile);
    const raw = await readFile(absolute, "utf8");
    const parsed = parseFrontmatter(raw, relativeFile);
    const segments = relativeFile.split(path.sep);
    const locale = segments[0];
    if (!LOCALES.has(locale)) {
      continue;
    }
    const slugSegments = segments.map((segment) => segment.replace(/\.mdx$/, ""));
    const collection = resolveCollection(slugSegments[1]);
    const fileSlug = slugSegments[slugSegments.length - 1];
    const type = resolveType(collection, parsed.data.type);

    const plainTextFull = ensurePlainText(parsed.content);
    const plainText = limitTextLength(plainTextFull, MAX_TEXT_LENGTH);
    const description = (parsed.data.description ?? "").trim() || createDescription(plainText, 160);
    const summary = extractFirstSentence(plainText) || description;
    const cardSnippet = buildCardSnippet(type, plainTextFull, parsed.data.cardSnippet);

    const publishedAt = new Date(parsed.data.publishedAt).toISOString();
    const gitTimestamp = getGitTimestamp(path.relative(ROOT, absolute));
    const updatedAt = parsed.data.updatedAt
      ? new Date(parsed.data.updatedAt).toISOString()
      : gitTimestamp ?? publishedAt;
    const tags = Array.isArray(parsed.data.tags)
      ? parsed.data.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [];

    const translationGroup = (parsed.data.translationGroup ?? "").trim() || fileSlug;
    const license = typeof parsed.data.license === "string" ? parsed.data.license.trim() : "";
    const url = `/${locale}/blog/${fileSlug}/`;
    const canonical =
      (parsed.data.canonical ?? "").trim() ||
      `${SITE_URL}/${locale}/blog/${fileSlug}/`;

    summaries.push({
      slug: fileSlug,
      locale,
      collection,
      type,
      title: (parsed.data.title ?? "").trim() || summary || fileSlug,
      description,
      summary,
      cardSnippet,
      plainText,
      tags,
      url,
      canonical,
      publishedAt,
      updatedAt,
      translationGroup,
      license,
    });
  }

  summaries.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(CACHE_FILE, JSON.stringify(summaries, null, 2));
  console.log(`[cache] Wrote ${summaries.length} post summaries to ${path.relative(ROOT, CACHE_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
