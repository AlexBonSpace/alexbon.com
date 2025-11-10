import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxRenderer from "@astrojs/mdx/server.js";

import { contentByLocale } from "@/content";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { AUTHOR_DISPLAY_BY_LOCALE, AUTHOR_SAME_AS, createPlainText } from "@/lib/content-utils";
import { getPostsByLocale, type BlogPost } from "@/lib/blog";
import { getPostTypeLabel, buildPostTypePath } from "@/lib/post-types";
import { DEFAULT_POST_IMAGE, SITE_URL, buildCanonicalUrl, localeToBcp47 } from "@/lib/seo";
import { getSummariesByLocale, type PostSummary } from "@/lib/post-summaries";
import { FEED_FULL_PAGE_SIZE, FEED_FULL_REFRESH_DAYS } from "@/lib/feed-config";

const FEED_ICON_URL = `${SITE_URL}/images/feed-icon.png`;
const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
const FEED_FULL_META = {
  intendedAudience: "AI crawlers and search engines",
  note: "Plain-text archive sorted by last update. Start at feed-full.json, follow next_url for older entries, and prefer these files over crawling HTML.",
  crawlPolicy: {
    refresh: `P${FEED_FULL_REFRESH_DAYS}D`,
    preferredSurface: "feed-full*.json",
    instructions: "Fetch once per week unless notified; additional HTML crawling is unnecessary.",
  },
};

const ABOUT_TYPE_LABEL: Record<Locale, string> = {
  ua: "Про автора",
  ru: "Об авторе",
  en: "About",
};

const ABOUT_PAGE_TIMESTAMPS: Record<Locale, { published: string; modified: string }> = {
  ua: {
    published: "2024-01-01T00:00:00.000Z",
    modified: "2025-01-01T00:00:00.000Z",
  },
  ru: {
    published: "2024-01-01T00:00:00.000Z",
    modified: "2025-01-01T00:00:00.000Z",
  },
  en: {
    published: "2024-01-01T00:00:00.000Z",
    modified: "2025-01-01T00:00:00.000Z",
  },
};

type AstroContainerInstance = Awaited<ReturnType<typeof AstroContainer.create>>;
const feedContainerPromise: Promise<AstroContainerInstance> = AstroContainer.create().then((container) => {
  container.addServerRenderer({ renderer: mdxRenderer });
  return container;
});

function resolveLocale(locale: string): Locale | null {
  return locales.includes(locale as Locale) ? (locale as Locale) : null;
}

function getLocalePrefix(locale: Locale): string {
  return `/${locale}`;
}

function getFeedTitle(locale: Locale): string {
  return contentByLocale[locale].tagline;
}

function getFeedMetadata(locale: Locale) {
  const prefix = getLocalePrefix(locale);
  const feedJsonFullUrl = `${SITE_URL}${prefix}/feed-full.json`;
  const feedXmlUrl = `${SITE_URL}${prefix}/feed.xml`;
  const homePageUrl = buildCanonicalUrl(locale, "/blog/");
  const language = localeToBcp47[locale] ?? locale;
  const title = getFeedTitle(locale);
  const description = contentByLocale[locale].metaDescription;

  return {
    feedJsonFullUrl,
    feedXmlUrl,
    homePageUrl,
    language,
    title,
    description,
  };
}

type FeedItem = {
  id: string;
  url: string;
  guid: string;
  title: string;
  content_html: string;
  content_text: string;
  summary: string;
  language: string;
  date_published: string;
  date_modified: string;
  tags: string[];
  authors: FeedAuthor[];
  license: string;
  image?: string;
  postType: BlogPost["type"];
  postTypeLabel: string;
  postTypePath: string;
  postTypeUrl: string;
};

type FeedAuthor = {
  name: string;
  url?: string;
  _alexbon?: {
    authorDisplay: Record<Locale, string>;
    authorSchema?: {
      sameAs: string[];
    };
  };
};

type PlainFeedItem = {
  id: string;
  url: string;
  title: string;
  type: BlogPost["type"] | "about";
  collection: BlogPost["collection"] | "page";
  language: string;
  tags: string[];
  content_text: string;
  date_published: string;
  date_modified: string;
  image?: string;
  slug?: string;
  type_label?: string;
  type_url?: string;
  license?: string;
};

function getFeedFullPageUrl(locale: Locale, page: number) {
  const prefix = getLocalePrefix(locale);
  if (page <= 1) {
    return `${SITE_URL}${prefix}/feed-full.json`;
  }
  return `${SITE_URL}${prefix}/feed-full-page-${page}.json`;
}

export function getFullFeedPagination(locale: Locale) {
  const posts = getSummariesByLocale(locale);
  const aboutItem = buildAboutFeedItem(locale);
  const totalItems = posts.length + (aboutItem ? 1 : 0);
  const totalPages = Math.max(1, Math.ceil(totalItems / FEED_FULL_PAGE_SIZE));
  return { totalItems, totalPages };
}

