"use client";

import { useMemo } from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { Navbar } from "@/components/Navbar";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import { locales, type Locale } from "@/i18n/config";
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
      </I18nProvider>
    </ThemeProvider>
  );
}

export default NavigationShell;
