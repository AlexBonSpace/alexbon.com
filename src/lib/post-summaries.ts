import type { Locale } from "@/i18n/config";
import summaries from "@/lib/.cache/post-summaries.json";
import { POSTS_PER_PAGE } from "@/lib/blog-constants";

export type PostSummary = {
  slug: string;
  locale: Locale;
  collection: "articles" | "notes" | "stories";
  type: "article" | "note" | "story";
  title: string;
  description: string;
  summary: string;
  cardSnippet: string;
  plainText: string;
  tags: string[];
  url: string;
  canonical: string;
  publishedAt: string;
  updatedAt: string;
  translationGroup: string;
  license?: string;
};

type Paginated<T> = {
  items: T[];
  page: number;
  totalCount: number;
  totalPages: number;
};

const summariesData = summaries as PostSummary[];

const postsByLocale = new Map<Locale, PostSummary[]>();
const tagsByLocale = new Map<Locale, Map<string, PostSummary[]>>();
const typesByLocale = new Map<Locale, Map<PostSummary["type"], PostSummary[]>>();
const summaryLookup = new Map<string, PostSummary>();

const summaryKey = (locale: Locale, slug: string) => `${locale}:${slug}`;

for (const summary of summariesData) {
  if (!postsByLocale.has(summary.locale)) {
    postsByLocale.set(summary.locale, []);
    tagsByLocale.set(summary.locale, new Map());
    typesByLocale.set(summary.locale, new Map());
  }
  postsByLocale.get(summary.locale)?.push(summary);
  summaryLookup.set(summaryKey(summary.locale, summary.slug), summary);

  for (const tag of summary.tags) {
    const localeTags = tagsByLocale.get(summary.locale)!;
    const bucket = localeTags.get(tag) ?? [];
    bucket.push(summary);
    localeTags.set(tag, bucket);
  }

  const localeTypes = typesByLocale.get(summary.locale)!;
  const typeBucket = localeTypes.get(summary.type) ?? [];
  typeBucket.push(summary);
  localeTypes.set(summary.type, typeBucket);
}

for (const [locale, list] of postsByLocale.entries()) {
  list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const localeTags = tagsByLocale.get(locale);
  if (localeTags) {
    for (const [, bucket] of localeTags) {
      bucket.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
  }
  const localeTypes = typesByLocale.get(locale);
  if (localeTypes) {
    for (const [, bucket] of localeTypes) {
      bucket.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }
  }
}

function paginate(collection: PostSummary[], page: number, pageSize = POSTS_PER_PAGE): Paginated<PostSummary> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: collection.slice(start, end),
    page,
    totalCount: collection.length,
    totalPages: Math.max(1, Math.ceil(collection.length / pageSize)),
  };
}

export function getSummariesByLocale(locale: Locale): PostSummary[] {
  return postsByLocale.get(locale) ?? [];
}

export function getSummaryByLocaleAndSlug(locale: Locale, slug: string): PostSummary | undefined {
  return summaryLookup.get(summaryKey(locale, slug));
}

export function paginateSummaries(locale: Locale, page: number, pageSize = POSTS_PER_PAGE) {
  return paginate(getSummariesByLocale(locale), page, pageSize);
}

export function getAllSummaryTags(locale: Locale): string[] {
  const tags = tagsByLocale.get(locale);
  if (!tags) return [];
  return Array.from(tags.keys()).sort((a, b) => a.localeCompare(b, locale === "en" ? "en" : "ru"));
}

export function getSummariesForTag(locale: Locale, tag: string): PostSummary[] {
  const tags = tagsByLocale.get(locale);
  if (!tags) return [];
  return tags.get(tag) ?? [];
}

export function paginateSummariesByTag(locale: Locale, tag: string, page: number, pageSize = POSTS_PER_PAGE) {
  return paginate(getSummariesForTag(locale, tag), page, pageSize);
}

export function getSummariesByType(locale: Locale, type: PostSummary["type"]): PostSummary[] {
  const types = typesByLocale.get(locale);
  if (!types) return [];
  return types.get(type) ?? [];
}

export function paginateSummariesByType(
  locale: Locale,
  type: PostSummary["type"],
  page: number,
  pageSize = POSTS_PER_PAGE,
) {
  return paginate(getSummariesByType(locale, type), page, pageSize);
}