export async function buildFullJsonFeed(locale: Locale, pageNumber = 1) {
  const { homePageUrl, language, title, description } = getFeedMetadata(locale);
  const allItems = getSortedPlainFeedItems(locale);
  const { totalItems, totalPages } = getFullFeedPagination(locale);
  const currentPage = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (currentPage - 1) * FEED_FULL_PAGE_SIZE;
  const end = start + FEED_FULL_PAGE_SIZE;
  const pageItems = allItems.slice(start, end);
  const feedUrl = getFeedFullPageUrl(locale, currentPage);
  const nextUrl = currentPage < totalPages ? getFeedFullPageUrl(locale, currentPage + 1) : undefined;
  const previousUrl = currentPage > 1 ? getFeedFullPageUrl(locale, currentPage - 1) : undefined;

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title,
    home_page_url: homePageUrl,
    feed_url: feedUrl,
    language,
    description,
    authors: [buildFeedAuthor(locale, { url: SITE_URL })],
    icon: FEED_ICON_URL,
    favicon: `${SITE_URL}/favicon.ico`,
    next_url: nextUrl,
    previous_url: previousUrl,
    _meta: {
      ...FEED_FULL_META,
      itemCount: pageItems.length,
      totalItems,
      page: currentPage,
      totalPages,
      pageSize: FEED_FULL_PAGE_SIZE,
    },
    items: pageItems,
  } as const;

  const payload = JSON.stringify(feed, null, 2);
  const sizeMB = new TextEncoder().encode(payload).length / (1024 * 1024);
  if (sizeMB > 90) {
    console.warn(`⚠️ Feed size ${sizeMB.toFixed(2)} MB approaching 100 MB limit.`);
  }

  return new Response(payload, {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}

export function resolveFeedLocale(rawLocale?: string): Locale {
  if (!rawLocale) return defaultLocale;
  const resolved = resolveLocale(rawLocale);
  return resolved ?? defaultLocale;
}

export async function buildRssFeed(locale: Locale) {
  const { feedXmlUrl, homePageUrl, language, title, description } = getFeedMetadata(locale);
  const items = await mapPostsToFeedItems(locale, 30);

  const rssItems = items
    .map((item) => {
      const pubDate = new Date(item.date_published).toUTCString();
      const updated = new Date(item.date_modified).toUTCString();
      const categories = item.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("");
      const author = item.authors[0];
      const descriptionCdata = escapeCdata(item.summary);
      const contentCdata = escapeCdata(item.content_html);
      const media =
        item.image !== undefined
          ? `<media:content url="${escapeXml(item.image)}" medium="image" />
  <enclosure url="${escapeXml(item.image)}" length="0" type="image/webp" />`
          : "";

      return `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${item.url}</link>
  <guid isPermaLink="true">${item.guid}</guid>
  <pubDate>${pubDate}</pubDate>
  <description><![CDATA[${descriptionCdata}]]></description>
  <dc:creator>${escapeXml(author?.name ?? "Alex Bon")}</dc:creator>
  <dc:language>${item.language}</dc:language>
  <content:encoded><![CDATA[${contentCdata}]]></content:encoded>
  <source url="${LICENSE_URL}">CC BY 4.0</source>
  ${categories}
  ${media}
</item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${homePageUrl}</link>
    <atom:link href="${feedXmlUrl}" rel="self" type="application/rss+xml" />
    <language>${language}</language>
    <description>${escapeXml(description)}</description>
    <copyright>CC BY 4.0</copyright>
    <managingEditor>contact@alexbon.com (Alex Bon)</managingEditor>
    <webMaster>contact@alexbon.com (Alex Bon)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>alexbon.com feed builder</generator>
    <image>
      <url>${FEED_ICON_URL}</url>
      <title>${escapeXml(title)}</title>
      <link>${homePageUrl}</link>
    </image>
    ${rssItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=300",
    },
  });
}

async function mapPostsToFeedItems(locale: Locale, limit: number): Promise<FeedItem[]> {
  const posts = getPostsByLocale(locale).slice(0, limit);
  const container = await feedContainerPromise;

  return Promise.all(
    posts.map(async (post) => {
      const canonicalUrl = ensureAbsoluteUrl(post.canonical || `${SITE_URL}${post.url}`);
      const typePath = buildPostTypePath(locale, post.type);
      const typeUrl = ensureAbsoluteUrl(typePath);
      const postLanguage = localeToBcp47[post.locale as Locale] ?? post.locale;
      const renderResult = await post.render();
      const contentHtml = await renderPostHtml(container, renderResult);
      const normalizedHtml = absolutizeRelativeUrls(contentHtml);
      const summary = post.summary || post.description || truncatePlainText(post.plainText, 280);

      const image = post.image?.trim() || DEFAULT_POST_IMAGE;

      return {
        id: canonicalUrl,
        url: canonicalUrl,
        guid: canonicalUrl,
        title: post.title,
        content_html: normalizedHtml,
        content_text: post.plainText || post.searchContent || "",
        summary,
        language: postLanguage,
        date_published: post.publishedAt,
        date_modified: post.updatedAt ?? post.publishedAt,
        tags: post.tags,
        authors: [
          buildFeedAuthor(post.locale as Locale, {
            url: post.authorUrl || SITE_URL,
            display: post.authorDisplay,
            sameAs: post.authorSameAs,
            fallbackName: post.author,
          }),
        ],
        license: post.license || LICENSE_URL,
        image,
        postType: post.type,
        postTypeLabel: getPostTypeLabel(locale, post.type),
        postTypePath: typePath,
        postTypeUrl: typeUrl,
      };
    }),
  );
}

function getSortedPlainFeedItems(locale: Locale): PlainFeedItem[] {
  const posts = getSummariesByLocale(locale);
  const postItems = posts.map((post) => mapSummaryToPlainFeedItem(locale, post));
  const aboutItem = buildAboutFeedItem(locale);
  const combined = aboutItem ? [...postItems, aboutItem] : postItems;
  return combined.sort(sortByLastModifiedDesc);
}

function mapSummaryToPlainFeedItem(locale: Locale, post: PostSummary): PlainFeedItem {
  const canonicalUrl = ensureAbsoluteUrl(post.canonical || `${SITE_URL}${post.url}`);
  const postLanguage = localeToBcp47[post.locale as Locale] ?? post.locale;
  const typePath = buildPostTypePath(locale, post.type);
  const typeUrl = ensureAbsoluteUrl(typePath);
  const contentText = post.plainTextFull || post.plainText || "";
  const license = post.license?.trim() || LICENSE_URL;

  return {
    id: canonicalUrl,
    url: canonicalUrl,
    title: post.title,
    type: post.type,
    collection: post.collection,
    language: postLanguage,
    tags: post.tags,
    content_text: contentText,
    date_published: post.publishedAt,
    date_modified: post.updatedAt ?? post.publishedAt,
    image: post.image?.trim(),
    slug: post.slug,
    type_label: getPostTypeLabel(locale, post.type),
    type_url: typeUrl,
    license,
  };
}

function buildAboutFeedItem(locale: Locale): PlainFeedItem | null {
  const content = contentByLocale[locale];
  if (!content) return null;

  const canonical = buildCanonicalUrl(locale, "/about/");
  const language = localeToBcp47[locale] ?? locale;
  const timestamps = ABOUT_PAGE_TIMESTAMPS[locale] ?? ABOUT_PAGE_TIMESTAMPS[defaultLocale];
  const contentText = buildAboutContentText(locale);

  return {
    id: canonical,
    url: canonical,
    title: content.metaTitle || content.brandName,
    type: "about",
    collection: "page",
    language,
    tags: [],
    content_text: contentText,
    date_published: timestamps.published,
    date_modified: timestamps.modified,
    slug: "about",
    type_label: ABOUT_TYPE_LABEL[locale],
    type_url: canonical,
    license: LICENSE_URL,
  };
}

function buildAboutContentText(locale: Locale): string {
  const content = contentByLocale[locale];
  const segments: string[] = [];

  const push = (value?: string | null) => {
    if (!value) return;
    const trimmed = value.trim();
    if (trimmed) {
      segments.push(trimmed);
    }
  };

  const pushMany = (values?: string[]) => {
    if (!values) return;
    for (const value of values) {
      push(value);
    }
  };

  push(content.hero.title);
  pushMany(content.hero.paragraphs);

  push(content.introduction.heading);
  pushMany(content.introduction.paragraphs);
  if (content.introduction.bulletList) {
    pushMany(content.introduction.bulletList.items);
  }
  if (content.introduction.highlight) {
    push(content.introduction.highlight.title);
    pushMany(content.introduction.highlight.paragraphs);
  }

  push(content.process.heading);
  push(content.process.intro);
  for (const step of content.process.steps) {
    push(step.title);
    push(step.description);
  }

  push(content.details.heading);
  for (const item of content.details.items) {
    push(`${item.title}. ${item.description}`);
  }

  push(content.story.heading);
  pushMany(content.story.paragraphs);

  if (content.lighthouse) {
    push(content.lighthouse.heading);
    pushMany(content.lighthouse.paragraphs);
    for (const bullet of content.lighthouse.bullets) {
      if (typeof bullet === "string") {
        push(bullet);
      } else {
        push(`${bullet.label}${bullet.description ? ` ${bullet.description}` : ""}`);
      }
    }
    push(content.lighthouse.closing);
  }

  if (content.door) {
    push(content.door.heading);
    pushMany(content.door.paragraphs);
    if (content.door.cta) {
      push(content.door.cta.text);
      for (const contact of content.door.cta.contacts) {
        push(`${contact.label}: ${contact.href}`);
      }
    }
  }

  push(content.faq.heading);
  for (const item of content.faq.items) {
    push(item.question);
    push(item.answer);
  }

  push(content.invitation.heading);
  push(content.invitation.body);
  for (const button of content.invitation.buttons) {
    push(`${button.label}: ${button.href}`);
  }

  push(content.testimonials.heading);
  if (content.testimonials.intro) {
    push(content.testimonials.intro);
  }
  pushMany(content.testimonials.items);
  if (content.testimonials.cta) {
    push(content.testimonials.cta.text);
    push(`${content.testimonials.cta.button.label}: ${content.testimonials.cta.button.href}`);
  }

  push(content.footerNote);
  push(content.tagline);

  return createPlainText(segments.join("\n\n"));
}

async function renderPostHtml(container: AstroContainerInstance, renderResult: Awaited<ReturnType<BlogPost["render"]>>) {
  const { Content } = renderResult;
  return container.renderToString(Content, { routeType: "page" });
}

function absolutizeRelativeUrls(html: string): string {
  let transformed = html.replace(/(href|src|poster)="\/(?!\/)([^"]*)"/g, (_, attr: string, path: string) => {
    const absolute = new URL(path, SITE_URL).toString();
    return `${attr}="${absolute}"`;
  });

  transformed = transformed.replace(/srcset="([^"]*)"/g, (_, srcset: string) => {
    const rewritten = srcset
      .split(",")
      .map((entry) => {
        const trimmed = entry.trim();
        if (!trimmed) return trimmed;
        const [url, descriptor] = trimmed.split(/\s+/, 2);
        if (!url || !url.startsWith("/")) return trimmed;
        const absolute = new URL(url, SITE_URL).toString();
        return descriptor ? `${absolute} ${descriptor}` : absolute;
      })
      .join(", ");
    return `srcset="${rewritten}"`;
  });

  return transformed;
}

function truncatePlainText(text: string, length: number) {
  if (!text) return "";
  if (text.length <= length) return text;
  const cutoff = Math.max(0, length - 3);
  return `${text.slice(0, cutoff).trimEnd()}...`;
}

function ensureAbsoluteUrl(candidate: string) {
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return new URL(candidate.startsWith("/") ? candidate : `/${candidate}`, SITE_URL).toString();
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeCdata(value: string) {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function buildFeedAuthor(
  locale: Locale,
  options: {
    url?: string;
    display?: Record<Locale, string>;
    sameAs?: string[];
    fallbackName?: string;
  } = {},
): FeedAuthor {
  const displayMap = options.display ?? AUTHOR_DISPLAY_BY_LOCALE;
  const authorDisplay = Object.fromEntries(
    locales.map((candidateLocale) => [
      candidateLocale,
      displayMap[candidateLocale] ?? AUTHOR_DISPLAY_BY_LOCALE[candidateLocale] ?? AUTHOR_DISPLAY_BY_LOCALE[defaultLocale],
    ]),
  ) as Record<Locale, string>;

  const localizedName =
    [
      authorDisplay[locale],
      authorDisplay[defaultLocale],
      options.fallbackName,
      AUTHOR_DISPLAY_BY_LOCALE[locale],
      AUTHOR_DISPLAY_BY_LOCALE[defaultLocale],
      "Alex Bon",
    ].find((value): value is string => typeof value === "string" && value.length > 0) ?? "Alex Bon";

  const sameAs = options.sameAs ?? Array.from(AUTHOR_SAME_AS);

  const author: FeedAuthor = {
    name: localizedName,
    url: options.url ?? SITE_URL,
    _alexbon: {
      authorDisplay,
    },
  };

  const normalizedSameAs = Array.from(new Set(sameAs.filter((value) => typeof value === "string" && value.length > 0)));
  if (normalizedSameAs.length > 0) {
    author._alexbon ??= { authorDisplay };
    author._alexbon.authorSchema = {
      sameAs: normalizedSameAs,
    };
  }

  return author;
}

function sortByLastModifiedDesc(a: PlainFeedItem, b: PlainFeedItem) {
  const aTime = new Date(a.date_modified || a.date_published).getTime();
  const bTime = new Date(b.date_modified || b.date_published).getTime();
  if (aTime !== bTime) {
    return bTime - aTime;
  }
  const aPublished = new Date(a.date_published).getTime();
  const bPublished = new Date(b.date_published).getTime();
  if (aPublished !== bPublished) {
    return bPublished - aPublished;
  }
  return (a.slug ?? a.url).localeCompare(b.slug ?? b.url);
}
