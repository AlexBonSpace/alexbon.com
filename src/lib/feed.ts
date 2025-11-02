import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxRenderer from "@astrojs/mdx/server.js";

import { contentByLocale } from "@/content";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { getPostsByLocale, type BlogPost } from "@/lib/blog";
import { getPostTypeLabel, buildPostTypePath } from "@/lib/post-types";
import { DEFAULT_POST_IMAGE, SITE_URL, buildCanonicalUrl, localeToBcp47 } from "@/lib/seo";

const FEED_ICON_URL = `${SITE_URL}/images/feed-icon.png`;

const LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/";
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
  const feedJsonUrl = `${SITE_URL}${prefix}/feed.json`;
  const feedXmlUrl = `${SITE_URL}${prefix}/feed.xml`;
  const homePageUrl = buildCanonicalUrl(locale, "/blog/");
  const language = localeToBcp47[locale] ?? locale;
  const title = getFeedTitle(locale);
  const description = contentByLocale[locale].metaDescription;

  return {
    feedJsonUrl,
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
  authors: Array<{ name: string; url?: string }>;
  license: string;
  image?: string;
  postType: BlogPost["type"];
  postTypeLabel: string;
  postTypePath: string;
  postTypeUrl: string;
};

export async function buildJsonFeed(locale: Locale) {
  const { feedJsonUrl, homePageUrl, language, title, description } = getFeedMetadata(locale);
  const items = await mapPostsToFeedItems(locale);

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title,
    home_page_url: homePageUrl,
    feed_url: feedJsonUrl,
    language,
    description,
    authors: [
      {
        name: "Alex Bon",
        url: SITE_URL,
      },
    ],
    icon: FEED_ICON_URL,
    favicon: `${SITE_URL}/favicon.ico`,
    items: items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      content_html: item.content_html,
      content_text: item.content_text,
      summary: item.summary,
      date_published: item.date_published,
      date_modified: item.date_modified,
      language: item.language,
      tags: item.tags,
      authors: item.authors,
      image: item.image,
      type: item.postType,
      _postType: item.postType,
      _postTypeLabel: item.postTypeLabel,
      _postTypePath: item.postTypePath,
      _postTypeUrl: item.postTypeUrl,
      attachments: item.image
        ? [
            {
              url: item.image,
              mime_type: "image/webp",
            },
          ]
        : undefined,
      _meta: {
        license: item.license,
        postType: item.postType,
        postTypeLabel: item.postTypeLabel,
        postTypeUrl: item.postTypeUrl,
      },
    })),
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate",
    },
  });
}

export async function buildRssFeed(locale: Locale) {
  const { feedXmlUrl, homePageUrl, language, title, description } = getFeedMetadata(locale);
  const items = await mapPostsToFeedItems(locale);

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
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate",
    },
  });
}

export function resolveFeedLocale(rawLocale?: string): Locale {
  if (!rawLocale) return defaultLocale;
  const resolved = resolveLocale(rawLocale);
  return resolved ?? defaultLocale;
}

async function mapPostsToFeedItems(locale: Locale): Promise<FeedItem[]> {
  const posts = getPostsByLocale(locale).slice(0, 30);
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

      const image = post.image?.trim() || undefined;

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
          {
            name: post.author,
            url: post.authorUrl || SITE_URL,
          },
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
