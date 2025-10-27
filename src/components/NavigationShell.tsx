"use client";

import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { Navbar } from "@/components/Navbar";
import { LanguagePrompt } from "@/components/LanguagePrompt";
import type { Locale } from "@/i18n/config";
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
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <I18nProvider locale={locale} messages={messages}>
        <Navbar
          activeLocale={locale}
          brandName={brandName}
          tagline={tagline}
          currentPath={currentPath}
          currentSearch={currentSearch}
          alternatePaths={alternatePaths}
        />
        {showPrompt ? (
          <LanguagePrompt
            currentPath={currentPath}
            currentSearch={currentSearch}
            alternatePaths={alternatePaths}
          />
        ) : null}
      </I18nProvider>
    </ThemeProvider>
  );
}

export default NavigationShell;
