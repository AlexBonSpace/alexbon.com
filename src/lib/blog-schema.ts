import type { Locale } from "@/i18n/config";
import { contentByLocale } from "@/content";
import { DEFAULT_POST_IMAGE, SITE_URL, buildCanonicalUrl, buildLanguageAlternates, localeToBcp47 } from "@/lib/seo";
import type { BlogPost } from "@/lib/blog";
import { buildAuthorReference } from "@/lib/content-utils";

function normalizeHeroDescription(description: string | string[]): string {
  return Array.isArray(description) ? description.join(" ") : description;
}

const BLOG_LABEL_BY_LOCALE: Record<Locale, string> = {
  ua: "Відображення",
  ru: "Отражения",
  en: "Reflections",
};

const BLOG_TOPICS_BY_LOCALE: Record<Locale, string[]> = {
  ua: [
    "Карти внутрішнього світу: глибокі статті про психологію, усвідомленість і будову нашої свідомості.",
    "Історії-дзеркала. Художні оповідання та психологічні притчі в яких ти можеш впізнати себе.",
    "Іскри та проблиски. Короткі нотатки й афоризми, що допомагають побачити звичне по-новому.",
  ],
  ru: [
    "Карты внутреннего мира: глубокие статьи о психологии, осознанности и устройстве нашего сознания.",
    "Истории-зеркала. Художественные рассказы и психологические притчи в которых ты можешь узнать себя.",
    "Искры и проблески. Короткие заметки и афоризмы, которые помогают увидеть привычное по-новому.",
  ],
  en: [
    "Inner World Maps: in-depth essays on psychology, mindfulness, and how our mind works.",
    "Mirror stories. Literary tales and psychological parables in which you can recognize yourself.",
    "Sparks and glimmers. Short notes and aphorisms that help you see the familiar anew.",
  ],
};

function mapPostTypeToSchemaTypes(type: BlogPost["type"]) {
  if (type === "story") return ["BlogPosting", "ShortStory"] as const;
  if (type === "article") return ["BlogPosting", "Article"] as const;
  return ["BlogPosting", "SocialMediaPosting"] as const;
}

type BlogPreview = Pick<BlogPost, "url" | "title" | "type" | "tags" | "publishedAt" | "updatedAt" | "image">;

export function buildBlogCollectionJsonLd(locale: Locale, posts: BlogPreview[]) {
  const canonical = buildCanonicalUrl(locale, "/blog/");
  const inLanguage = localeToBcp47[locale] ?? locale;
  const hero = contentByLocale[locale].blog;
  const authorReference = buildAuthorReference(locale);
  const aboutTopics = BLOG_TOPICS_BY_LOCALE[locale]?.map((topic) => ({
    "@type": "Thing",
    name: topic,
  }));
  const postEntries = posts.slice(0, 12).map((post) => {
    const image = post.image ?? DEFAULT_POST_IMAGE;
    return {
      "@type": mapPostTypeToSchemaTypes(post.type),
      "@id": `${SITE_URL}${post.url}`,
      url: `${SITE_URL}${post.url}`,
      headline: post.title,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      keywords: post.tags,
      image,
      thumbnailUrl: image,
      author: authorReference,
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: hero.heroTitle,
    description: normalizeHeroDescription(hero.heroDescription),
    inLanguage,
    url: canonical,
    license: "https://creativecommons.org/licenses/by/4.0/",
    publisher: authorReference,
    creator: authorReference,
    ...(aboutTopics ? { about: aboutTopics } : {}),
    genre: BLOG_TOPICS_BY_LOCALE[locale][0],
    isAccessibleForFree: true,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    ...(postEntries.length > 0 ? { blogPost: postEntries } : {}),
  };
}

export function buildBlogBreadcrumbJsonLd(locale: Locale) {
  const homeName = locale === "en" ? "Home" : locale === "ua" ? "Головна" : "Главная";
  const homeUrl = buildCanonicalUrl(locale, "/");
  const blogUrl = buildCanonicalUrl(locale, "/blog/");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: homeName,
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: BLOG_LABEL_BY_LOCALE[locale],
        item: blogUrl,
      },
    ],
  };
}

export function getBlogIndexMetadata(locale: Locale, path = "/blog/") {
  const hero = contentByLocale[locale].blog;
  return {
    title: hero.heroTitle,
    description: normalizeHeroDescription(hero.heroDescription),
    canonical: buildCanonicalUrl(locale, path),
    alternates: buildLanguageAlternates(path),
    feeds: {
      rss: `${SITE_URL}/${locale}/feed.xml`,
      json: `${SITE_URL}/${locale}/feed-full.json`,
    },
  };
}

export function getBlogLabel(locale: Locale) {
  return BLOG_LABEL_BY_LOCALE[locale];
}
