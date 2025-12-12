import { getCollection, type CollectionEntry } from "astro:content";
import { locales, type Locale } from "@/i18n/config";
import { buildCanonicalUrl, SITE_URL } from "@/lib/seo";
import {
  AUTHOR_DISPLAY_BY_LOCALE,
  AUTHOR_SAME_AS,
  buildPostJsonLd,
  cleanCardSnippet,
  createDescription,
  createPlainText,
  createSearchContent,
  extractFirstSentence,
  resolveLocaleFromSlug,
} from "@/lib/content-utils";
import { POSTS_PER_PAGE } from "@/lib/blog-constants";
import { getSummaryByLocaleAndSlug } from "@/lib/post-summaries";

type PostCollectionEntry = CollectionEntry<"posts">;

export type BlogPost = {
  slug: string;
  locale: Locale;
  collection: "articles" | "notes" | "stories" | "okno";
  type: "note" | "article" | "story" | "okno";
  title: string;
  description: string;
  canonical: string;
  publishedAt: string;
  updatedAt?: string;
  publishedDate: Date;
  updatedDate: Date;
  tags: string[];
  author: string;
  authorUrl: string;
  authorDisplay: Record<Locale, string>;
  authorSameAs: string[];
  license: string;
  cardSnippet: string;
  image?: string;
  translationGroup: string;
  body: string;
  render: PostCollectionEntry["render"];
  summary: string;
  plainText: string;
  searchContent: string;
  url: string;
  jsonLd: Record<string, unknown>;
};

const rawPosts = await getCollection("posts");
const CARD_SNIPPET_LIMIT = 350;

type PostType = "note" | "article" | "story" | "okno";

/**
 * Intelligently truncates text to a limit without cutting words mid-way
 *
 * Strategy:
 * 1. Normalize whitespace first (multiple spaces → single space)
 * 2. If text fits, return as-is
 * 3. Cut at last space before limit (if found past 50% mark)
 * 4. Otherwise, hard cut at limit (avoids super short results)
 *
 * Example: truncateToBoundary("Hello world from Alex", 15)
 * → "Hello world" (cuts at space, not "Hello world fr...")
 */
function truncateToBoundary(text: string, limit: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;

  const sliced = normalized.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  // Only cut at word boundary if it's past halfway point
  // (avoids cases like "Hello..." when limit is 50)
  if (lastSpace > Math.floor(limit * 0.5)) {
    return sliced.slice(0, lastSpace).trimEnd();
  }
  return sliced.trimEnd();
}

function ensureEllipsis(text: string): string {
  const trimmed = text.trimEnd();
  if (!trimmed) return "";
  if (/[.]{3}$/.test(trimmed) || trimmed.endsWith("…")) {
    return trimmed;
  }
  return `${trimmed}...`;
}

function buildCardSnippet(type: PostType, plainText: string, override?: string): string {
  const overrideValue = override?.trim();
  if (type === "note") {
    return overrideValue && overrideValue.length > 0 ? overrideValue : plainText;
  }

  if (overrideValue && overrideValue.length > 0) {
    return ensureEllipsis(overrideValue);
  }

  const auto = truncateToBoundary(plainText, CARD_SNIPPET_LIMIT);
  return ensureEllipsis(auto || plainText);
}

function resolveCollection(segment: string | undefined): "articles" | "notes" | "stories" | "okno" {
  if (segment === "articles" || segment === "stories" || segment === "okno") {
    return segment;
  }
  return "notes";
}

function resolveType(
  collection: "articles" | "notes" | "stories" | "okno",
  candidate: string | undefined,
): "article" | "note" | "story" | "okno" {
  if (collection === "articles") return "article";
  if (collection === "stories") return "story";
  if (collection === "okno") return "okno";
  if (candidate === "article" || candidate === "story" || candidate === "okno") {
    return candidate;
  }
  return "note";
}

