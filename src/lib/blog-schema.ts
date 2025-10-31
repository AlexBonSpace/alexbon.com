import type { Locale } from "@/i18n/config";
import { contentByLocale } from "@/content";
import {
  DEFAULT_POST_IMAGE,
  PERSON_JOB_TITLES,
  PERSON_KNOWS_ABOUT,
  SITE_URL,
  buildCanonicalUrl,
  buildLanguageAlternates,
  localeToBcp47,
} from "@/lib/seo";
import type { BlogPost } from "@/lib/blog";
import { defaultLocale } from "@/i18n/config";

const BLOG_LABEL_BY_LOCALE: Record<Locale, string> = {
  ua: "Відображення",
  ru: "Отражения",
  en: "Reflections",
};

const BLOG_TOPICS_BY_LOCALE: Record<Locale, string[]> = {
  ua: [
    "Карти внутрішнього світу: глибокі статті про психологію, усвідомленість і будову нашої свідомості.",
    "Історії-дзеркала. Художні оповідання та психологічні притчі про зустріч із собою.",
    "Іскри та проблиски. Короткі нотатки й афоризми, що допомагають побачити звичне по-новому.",
  ],
  ru: [
    "Карты внутреннего мира: глубокие статьи о психологии, осознанности и устройстве нашего сознания.",
    "Истории-зеркала. Художественные рассказы и психологические притчи о встрече с собой.",
    "Искры и проблески. Короткие заметки и афоризмы, которые помогают увидеть привычное по-новому.",
  ],
  en: [
    "Inner World Maps: in-depth essays on psychology, mindfulness, and how our mind works.",
    "Mirror stories. Literary tales and psychological parables about meeting yourself.",
    "Sparks and glimmers. Short notes and aphorisms that help you see the familiar anew.",
  ],
};

const SOCIAL_PROFILES = ["https://www.facebook.com/mr.alexbon"];

function mapPostTypeToSchemaTypes(type: BlogPost["type"]) {
  if (type === "story") return ["BlogPosting", "ShortStory"] as const;
  if (type === "article") return ["BlogPosting", "Article"] as const;
  return ["BlogPosting", "SocialMediaPosting"] as const;
}

export function buildBlogCollectionJsonLd(locale: Locale, posts: BlogPost[]) {
  const canonical = buildCanonicalUrl(locale, "/blog/");
  const inLanguage = localeToBcp47[locale] ?? locale;
  const hero = contentByLocale[locale].blog;
  const aboutTopics = BLOG_TOPICS_BY_LOCALE[locale]?.map((topic) => ({
    "@type": "Thing",
    name: topic,
  }));
  const postEntries = posts.slice(0, 12).map((post) => {
    const image = post.image ?? DEFAULT_POST_IMAGE;
    const jobTitle = PERSON_JOB_TITLES[locale] ?? PERSON_JOB_TITLES[defaultLocale];
    const knowsAbout = PERSON_KNOWS_ABOUT[locale] ?? PERSON_KNOWS_ABOUT[defaultLocale];
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
      author: {
        "@type": "Person",
        name: post.author,
        url: post.authorUrl ?? SITE_URL,
        sameAs: SOCIAL_PROFILES,
        ...(jobTitle ? { jobTitle } : {}),
        ...(knowsAbout ? { knowsAbout } : {}),
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: hero.heroTitle,
    description: hero.heroDescription,
    inLanguage,
    url: canonical,
    license: "https://creativecommons.org/licenses/by/4.0/",
    publisher: {
      "@type": "Organization",
      name: "alexbon.com",
      url: SITE_URL,
      sameAs: SOCIAL_PROFILES,
    },
    creator: {
      "@type": "Person",
      name: "Алекс Бон",
      url: SITE_URL,
      sameAs: SOCIAL_PROFILES,
      jobTitle:
        locale === "en"
          ? "Psychologist and mindfulness guide"
          : locale === "ua"
            ? "Психолог і провідник усвідомленості"
            : "Психолог и проводник осознанности",
    },
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
    description: hero.heroDescription,
    canonical: buildCanonicalUrl(locale, path),
    alternates: buildLanguageAlternates(path),
    feeds: {
      rss: `${SITE_URL}/${locale}/feed.xml`,
      json: `${SITE_URL}/${locale}/feed.json`,
    },
  };
}

export function getBlogLabel(locale: Locale) {
  return BLOG_LABEL_BY_LOCALE[locale];
}
