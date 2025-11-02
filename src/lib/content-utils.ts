import { defaultLocale, locales, type Locale } from "@/i18n/config";
import {
  DEFAULT_POST_IMAGE,
  ABOUT_HERO_IMAGE,
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

const AUTHOR_DESCRIPTIONS: Record<Locale, string> = {
  ru: "Психолог и писатель, помогает распутывать клубки мыслей и чувств и создавать пространство для честного разговора.",
  ua: "Психолог і письменник, допомагає розплутувати клубок думок і почуттів та створювати простір для чесної розмови.",
  en: "Writer and psychologist tending a lighthouse of reflective stories so you can see your patterns and hear yourself.",
};

const AUTHOR_ALTERNATE_NAMES: Record<Locale, string[]> = {
  ru: ["Alex Bon", "Александр"],
  ua: ["Alex Bon"],
  en: ["Алекс Бон"],
};

const AUTHOR_LANGUAGES: Record<Locale, string[]> = {
  ru: ["ru", "uk"],
  ua: ["uk", "ru"],
  en: ["en", "ru", "uk"],
};

const AUTHOR_ADDRESS_LOCALITY: Record<Locale, string> = {
  ru: "Киев",
  ua: "Київ",
  en: "Kyiv",
};

const AUTHOR_SERVICE_OFFERS: Record<Locale, Array<Record<string, unknown>>> = {
  ru: [
    {
      "@type": "Service",
      name: "Встреча-знакомство",
      description:
        "Бесплатная 20-минутная онлайн встреча, чтобы познакомиться и понять, комфортно ли работать вместе.",
      serviceType: "Психологическая консультация",
      areaServed: "Worldwide",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Service",
      name: "Глубокая работа",
      description:
        "Регулярные индивидуальные онлайн-сессии для работы с конкретными ситуациями. На основе добровольного пожертвования.",
      serviceType: "Психологическая поддержка",
      areaServed: "Worldwide",
    },
  ],
  ua: [
    {
      "@type": "Service",
      name: "Зустріч-знайомство",
      description:
        "Безкоштовна 20-хвилинна онлайн зустріч, щоб познайомитися і зрозуміти, чи комфортно працювати разом.",
      serviceType: "Психологічна консультація",
      areaServed: "Worldwide",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Service",
      name: "Глибока робота",
      description:
        "Регулярні індивідуальні онлайн-сесії для роботи з конкретними ситуаціями. На основі добровільного внеску.",
      serviceType: "Психологічна підтримка",
      areaServed: "Worldwide",
    },
  ],
  en: [],
};

const AUTHOR_SUPPORT_OFFERS = {
  "@type": "OfferCatalog",
  name: "Ways to keep the light burning",
  itemListElement: [
    {
      "@type": "Offer",
      name: "Become a Reader",
      description: "Join the reader circle for free and receive stories as they are born.",
    },
    {
      "@type": "Offer",
      name: "Become a Patron",
      description: "Support to dedicate more time to writing and ensure this beam continues to shine.",
    },
    {
      "@type": "Offer",
      name: "Explore the Designs",
      description: "Carry a piece of this space with you.",
    },
  ],
};

const CONTACT_LINKS = [
  "https://t.me/alexbon_com",
  "https://wa.me/+380986552222",
  "viber://chat?number=+380986552222",
  "https://g.page/AlexBon?share",
];

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
  const aboutUrl = `${SITE_URL}/${locale}/about/`;
  const image = doc.image ?? DEFAULT_POST_IMAGE;
  const collectionUrl = `${SITE_URL}/${locale}/blog/`;
  const licenseUrl = doc.license.startsWith("http")
    ? doc.license
    : "https://creativecommons.org/licenses/by/4.0/";
  const inLanguage = localeToBcp47[locale] ?? locale;
  const aboutTags =
    doc.tags && doc.tags.length > 0
      ? doc.tags.map((tag) => ({
          "@type": "Thing",
          name: tag,
        }))
      : undefined;
  const authorReference = {
    "@type": "Person",
    "@id": aboutUrl,
  };
  const base = {
    "@context": "https://schema.org",
    "@id": doc.canonical,
    license: licenseUrl,
    author: authorReference,
    creator: authorReference,
    publisher: authorReference,
    copyrightHolder: authorReference,
    headline: doc.title,
    datePublished: doc.publishedAt,
    dateModified: doc.updatedAt ?? doc.publishedAt,
    keywords: doc.tags,
    inLanguage,
    url: doc.canonical,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
    },
    image,
    thumbnailUrl: image,
    isPartOf: {
      "@type": "Blog",
      "@id": collectionUrl,
    },
    isAccessibleForFree: true,
    ...(aboutTags ? { about: aboutTags } : {}),
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
        "@type": "Quotation",
        description: doc.description,
        text: doc.description,
        articleSection: NOTE_SECTION_BY_LOCALE[locale],
      };
  }
}

export function buildAuthorPersonJsonLd(locale: Locale) {
  const aboutUrl = `${SITE_URL}/${locale}/about/`;
  const description = AUTHOR_DESCRIPTIONS[locale];
  const alternateName = AUTHOR_ALTERNATE_NAMES[locale];
  const knowsLanguage = AUTHOR_LANGUAGES[locale];
  const jobTitle = PERSON_JOB_TITLES[locale] ?? PERSON_JOB_TITLES[defaultLocale];
  const knowsAbout = PERSON_KNOWS_ABOUT[locale] ?? PERSON_KNOWS_ABOUT[defaultLocale];
  const addressLocality = AUTHOR_ADDRESS_LOCALITY[locale];
  const sameAs = Array.from(
    new Set([
      ...CONTACT_LINKS,
      ...locales.map((currentLocale) => `${SITE_URL}/${currentLocale}/about/`),
    ]),
  );

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": aboutUrl,
    url: aboutUrl,
    inLanguage: localeToBcp47[locale] ?? locale,
    name: locale === "en" ? "Alex Bon" : "Алекс Бон",
    alternateName,
    description,
    jobTitle,
    image: ABOUT_HERO_IMAGE,
    knowsAbout,
    knowsLanguage,
    address: {
      "@type": "PostalAddress",
      addressLocality,
      addressCountry: "UA",
    },
    nationality: {
      "@type": "Country",
      name: locale === "en" ? "Ukraine" : locale === "ua" ? "Україна" : "Украина",
    },
    sameAs,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Personal consultation",
      availableLanguage: knowsLanguage,
      url: aboutUrl,
    },
  };

  if (locale === "en") {
    return {
      ...base,
      hasOfferCatalog: AUTHOR_SUPPORT_OFFERS,
    };
  }

  return {
    ...base,
    makesOffer: AUTHOR_SERVICE_OFFERS[locale],
  };
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
