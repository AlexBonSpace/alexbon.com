#!/usr/bin/env node

/**
 * Tags Analysis Script for Claude Code
 *
 * Analyzes story posts, extracts tags by locale, counts usage.
 * Tags sorted by rarity (rare first) to prioritize hub building.
 *
 * Output: scripts/.tags-cache.json
 * Run: npm run tags:analyze
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fg from 'fast-glob';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(__dirname, '../src/content/posts');
const CACHE_FILE = path.join(__dirname, '.tags-cache.json');
const LOCALES = ['ru', 'ua', 'en'];
const FRONTMATTER_PATTERN = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/;

async function analyzeTags() {
  console.log('🔍 Analyzing tags across story posts...\n');

  // Find all story MDX files
  const storyFiles = await fg('*/stories/*.mdx', {
    cwd: CONTENT_DIR,
    absolute: true,
  });

  console.log(`📚 Found ${storyFiles.length} story files\n`);

  // Count tags per locale
  const tagCounts = {
    ru: new Map(),
    ua: new Map(),
    en: new Map(),
  };
  const allGroups = new Set();

  for (const filePath of storyFiles) {
    const content = await fs.readFile(filePath, 'utf-8');

    const match = content.match(FRONTMATTER_PATTERN);
    if (!match) continue;

    const frontmatter = yaml.load(match[1]);
    const locale = path.basename(path.dirname(path.dirname(filePath)));

    if (!LOCALES.includes(locale)) continue;

    const tags = frontmatter.tags || [];
    if (frontmatter.translationGroup) {
      allGroups.add(frontmatter.translationGroup);
    }

    // Count each tag in its locale
    for (const tag of tags) {
      const current = tagCounts[locale].get(tag) || 0;
      tagCounts[locale].set(tag, current + 1);
    }
  }

  // Convert to sorted arrays (ascending by count = rare first)
  const byLocale = {};
  for (const locale of LOCALES) {
    const sorted = [...tagCounts[locale].entries()].sort((a, b) => a[1] - b[1]);
    // Convert to object (compact format: { "tag": count })
    byLocale[locale] = Object.fromEntries(sorted);
  }

  // Build cache
  const cacheData = {
    generatedAt: new Date().toISOString(),
    totalStories: allGroups.size,
    byLocale,
  };

  // Write compact JSON (no pretty-print arrays)
  await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');

  // Print summary
  console.log('📊 Tags Analysis Summary\n');
  console.log(`Total stories: ${allGroups.size}`);
  const counts = LOCALES.map(l => `${l.toUpperCase()}=${Object.keys(byLocale[l]).length}`).join(', ');
  console.log(`Total unique tags: ${counts}\n`);

  // Show rare tags first (priority for creating hubs)
  console.log('🎯 RARE TAGS (use these first to build hubs):\n');

  for (const locale of LOCALES) {
    const flag = locale === 'ru' ? '🇷🇺' : locale === 'ua' ? '🇺🇦' : '🇬🇧';
    console.log(`${flag} ${locale.toUpperCase()}:`);

    const entries = Object.entries(byLocale[locale]);
    const rare = entries.filter(([, count]) => count <= 2).slice(0, 10);
    for (const [tag, count] of rare) {
      console.log(`   ${tag} (${count})`);
    }
    console.log('');
  }

  console.log('📈 FREQUENT TAGS (well-established hubs):\n');

  for (const locale of LOCALES) {
    const flag = locale === 'ru' ? '🇷🇺' : locale === 'ua' ? '🇺🇦' : '🇬🇧';
    console.log(`${flag} ${locale.toUpperCase()}:`);

    const entries = Object.entries(byLocale[locale]);
    const frequent = entries.slice(-5).reverse();
    for (const [tag, count] of frequent) {
      console.log(`   ${tag} (${count})`);
    }
    console.log('');
  }

  console.log(`✅ Cache saved: ${CACHE_FILE}`);
  console.log(`   Size: ${(await fs.stat(CACHE_FILE)).size} bytes\n`);
}

analyzeTags().catch(console.error);
