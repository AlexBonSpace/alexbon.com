import { defaultLocale, locales, type Locale } from "@/i18n/config";
import {
  DEFAULT_POST_IMAGE,
  PERSON_JOB_TITLES,
  PERSON_KNOWS_ABOUT,
  SITE_URL,
  localeToBcp47,
} from "@/lib/seo";

const ARTICLE_SECTION_BY_LOCALE: Record<Locale, string> = {
  ua: "Карти внутрішнього світу: глибокі статті про психологію, усвідомленість і будову нашої свідомості.",
  ru: "Карты внутреннего мира: глубокие статьи о психологии, осознанности и устройстве нашего сознания.",
  en: "Inner World Maps: in-depth essays on psychology, mindfulness, and how our mind works.",
};

const NOTE_SECTION_BY_LOCALE: Record<Locale, string> = {
  ua: "Іскри та проблиски. Короткі нотатки й афоризми, що допомагають побачити звичне по-новому.",
  ru: "Искры и проблески. Короткие заметки и афоризмы, которые помогают увидеть привычное по-новому.",
  en: "Sparks and glimmers. Short notes and aphorisms that help you see the familiar anew.",
};

const STORY_GENRES_BY_LOCALE: Record<Locale, string[]> = {
  ua: ["Історії-дзеркала. Художні оповідання та психологічні притчі про зустріч із собою."],
  ru: ["Истории-зеркала. Художественные рассказы и психологические притчи о встрече с собой."],
  en: ["Mirror stories. Literary tales and psychological parables about meeting yourself."],
};

export function createPlainText(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`+/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_~>#]+/g, " ")
    .replace(/-{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createDescription(text: string, limit: number): string {
  if (!text) return "";
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit - 3).trimEnd()}...`;
}

export function extractFirstSentence(text: string): string {
  if (!text) return "";
  const sentenceMatch = text.match(/(.+?[.!?])(\s|$)/);
  return sentenceMatch ? sentenceMatch[1].trim() : text.trim();
}

export function cleanCardSnippet(snippet?: string): string {
  if (!snippet) return "";
  return snippet
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function createSearchContent(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[`*_>#]/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

export function buildPostJsonLd(
  doc: {
    title: string;
    type: "note" | "article" | "story";
    description: string;
    canonical: string;
    publishedAt: string;
    updatedAt?: string;
    author: string;
    authorUrl: string;
    license: string;
    tags: string[];
    image?: string;
    collection: "articles" | "notes" | "stories";
  },
  slug: string,
  locale: Locale,
) {
  const path = `/${locale}/blog/${slug}`;
  const image = doc.image ?? DEFAULT_POST_IMAGE;
  const collectionUrl = `${SITE_URL}/${locale}/blog/`;
  const licenseUrl = doc.license.startsWith("http")
    ? doc.license
    : "https://creativecommons.org/licenses/by/4.0/";
  const base = {
    "@context": "https://schema.org",
    license: licenseUrl,
    author: {
      "@type": "Person",
      name: doc.author,
      url: doc.authorUrl,
      sameAs: ["https://www.facebook.com/mr.alexbon"],
      jobTitle: PERSON_JOB_TITLES[locale],
      knowsAbout: PERSON_KNOWS_ABOUT[locale],
    },
    publisher: {
      "@type": "Organization",
      name: "alexbon.com",
      url: SITE_URL,
      sameAs: ["https://www.facebook.com/mr.alexbon"],
    },
    headline: doc.title,
    datePublished: doc.publishedAt,
    dateModified: doc.updatedAt ?? doc.publishedAt,
    keywords: doc.tags,
    inLanguage: localeToBcp47[locale] ?? locale,
    url: doc.canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
    image,
    thumbnailUrl: image,
    isPartOf: collectionUrl,
  };

  switch (doc.type) {
    case "article":
      return {
        ...base,
        "@type": "Article",
        description: doc.description,
        articleSection: ARTICLE_SECTION_BY_LOCALE[locale],
      };
    case "story":
      return {
        ...base,
        "@type": "ShortStory",
        description: doc.description,
        genre: STORY_GENRES_BY_LOCALE[locale],
        isFamilyFriendly: true,
      };
    default:
      return {
        ...base,
        "@type": "SocialMediaPosting",
        description: doc.description,
        articleSection: NOTE_SECTION_BY_LOCALE[locale],
      };
  }
}

export function resolveLocaleFromSlug(slugSegments: string[]): Locale {
  const localeCandidate = slugSegments[0];
  if (localeCandidate && locales.includes(localeCandidate as Locale)) {
    return localeCandidate as Locale;
  }
  return defaultLocale;
}

export function buildPageJsonLd(
  doc: {
    title: string;
    description: string;
    canonical: string;
    author: string;
    authorUrl: string;
    license: string;
  },
  slug: string,
  locale: Locale,
) {
  const path = `/${locale}/${slug}`;
  const licenseUrl = doc.license.startsWith("http")
    ? doc.license
    : "https://creativecommons.org/licenses/by/4.0/";

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: doc.title,
    description: doc.description,
    url: doc.canonical,
    inLanguage: localeToBcp47[locale] ?? locale,
    license: licenseUrl,
    author: {
      "@type": "Person",
      name: doc.author,
      url: doc.authorUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
  };
}
