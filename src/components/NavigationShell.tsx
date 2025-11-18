"use client";

import { useMemo } from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { Navbar } from "@/components/Navbar";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import { languageLinks } from "@/content";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { buildLocalizedPath } from "@/i18n/locale-utils";
import type { ThemeId } from "@/lib/themes";
import type { MessageDictionary } from "@/i18n/translator";

type NavigationShellProps = {
  locale: Locale;
  brandName: string;
  tagline: string;
  messages: MessageDictionary;
  initialTheme: ThemeId;
  currentPath: string;
  currentSearch?: string;
  alternatePaths?: Partial<Record<Locale, string>>;
  showPrompt?: boolean;
};

export function NavigationShell({
  locale,
  brandName,
  tagline,
  messages,
  initialTheme,
  currentPath,
  currentSearch,
  alternatePaths,
  showPrompt = false,
}: NavigationShellProps) {
  const searchSuffix =
    currentSearch && currentSearch !== "?" ? (currentSearch.startsWith("?") ? currentSearch : `?${currentSearch}`) : "";

  const resolvedAlternatePaths = useMemo(
    () =>
      locales.reduce<Record<Locale, string>>(
        (acc, candidate) => {
          const providedPath = alternatePaths?.[candidate];
          if (providedPath) {
            acc[candidate] = providedPath;
            return acc;
          }
          acc[candidate] = buildLocalizedPath("/", candidate);
          return acc;
        },
        {} as Record<Locale, string>,
      ),
    [alternatePaths],
  );

  const fallbackLanguageLinks = languageLinks.map(({ label, locale: linkLocale }) => {
    const localeKey = linkLocale as Locale;
    const localizedPath = resolvedAlternatePaths[localeKey] ?? buildLocalizedPath("/", localeKey);
    const href = `${localizedPath}${searchSuffix}`.replace(/\?$/, "");
    const isActive = localeKey === locale;
    return { label, href, isActive, locale: localeKey };
  });

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const noscriptMarkup = `<nav class="language-links language-links--navbar" aria-label="Languages"><ul class="language-links__list">${fallbackLanguageLinks
    .map((link) => {
      const className = `language-links__link${link.isActive ? " language-links__link--active" : ""}`;
      const ariaCurrent = link.isActive ? ' aria-current="page"' : "";
      return `<li class="language-links__item"><a href="${escapeHtml(link.href || (link.locale === defaultLocale ? "/" : `/${link.locale}/`))}" class="${className}"${ariaCurrent}>${escapeHtml(link.label)}</a></li>`;
    })
    .join("")}</ul></nav>`;

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider locale={locale} messages={messages}>
        <Navbar
          activeLocale={locale}
          brandName={brandName}
          tagline={tagline}
          currentPath={currentPath}
          currentSearch={currentSearch}
          alternatePaths={resolvedAlternatePaths}
        />
        {showPrompt ? (
          <LanguagePrompt
            currentPath={currentPath}
            currentSearch={currentSearch}
            alternatePaths={resolvedAlternatePaths}
          />
        ) : null}
        <noscript dangerouslySetInnerHTML={{ __html: noscriptMarkup }} />
      </I18nProvider>
    </ThemeProvider>
  );
}

export default NavigationShell;
