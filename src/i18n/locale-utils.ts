import { locales, type Locale } from "@/i18n/config";
import { buildLocalizedPath as buildLocalizedPathFromSeo } from "@/lib/seo";
export { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/lib/preferences";
export const LOCALE_HEADER = "x-user-locale";

const LANGUAGE_TO_LOCALE: Record<string, Locale> = {
  ua: "ua",
  uk: "ua",
  "uk-ua": "ua",
  "ua-ua": "ua",
  ru: "ru",
  "ru-ru": "ru",
  be: "ru",
  kz: "ru",
  en: "en",
  "en-us": "en",
  "en-gb": "en",
};

export function normalizeLocale(candidate: string | null | undefined): Locale | null {
  if (!candidate) {
    return null;
  }

  const normalized = candidate.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (locales.includes(normalized as Locale)) {
    return normalized as Locale;
  }

  const mapped = LANGUAGE_TO_LOCALE[normalized];
  return mapped ?? null;
}

export function detectLocaleFromHeaders(acceptLanguage: string | null | undefined): Locale | null {
  if (!acceptLanguage) {
    return null;
  }

  const entries = acceptLanguage
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  let bestMatch: { locale: Locale; quality: number } | null = null;

  for (const entry of entries) {
    const [language, qualityPart] = entry.split(";");
    const locale = normalizeLocale(language);
    if (!locale) {
      continue;
    }

    let quality = 1;
    if (qualityPart?.startsWith("q=")) {
      const parsed = Number.parseFloat(qualityPart.slice(2));
      if (!Number.isNaN(parsed)) {
        quality = parsed;
      }
    }

    if (!bestMatch || quality > bestMatch.quality) {
      bestMatch = { locale, quality };
    }
  }

  return bestMatch?.locale ?? null;
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }

  const candidate = normalizeLocale(segments[0]);
  return candidate ?? null;
}

export function buildLocalizedPath(pathname: string, locale: Locale): string {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  const segments = pathname.split("/").filter(Boolean);
  while (segments.length > 0 && normalizeLocale(segments[0]) !== null) {
    segments.shift();
  }

  const basePath = segments.length > 0 ? `/${segments.join("/")}` : "/";
  const localized = buildLocalizedPathFromSeo(locale, basePath);
  return localized.endsWith("/") ? localized : `${localized}/`;
}
