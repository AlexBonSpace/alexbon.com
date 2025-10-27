import { getCollection, type CollectionEntry } from "astro:content";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { buildCanonicalUrl } from "@/lib/seo";
import {
  buildGithubArchiveUrl,
  buildPageJsonLd,
  cleanCardSnippet,
  createPlainText,
  createDescription,
  resolveLocaleFromSlug,
} from "@/lib/content-utils";

type PageEntry = CollectionEntry<"pages">;

export type SitePage = {
  slug: string;
  locale: Locale;
  title: string;
  description: string;
  canonical: string;
  archived: string;
  author: string;
  authorUrl: string;
  license: string;
  cardSnippet: string;
  body: string;
  render: PageEntry["render"];
  plainText: string;
  url: string;
  translationGroup: string;
  jsonLd: Record<string, unknown>;
};

const rawPages = await getCollection("pages");

const pagesByLocale = new Map<Locale, Map<string, SitePage>>();
const translationGroups = new Map<string, Map<Locale, SitePage>>();

for (const locale of locales) {
  pagesByLocale.set(locale, new Map());
}

rawPages.forEach((entry) => {
  const segments = entry.slug.split("/");
  const locale = resolveLocaleFromSlug(segments);
  const fileSlug = segments[segments.length - 1] ?? entry.slug;
  const translationGroup = fileSlug;
  const plainText = createPlainText(entry.body);
  const description = (entry.data.description ?? "").trim() || createDescription(plainText, 160);
  const canonical =
    (entry.data.canonical ?? "").trim() ||
    buildCanonicalUrl(locale, `/${fileSlug}/`);
  const archived =
    (entry.data.archived ?? "").trim() ||
    buildGithubArchiveUrl(`${locale}/pages/${fileSlug}.mdx`);
  const url =
    locale === defaultLocale ? `/${fileSlug}/` : `/${locale}/${fileSlug}/`;

  const page: SitePage = {
    slug: fileSlug,
    locale,
    title: (entry.data.title ?? "").trim() || fileSlug,
    description,
    canonical,
    archived,
    author: entry.data.author,
    authorUrl: entry.data.authorUrl,
    license: entry.data.license,
    cardSnippet: cleanCardSnippet(entry.data.cardSnippet),
    body: entry.body,
    render: entry.render,
    plainText,
    url,
    translationGroup,
    jsonLd: buildPageJsonLd(
      {
        title: (entry.data.title ?? "").trim() || fileSlug,
        description,
        canonical,
        archived,
        author: entry.data.author,
        authorUrl: entry.data.authorUrl,
        license: entry.data.license,
      },
      fileSlug,
      locale,
    ),
  };

  pagesByLocale.get(locale)?.set(fileSlug, page);

  const group = translationGroups.get(translationGroup) ?? new Map<Locale, SitePage>();
  group.set(locale, page);
  translationGroups.set(translationGroup, group);
});

export function getPage(locale: Locale, slug: string): SitePage | undefined {
  return pagesByLocale.get(locale)?.get(slug);
}

export function getPageTranslations(locale: Locale, slug: string): Map<Locale, SitePage> {
  const groupKey = pagesByLocale.get(locale)?.get(slug)?.translationGroup ?? slug;
  return translationGroups.get(groupKey) ?? new Map();
}
