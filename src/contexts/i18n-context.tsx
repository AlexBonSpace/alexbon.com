'use client';

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { createTranslator, translate, type MessageDictionary } from "@/i18n/translator";
import type { TranslateFn, TranslationValues } from "@/types/i18n";

interface I18nContextValue {
  locale: Locale;
  messages: MessageDictionary;
  translate: (key: string, values?: TranslationValues) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("I18n hooks must be used within an I18nProvider");
  }
  return context;
}

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: MessageDictionary;
  children: ReactNode;
}) {
  const value = useMemo<I18nContextValue>(() => {
    const translateFn = (key: string, values?: TranslationValues) => translate(messages, key, values);
    return {
      locale,
      messages,
      translate: translateFn,
    };
  }, [locale, messages]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLocale(): Locale {
  return useI18nContext().locale;
}

export function useTranslations(namespace?: string): TranslateFn {
  const { locale, messages } = useI18nContext();

  return useMemo(
    () =>
      createTranslator({
        locale,
        namespace,
        messages,
      }),
    [locale, messages, namespace],
  );
}