const SOURCE_POSTS: BlogPost[] = rawPosts.map((entry): BlogPost => {
  const segments = entry.slug.split("/");
  const locale = resolveLocaleFromSlug(segments);
  const collection = resolveCollection(segments[1]);
  const fileSlug = segments[segments.length - 1] ?? entry.slug;
  const type = resolveType(collection, entry.data.type);
  const summaryMetadata = getSummaryByLocaleAndSlug(locale, fileSlug);

  const rawBody = entry.body;
  const plainText = createPlainText(rawBody);
  const description = (entry.data.description ?? "").trim() || createDescription(plainText, 160);
  const summary = extractFirstSentence(plainText) || description;
  const cardSnippetOverride = cleanCardSnippet(entry.data.cardSnippet);
  const cardSnippet = buildCardSnippet(type, plainText, cardSnippetOverride);
  const translationGroup = (entry.data.translationGroup ?? "").trim() || fileSlug;
  const authorDisplay = entry.data.authorDisplay ?? AUTHOR_DISPLAY_BY_LOCALE;
  const authorSameAs = Array.from(new Set([...(entry.data.authorSchema?.sameAs ?? []), ...AUTHOR_SAME_AS]));
  const rawAuthorUrl = (entry.data.authorUrl ?? "").trim();
  const authorUrl =
    rawAuthorUrl && rawAuthorUrl !== "https://alexbon.com" && rawAuthorUrl !== "https://alexbon.com/"
      ? rawAuthorUrl
      : `${SITE_URL}/${locale}/about/`;

  const publishedDate = entry.data.publishedAt;
  const summaryUpdatedDate = summaryMetadata?.updatedAt !== undefined ? new Date(summaryMetadata.updatedAt) : null;
  const normalizedSummaryUpdatedDate =
    summaryUpdatedDate && !Number.isNaN(summaryUpdatedDate.getTime()) ? summaryUpdatedDate : null;
  const updatedDate = entry.data.updatedAt ?? normalizedSummaryUpdatedDate ?? entry.data.publishedAt;
  const publishedAtIso = publishedDate.toISOString();
  const updatedAtIso = updatedDate?.toISOString();

  const localizedPath = `/${locale}/blog/${fileSlug}`;
  const canonical = (entry.data.canonical ?? "").trim() || buildCanonicalUrl(locale, `/blog/${fileSlug}/`);
  const tags = Array.isArray(entry.data.tags) ? entry.data.tags.map((tag) => tag.trim()).filter(Boolean) : [];

  const jsonLd = buildPostJsonLd(
    {
      title: (entry.data.title ?? "").trim() || summary || fileSlug,
      type,
      description,
      canonical,
      publishedAt: publishedAtIso,
      updatedAt: updatedAtIso,
      author: entry.data.author,
      authorUrl,
      authorDisplay,
      authorSameAs,
      license: entry.data.license,
      tags,
      image: entry.data.image?.trim() || undefined,
      collection,
    },
    fileSlug,
    locale,
  );

  return {
    slug: fileSlug,
    locale,
    collection,
    type,
    title: (entry.data.title ?? "").trim() || summary || fileSlug,
    description,
    canonical,
    publishedAt: publishedAtIso,
    updatedAt: updatedAtIso,
    publishedDate,
    updatedDate,
    tags,
    author: entry.data.author,
    authorUrl,
    authorDisplay,
    authorSameAs,
    license: entry.data.license,
    cardSnippet,
    image: entry.data.image?.trim() || undefined,
    translationGroup,
    body: rawBody,
    render: entry.render,
    summary,
    plainText,
    searchContent: createSearchContent(rawBody),
    url: localizedPath,
    jsonLd,
  };
});

const postsByLocale = new Map<Locale, BlogPost[]>();
const tagsByLocale = new Map<Locale, Map<string, BlogPost[]>>();
const typesByLocale = new Map<Locale, Map<BlogPost["type"], BlogPost[]>>();
const translationGroups = new Map<string, Map<Locale, BlogPost>>();
const translationLookupByLocale = new Map<Locale, Map<string, string>>();

for (const locale of locales) {
  postsByLocale.set(locale, []);
  tagsByLocale.set(locale, new Map());
  typesByLocale.set(locale, new Map());
  translationLookupByLocale.set(locale, new Map());
}

