import { defaultLocale, locales, type Locale } from "@/i18n/config";

export const SITE_URL = "https://www.alexbon.com";

export const localeToHreflang: Record<Locale, string> = {
  ua: "uk-UA",
  ru: "ru-RU",
  en: "en",
};

export const hreflangToLocale: Record<string, Locale> = Object.fromEntries(
  Object.entries(localeToHreflang).map(([locale, hreflang]) => [hreflang, locale as Locale]),
) as Record<string, Locale>;

export const localeToBcp47: Record<Locale, string> = {
  ua: "uk",
  ru: "ru",
  en: "en",
};

export const ABOUT_HERO_IMAGE = `${SITE_URL}/images/about-portrait-hero.webp`;
export const DEFAULT_POST_IMAGE = `${SITE_URL}/images/reflection.webp`;

export const PERSON_JOB_TITLES: Record<Locale, string[]> = {
  ua: ["Психолог", "Лайф-коуч", "Експерт з усвідомленості та медитації"],
  ru: ["Психолог", "Лайф-коуч", "Эксперт по осознанности и медитации"],
  en: ["Psychologist", "Life coach", "Mindfulness and meditation expert"],
};

export const PERSON_KNOWS_ABOUT: Record<Locale, string[]> = {
  ua: ["Психологія", "Лайф-коучинг", "Усвідомленість", "Медитація", "Особистісний розвиток"],
  ru: ["Психология", "Лайф-коучинг", "Осознанность", "Медитация", "Саморазвитие"],
  en: ["Psychology", "Life coaching", "Mindfulness", "Meditation", "Personal growth"],
};

function normalizePath(path: string): string {
  if (!path || path === "/") {
    return "/";
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildLocalizedPath(locale: Locale, path: string): string {
  const normalized = normalizePath(path);
  if (normalized === "/") {
    return `/${locale}/`;
  }
  return `/${locale}${normalized}`;
}

export function buildCanonicalUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${buildLocalizedPath(locale, path)}`;
}

export function buildLanguageAlternates(
  pathOrMap: string | Partial<Record<Locale, string>>,
  options: { locales?: Locale[] } = {},
): Record<string, string> {
  const allowedLocales =
    options.locales && options.locales.length > 0
      ? options.locales.filter((locale): locale is Locale => locales.includes(locale))
      : locales.slice();

  const uniqueLocales = Array.from(new Set(allowedLocales));
  const languages: Record<string, string> = {};

  for (const locale of uniqueLocales) {
    const candidatePath = typeof pathOrMap === "string" ? pathOrMap : pathOrMap[locale];
    if (!candidatePath) {
      continue;
    }
    const normalized = normalizePath(candidatePath);
    const hreflang = localeToHreflang[locale];
    if (!hreflang) continue;
    languages[hreflang] = `${SITE_URL}${buildLocalizedPath(locale, normalized)}`;
  }

  const resolveDefaultLocale = () => {
    if (typeof pathOrMap === "string") {
      return defaultLocale;
    }

    if (pathOrMap[defaultLocale]) {
      return defaultLocale;
    }

    return uniqueLocales.find((candidate) => Boolean(pathOrMap[candidate]));
  };

  const defaultLocaleForX = resolveDefaultLocale();
  if (defaultLocaleForX) {
    const defaultPath =
      typeof pathOrMap === "string"
        ? pathOrMap
        : pathOrMap[defaultLocaleForX] ?? "/";
    languages["x-default"] = `${SITE_URL}${buildLocalizedPath(
      defaultLocaleForX,
      normalizePath(defaultPath),
    )}`;
  }

  return languages;
}
