import { defaultLocale, locales } from "@/i18n/config";
import { getAllPosts, getAllTags, paginatePostsByTag, paginatePostsByType, POSTS_PER_PAGE } from "@/lib/blog";
import { POST_TYPES } from "@/lib/post-types";
import { SITE_URL } from "@/lib/seo";

export const prerender = true;

type ChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

function buildUrlEntry({
  loc,
  lastMod,
  changeFreq,
  priority,
}: {
  loc: string;
  lastMod: string;
  changeFreq: ChangeFreq;
  priority: number;
}) {
  return `<url><loc>${loc}</loc><lastmod>${lastMod}</lastmod><changefreq>${changeFreq}</changefreq><priority>${priority.toFixed(2)}</priority></url>`;
}

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

export function GET() {
  const now = new Date();
  const lastMod = now.toISOString();
  const entries: string[] = [];

  for (const locale of locales) {
    const prefix = locale === defaultLocale ? "" : `/${locale}`;
    const homeUrl = locale === defaultLocale ? `${SITE_URL}/` : `${SITE_URL}${prefix}/`;

    entries.push(
      buildUrlEntry({
        loc: homeUrl,
        lastMod,
        changeFreq: "monthly",
        priority: locale === defaultLocale ? 1 : 0.9,
      }),
    );

    const blogRoot = `${SITE_URL}${prefix}/blog/`;
    entries.push(
      buildUrlEntry({
        loc: blogRoot,
        lastMod,
        changeFreq: "weekly",
        priority: locale === defaultLocale ? 0.8 : 0.75,
      }),
    );

    const searchUrl = `${SITE_URL}${prefix}/search/`;
    entries.push(
      buildUrlEntry({
        loc: searchUrl,
        lastMod,
        changeFreq: "weekly",
        priority: locale === defaultLocale ? 0.75 : 0.7,
      }),
    );

    const posts = getAllPosts(locale);
    const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));

    for (let page = 2; page <= totalPages; page += 1) {
      entries.push(
        buildUrlEntry({
          loc: `${SITE_URL}${prefix}/blog/page/${page}/`,
          lastMod,
          changeFreq: "weekly",
          priority: 0.6,
        }),
      );
    }

    for (const post of posts) {
      const postPath = ensureTrailingSlash(post.url);
      entries.push(
        buildUrlEntry({
          loc: `${SITE_URL}${postPath}`,
          lastMod: new Date(post.updatedAt ?? post.publishedAt).toISOString(),
          changeFreq: "weekly",
          priority: 0.85,
        }),
      );
    }

    const tags = getAllTags(locale);
    for (const tag of tags) {
      const encoded = encodeURIComponent(tag);
      const baseTagUrl = `${SITE_URL}${prefix}/blog/tag/${encoded}/`;
      entries.push(
        buildUrlEntry({
          loc: baseTagUrl,
          lastMod,
          changeFreq: "weekly",
          priority: 0.7,
        }),
      );

      const tagPagination = paginatePostsByTag(locale, tag, 1);
      for (let page = 2; page <= tagPagination.totalPages; page += 1) {
        entries.push(
          buildUrlEntry({
            loc: `${SITE_URL}${prefix}/blog/tag/${encoded}/page/${page}/`,
            lastMod,
            changeFreq: "weekly",
            priority: 0.6,
          }),
        );
      }
    }

    for (const type of POST_TYPES) {
      const baseType = `${SITE_URL}${prefix}/blog/type/${type}/`;
      entries.push(
        buildUrlEntry({
          loc: baseType,
          lastMod,
          changeFreq: "weekly",
          priority: 0.65,
        }),
      );

      const typePagination = paginatePostsByType(locale, type, 1);
      for (let page = 2; page <= typePagination.totalPages; page += 1) {
        entries.push(
          buildUrlEntry({
            loc: `${SITE_URL}${prefix}/blog/type/${type}/page/${page}/`,
            lastMod,
            changeFreq: "weekly",
            priority: 0.55,
          }),
        );
      }
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "max-age=3600, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
