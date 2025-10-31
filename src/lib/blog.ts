import { getCollection, type CollectionEntry } from "astro:content";
import { locales, type Locale } from "@/i18n/config";
import { buildCanonicalUrl } from "@/lib/seo";
import {
  buildGithubArchiveUrl,
  buildPostJsonLd,
  cleanCardSnippet,
  createDescription,
  createPlainText,
  createSearchContent,
  extractFirstSentence,
  resolveLocaleFromSlug,
} from "@/lib/content-utils";

type PostCollectionEntry = CollectionEntry<"posts">;

export const POSTS_PER_PAGE = 20;

export type BlogPost = {
  slug: string;
  locale: Locale;
  collection: "articles" | "notes" | "stories";
  type: "note" | "article" | "story";
  title: string;
  description: string;
  canonical: string;
  archived: string;
  publishedAt: string;
  updatedAt?: string;
  publishedDate: Date;
  updatedDate: Date;
  tags: string[];
  author: string;
  authorUrl: string;
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

function resolveCollection(segment: string | undefined): "articles" | "notes" | "stories" {
  if (segment === "articles" || segment === "stories") {
    return segment;
  }
  return "notes";
}

function resolveType(collection: "articles" | "notes" | "stories", candidate: string | undefined): "article" | "note" | "story" {
  if (collection === "articles") return "article";
  if (collection === "stories") return "story";
  if (candidate === "article" || candidate === "story") {
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

  const rawBody = entry.body;
  const plainText = createPlainText(rawBody);
  const description = (entry.data.description ?? "").trim() || createDescription(plainText, 160);
  const summary = extractFirstSentence(plainText) || description;
  const cardSnippet = cleanCardSnippet(entry.data.cardSnippet);
  const translationGroup = (entry.data.translationGroup ?? "").trim() || fileSlug;

  const publishedDate = entry.data.publishedAt;
  const updatedDate = entry.data.updatedAt ?? entry.data.publishedAt;
  const publishedAtIso = publishedDate.toISOString();
  const updatedAtIso = updatedDate?.toISOString();

  const localizedPath = `/${locale}/blog/${fileSlug}`;
  const canonical = (entry.data.canonical ?? "").trim() || buildCanonicalUrl(locale, `/blog/${fileSlug}/`);
  const archived =
    (entry.data.archived ?? "").trim() || buildGithubArchiveUrl(`${locale}/${collection}/${fileSlug}.mdx`);

  const tags = Array.isArray(entry.data.tags) ? entry.data.tags.map((tag) => tag.trim()).filter(Boolean) : [];

  const jsonLd = buildPostJsonLd(
    {
      title: (entry.data.title ?? "").trim() || summary || fileSlug,
      type,
      description,
      canonical,
      archived,
      publishedAt: publishedAtIso,
      updatedAt: updatedAtIso,
      author: entry.data.author,
      authorUrl: entry.data.authorUrl,
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
    archived,
    publishedAt: publishedAtIso,
    updatedAt: updatedAtIso,
    publishedDate,
    updatedDate,
    tags,
    author: entry.data.author,
    authorUrl: entry.data.authorUrl,
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

export function getAllSlugs(locale: Locale): string[] {
  return getPostsByLocale(locale).map((post) => post.slug);
}

export function getAllTags(locale: Locale): string[] {
  const tags = tagsByLocale.get(locale);
  if (!tags) return [];
  return Array.from(tags.keys()).sort((a, b) => a.localeCompare(b, locale === "en" ? "en" : "ru"));
}

function computeTagScore(postTags: string[], referenceTags: string[]): number {
  if (postTags.length === 0 || referenceTags.length === 0) {
    return 0;
  }

  const referenceSet = new Set(referenceTags);
  let score = 0;

  for (let index = 0; index < referenceTags.length; index += 1) {
    const tag = referenceTags[index];
    if (postTags.includes(tag)) {
      score += index === 0 ? 2 : 1;
    }
  }

  if (score === 0) {
    return 0;
  }

  // Small bonus for shared tags beyond the first occurrences.
  let extras = 0;
  for (const tag of postTags) {
    if (referenceSet.has(tag)) {
      extras += 1;
    }
  }

  return score + extras * 0.1;
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

export function paginatePostsByType(
  locale: Locale,
  type: BlogPost["type"],
  page: number,
  pageSize = POSTS_PER_PAGE,
) {
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

export function getPostTranslation(
  locale: Locale,
  slug: string,
  targetLocale: Locale,
): BlogPost | undefined {
  return getPostTranslations(locale, slug).get(targetLocale);
}