for (const post of SOURCE_POSTS) {
  const localePosts = postsByLocale.get(post.locale as Locale);
  const localeTags = tagsByLocale.get(post.locale as Locale);
  const localeTypes = typesByLocale.get(post.locale as Locale);
  const localeTranslationLookup = translationLookupByLocale.get(post.locale as Locale);

  if (!localePosts || !localeTags || !localeTypes || !localeTranslationLookup) {
    continue;
  }

  localePosts.push(post);
  localeTranslationLookup.set(post.slug, post.translationGroup);

  const groupKey = post.translationGroup;
  const translationBucket = translationGroups.get(groupKey) ?? new Map<Locale, BlogPost>();
  translationBucket.set(post.locale as Locale, post);
  translationGroups.set(groupKey, translationBucket);

  const typeBucket = localeTypes.get(post.type) ?? [];
  typeBucket.push(post);
  localeTypes.set(post.type, typeBucket);

  for (const tag of post.tags) {
    const bucket = localeTags.get(tag) ?? [];
    bucket.push(post);
    localeTags.set(tag, bucket);
  }
}

for (const locale of locales) {
  const localePosts = postsByLocale.get(locale);
  const localeTags = tagsByLocale.get(locale);
  const localeTypes = typesByLocale.get(locale);

  if (!localePosts || !localeTags || !localeTypes) continue;

  localePosts.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());

  for (const bucket of localeTags.values()) {
    bucket.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
  }

  for (const bucket of localeTypes.values()) {
    bucket.sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
  }
}

export function getPostsByLocale(locale: Locale): BlogPost[] {
  return postsByLocale.get(locale) ?? [];
}

export function getAllPosts(locale?: Locale): BlogPost[] {
  if (locale) {
    return getPostsByLocale(locale);
  }

  return locales
    .flatMap((item) => getPostsByLocale(item))
    .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime());
}

export function getPostBySlug(locale: Locale, slug: string): BlogPost | undefined {
  return getPostsByLocale(locale).find((post) => post.slug === slug);
}

export function findPostLocaleBySlug(slug: string): { locale: Locale; post: BlogPost } | undefined {
  for (const candidateLocale of locales) {
    const candidate = getPostBySlug(candidateLocale, slug);
    if (candidate) {
      return { locale: candidateLocale, post: candidate };
    }
  }
  return undefined;
}

export function getAllSlugs(locale: Locale): string[] {
  return getPostsByLocale(locale).map((post) => post.slug);
}

export function getAllTags(locale: Locale): string[] {
  const tags = tagsByLocale.get(locale);
  if (!tags) return [];
  return Array.from(tags.keys()).sort((a, b) => a.localeCompare(b, locale === "en" ? "en" : "ru"));
}

/**
 * Calculates relevance score between a post and reference tags
 * Used for "related posts" feature - shows posts with similar topics
 *
 * Scoring logic:
 * - First tag match = 2 points (most important/primary topic)
 * - Other tag matches = 1 point each
 * - Bonus: +0.1 per each shared tag (rewards more overlap)
 *
 * Example:
 * Post tags: ["psychology", "relationships", "growth"]
 * Reference: ["psychology", "growth"]
 * Score: 2 (first match) + 1 (growth) + 0.2 (2 shared) = 3.2
 */
function computeTagScore(postTags: string[], referenceTags: string[]): number {
  if (postTags.length === 0 || referenceTags.length === 0) {
    return 0;
  }

  const referenceSet = new Set(referenceTags);
  let score = 0;

  // Score each reference tag found in the post
  for (let index = 0; index < referenceTags.length; index += 1) {
    const tag = referenceTags[index];
    if (postTags.includes(tag)) {
      // First tag is worth more (it's the primary topic)
      score += index === 0 ? 2 : 1;
    }
  }

  if (score === 0) {
    return 0;
  }

  // Add small bonus for tag overlap (rewards posts with many shared tags)
  let extras = 0;
  for (const tag of postTags) {
    if (referenceSet.has(tag)) {
      extras += 1;
    }
  }

  return score + extras * 0.1;
}

/**
 * Finds related posts using intelligent tag matching with fallback
 *
 * Algorithm:
 * 1. Score all posts: +4 points per shared tag, +1 for same type
 * 2. Sort by score (highest first), then by date (newest first)
 * 3. If fewer than limit posts found, fill with recent posts of same type
 *
 * This ensures the "related posts" block is always populated with relevant content
 *
 * @param post - The current post to find related content for
 * @param limit - Maximum number of related posts to return (default: 4)
 * @returns Array of related posts, guaranteed to have up to `limit` items
 *
 * @example
 * const related = findRelatedPosts(currentPost, 4);
 * // Returns 4 posts: best tag matches first, fallback to recent posts of same type
 */
