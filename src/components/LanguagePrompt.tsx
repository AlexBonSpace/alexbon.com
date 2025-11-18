"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocale } from "@/contexts/i18n-context";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { buildLocalizedPath, normalizeLocale, LOCALE_COOKIE } from "@/i18n/locale-utils";
import { persistLocalePreference } from "@/i18n/client";

const FALLBACK_LOCALE: Locale = "en";

type SuggestionCopy = {
  message: string;
  acceptLabel: string;
  alternativesLabel: string;
};

const SUGGESTION_COPY: Partial<Record<Locale, SuggestionCopy>> = {
  ru: {
    message: "Похоже, ваш браузер на русском. Перейти на русскую версию сайта?",
    acceptLabel: "Да",
    alternativesLabel: "Нет, выбрать другую версию:",
  },
  en: {
    message: "An English version is available. Switch to the English site?",
    acceptLabel: "Yes",
    alternativesLabel: "No, choose another language:",
  },
};

function mapLanguageToLocale(language: string | undefined): Locale | null {
  if (!language) {
    return null;
  }

  const normalized = language.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const [primary] = normalized.split("-");
  return normalizeLocale(normalized) ?? normalizeLocale(primary) ?? null;
}

type LanguagePromptProps = {
  currentPath: string;
  currentSearch?: string;
  alternatePaths?: Partial<Record<Locale, string>>;
};

export function LanguagePrompt({ currentPath, currentSearch = "", alternatePaths }: LanguagePromptProps) {
  const providerLocale = useLocale();
  const [suggestedLocale, setSuggestedLocale] = useState<Locale | null>(null);

  const searchPart = currentSearch.startsWith("?") ? currentSearch : currentSearch ? `?${currentSearch}` : "";

  const currentLocale = useMemo(() => {
    if (providerLocale !== defaultLocale) {
      return providerLocale;
    }

    const normalized = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
    const segments = normalized.split("/").filter(Boolean);
    const maybeLocale = segments[0];

    if (maybeLocale && locales.includes(maybeLocale as Locale)) {
      return maybeLocale as Locale;
    }

    return providerLocale;
  }, [providerLocale, currentPath]);

  const copy = useMemo(() => {
    if (!suggestedLocale || suggestedLocale === defaultLocale) {
      return null;
    }
    return SUGGESTION_COPY[suggestedLocale] ?? null;
  }, [suggestedLocale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const readStoredLocale = () => {
      try {
        const stored = window.localStorage.getItem(LOCALE_COOKIE);
        const normalized = normalizeLocale(stored);
        if (normalized && locales.includes(normalized)) {
          return normalized;
        }
      } catch {
        /* noop */
      }

      const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
      if (match) {
        const normalized = normalizeLocale(match[1]);
        if (normalized && locales.includes(normalized)) {
          return normalized;
        }
      }

      return null;
    };

    const storedLocale = readStoredLocale();
    if (storedLocale) {
      if (storedLocale !== currentLocale) {
        const overridePath = alternatePaths?.[storedLocale];
        const targetPath = overridePath ?? buildLocalizedPath("/", storedLocale);
        const destination = `${targetPath}${searchPart}`;
        persistLocalePreference(storedLocale);
        window.location.replace(destination);
        return;
      }

      setSuggestedLocale(null);
      return;
    }

    const languages = navigator.languages?.length
      ? navigator.languages
      : navigator.language
        ? [navigator.language]
        : [];
    const detectedLocales = languages
      .map(mapLanguageToLocale)
      .filter((locale): locale is Locale => Boolean(locale && locales.includes(locale)));

    const candidate = detectedLocales[0] ?? (languages.length > 0 ? FALLBACK_LOCALE : null);

    if (!candidate || candidate === currentLocale || candidate === defaultLocale) {
      setSuggestedLocale(null);
      return;
    }

    setSuggestedLocale(candidate);
  }, [alternatePaths, currentLocale, searchPart]);

  const switchLocale = useCallback(
    (locale: Locale) => {
      const overridePath = alternatePaths?.[locale];
      const targetPath = overridePath ?? buildLocalizedPath("/", locale);
      const destination = `${targetPath}${searchPart}`;
      setSuggestedLocale(null);
      persistLocalePreference(locale);
      if (typeof window !== "undefined") {
        window.location.href = destination;
      }
    },
    [alternatePaths, searchPart],
  );

  const dismiss = useCallback(() => {
    setSuggestedLocale(null);
  }, []);

  if (!suggestedLocale || !copy) {
    return null;
  }

  const alternateLocales = locales.filter((locale) => locale !== suggestedLocale);

  return (
    <aside className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:max-w-sm rounded-xl border border-soft bg-surface text-primary shadow-card">
      <div className="p-4">
        <p className="text-sm font-semibold leading-5 text-strong">{copy.message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => switchLocale(suggestedLocale)}
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-[color:var(--color-accent-contrast)] transition hover:opacity-90"
          >
            {copy.acceptLabel}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss language suggestion"
            className="rounded-md border border-soft px-3 py-1.5 text-sm text-muted transition hover:text-strong"
          >
            ×
          </button>
        </div>
        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted">{copy.alternativesLabel}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {alternateLocales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => switchLocale(locale)}
              className="rounded-full border border-soft px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition hover:text-accent"
            >
              {locale}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
