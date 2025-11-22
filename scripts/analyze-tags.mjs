#!/usr/bin/env node

/**
 * Tags Analysis Script for Claude Code
 *
 * Analyzes all story posts, extracts tags with translations,
 * counts usage frequency, and generates a cache file for quick reference.
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

/**
 * Main function
 */
async function analyzeTags() {
  console.log('🔍 Analyzing tags across all story posts...\n');

  // Find all story MDX files
  const storyFiles = await fg('*/stories/*.mdx', {
    cwd: CONTENT_DIR,
    absolute: true,
  });

  console.log(`📚 Found ${storyFiles.length} story files\n`);

  // Parse all files and extract tag data
  const tagMap = new Map(); // Map<tagText, TagData>
  const postsByLocale = { ru: [], ua: [], en: [] };

  for (const filePath of storyFiles) {
    const content = await fs.readFile(filePath, 'utf-8');

    // Extract frontmatter
    const match = content.match(FRONTMATTER_PATTERN);
    if (!match) continue;

    const frontmatter = yaml.load(match[1]);

    const locale = path.basename(path.dirname(path.dirname(filePath)));
    const slug = path.basename(filePath, '.mdx');

    if (!LOCALES.includes(locale)) continue;

    const postInfo = {
      slug,
      locale,
      title: frontmatter.title,
      translationGroup: frontmatter.translationGroup,
      publishedAt: frontmatter.publishedAt,
    };

    postsByLocale[locale].push(postInfo);

    // Extract tags
    const tags = frontmatter.tags || [];
    for (const tag of tags) {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, {
          text: tag,
          translations: {},
          count: 0,
          posts: [],
        });
      }

      const tagData = tagMap.get(tag);
      tagData.translations[locale] = tag;
      tagData.count++;
      tagData.posts.push(postInfo);
    }
  }

  // Group tags by translation group
  const translationGroups = new Map(); // Map<translationGroup, Set<locales with this tag>>

  for (const [tagText, tagData] of tagMap) {
    // Find posts that share translation group
    const groups = new Map(); // Map<translationGroup, locales[]>

    for (const post of tagData.posts) {
      if (!groups.has(post.translationGroup)) {
        groups.set(post.translationGroup, []);
      }
      groups.get(post.translationGroup).push(post.locale);
    }

    // For each translation group, find all tag translations
    for (const [group, locales] of groups) {
      if (!translationGroups.has(tagText)) {
        translationGroups.set(tagText, tagData);
      }
    }
  }

  // Merge tags by finding matching translation groups
  const mergedTags = [];
  const processed = new Set();

  for (const [tagText, tagData] of tagMap) {
    if (processed.has(tagText)) continue;

    // Find all related tags through translation groups
    const relatedTags = new Map();
    relatedTags.set(tagData.translations.ru || tagData.translations.ua || tagData.translations.en, tagData);

    // Look for posts with same translation group
    const translationGroups = new Set(tagData.posts.map(p => p.translationGroup));

    for (const [otherTagText, otherTagData] of tagMap) {
      if (otherTagText === tagText || processed.has(otherTagText)) continue;

      // Check if any post translation groups overlap
      const otherGroups = new Set(otherTagData.posts.map(p => p.translationGroup));
      const hasOverlap = [...translationGroups].some(g => otherGroups.has(g));

      if (hasOverlap) {
        const key = otherTagData.translations.ru || otherTagData.translations.ua || otherTagData.translations.en;
        relatedTags.set(key, otherTagData);
      }
    }

    // Merge all related tags
    const merged = {
      translations: {},
      count: 0,
      posts: [],
      examples: [],
    };

    for (const [, data] of relatedTags) {
      Object.assign(merged.translations, data.translations);
      merged.count += data.count;
      merged.posts.push(...data.posts);
      processed.add(data.text);
    }

    // Get unique posts by translation group (count each story once, not per locale)
    const uniqueGroups = new Set(merged.posts.map(p => p.translationGroup));
    merged.uniqueCount = uniqueGroups.size;

    // Add top 3 examples
    merged.examples = [...uniqueGroups]
      .slice(0, 3)
      .map(group => {
        const post = merged.posts.find(p => p.translationGroup === group);
        return {
          title: post.title,
          slug: post.slug,
          locale: post.locale,
        };
      });

    mergedTags.push(merged);
  }

  // Sort by unique count (descending)
  mergedTags.sort((a, b) => b.uniqueCount - a.uniqueCount);

  // Generate cache file
  const cacheData = {
    generatedAt: new Date().toISOString(),
    totalTags: mergedTags.length,
    totalStories: new Set(
      [...tagMap.values()].flatMap(t => t.posts.map(p => p.translationGroup))
    ).size,
    tags: mergedTags,
  };

  await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');

  // Print summary
  console.log('📊 Tags Analysis Summary\n');
  console.log(`Total unique tags: ${mergedTags.length}`);
  console.log(`Total stories analyzed: ${cacheData.totalStories}\n`);
  console.log('🏆 Top 20 Most Used Tags:\n');

  mergedTags.slice(0, 20).forEach((tag, index) => {
    const { ru, ua, en } = tag.translations;
    console.log(
      `${String(index + 1).padStart(2)}. [${tag.uniqueCount} posts] ${ru || ua || en}`
    );
    if (ru && ua && en && (ru !== ua || ru !== en)) {
      console.log(`    🇺🇦 ${ua}  🇬🇧 ${en}`);
    }
    if (tag.examples.length > 0) {
      const exampleTitles = tag.examples.map(e => `"${e.title}"`).join(', ');
      console.log(`    Examples: ${exampleTitles}`);
    }
    console.log('');
  });

  console.log(`\n✅ Cache file created: ${CACHE_FILE}`);
  console.log('\n💡 For Claude Code: Reference this file in your prompts:');
  console.log(`   "See available tags in ${CACHE_FILE}"\n`);
}

// Run
analyzeTags().catch(console.error);