export function findRelatedPosts(post: BlogPost, limit = 4): BlogPost[] {
  const allPosts = getPostsByLocale(post.locale);

  // Score all posts by tag overlap and type match
  const scored = allPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = 0;

      // +4 points for each shared tag
      const sharedTags = post.tags.filter((tag) => candidate.tags.includes(tag));
      score += sharedTags.length * 4;

      // +1 point for same type (note/article/story)
      if (candidate.type === post.type) {
        score += 1;
      }

      return { post: candidate, score };
    })
    .sort((a, b) => {
      // Sort by score first (higher is better)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // For equal scores, prefer newer posts
      return b.post.publishedDate.getTime() - a.post.publishedDate.getTime();
    });

  // Take top matches
  const result = scored.slice(0, limit).map((item) => item.post);

  // Fallback: if we don't have enough posts, fill with recent posts of same type
  if (result.length < limit) {
    const needed = limit - result.length;
    const usedSlugs = new Set(result.map((p) => p.slug));

    const fallback = allPosts
      .filter(
        (candidate) => candidate.slug !== post.slug && candidate.type === post.type && !usedSlugs.has(candidate.slug),
      )
      .sort((a, b) => b.publishedDate.getTime() - a.publishedDate.getTime())
      .slice(0, needed);

    result.push(...fallback);
  }

  return result;
}

export function getPostsForTag(locale: Locale, tag: string, options?: { original?: BlogPost }): BlogPost[] {
  const tags = tagsByLocale.get(locale);
  if (!tags) return [];

  const posts = tags.get(tag) ?? [];
  if (!options?.original) {
    return posts;
  }

  const original = options.original;
  const referenceTags = original.tags;

  return [...posts]
    .filter((candidate) => candidate.slug !== original.slug)
    .sort((a, b) => {
      const scoreA = computeTagScore(a.tags, referenceTags);
      const scoreB = computeTagScore(b.tags, referenceTags);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return b.publishedDate.getTime() - a.publishedDate.getTime();
    });
}

export function getPostsByType(locale: Locale, type: BlogPost["type"]): BlogPost[] {
  const types = typesByLocale.get(locale);
  if (!types) return [];
  return types.get(type) ?? [];
}

export function paginatePosts(locale: Locale, page: number, pageSize = POSTS_PER_PAGE) {
  const posts = getPostsByLocale(locale);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = posts.slice(start, end);

  return {
    items,
    page,
    totalCount: posts.length,
    totalPages: Math.max(1, Math.ceil(posts.length / pageSize)),
  };
}

export function paginatePostsByTag(locale: Locale, tag: string, page: number, pageSize = POSTS_PER_PAGE) {
  const collection = getPostsForTag(locale, tag);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: collection.slice(start, end),
    page,
    totalCount: collection.length,
    totalPages: Math.max(1, Math.ceil((collection.length || 1) / pageSize)),
  };
}

export function paginatePostsByType(locale: Locale, type: BlogPost["type"], page: number, pageSize = POSTS_PER_PAGE) {
  const collection = getPostsByType(locale, type);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    items: collection.slice(start, end),
    page,
    totalCount: collection.length,
    totalPages: Math.max(1, Math.ceil((collection.length || 1) / pageSize)),
  };
}

export function buildBreadcrumbJsonLd(locale: Locale, post: BlogPost) {
  const siteUrl = "https://alexbon.com";
  const prefix = `/${locale}`;
  const postUrl = `${siteUrl}${prefix}/blog/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "en" ? "Home" : locale === "ua" ? "Головна" : "Главная",
        item: `${siteUrl}/${locale}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "en" ? "Reflections" : locale === "ua" ? "Відображення" : "Отражения",
        item: `${siteUrl}${prefix}/blog/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };
}

export function getPostTranslations(locale: Locale, slug: string): Map<Locale, BlogPost> {
  const localeLookup = translationLookupByLocale.get(locale);
  if (!localeLookup) {
    return new Map();
  }

  const groupKey = localeLookup.get(slug);
  if (!groupKey) {
    return new Map();
  }

  const group = translationGroups.get(groupKey);
  if (!group) {
    return new Map();
  }

  return new Map(group);
}

export function getPostTranslation(locale: Locale, slug: string, targetLocale: Locale): BlogPost | undefined {
  return getPostTranslations(locale, slug).get(targetLocale);
}
