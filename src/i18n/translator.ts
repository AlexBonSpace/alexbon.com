import type { Locale } from "@/i18n/config";
import type { TranslateFn, TranslationValues } from "@/types/i18n";

export type MessageDictionary = Record<string, unknown>;

function resolveEntry(dictionary: MessageDictionary, keyPath: string): unknown {
  return keyPath.split(".").reduce<unknown>((acc, segment) => {
    if (acc && typeof acc === "object" && segment in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[segment];
    }
    return undefined;
  }, dictionary);
}

function formatTemplate(template: string, values?: TranslationValues): string {
  if (!values) {
    return template;
  }

  return template.replace(/\{([^}]+)\}/g, (_, token: string) => {
    const value = values[token.trim()];
    return value === undefined || value === null ? `{${token}}` : String(value);
  });
}

export function translate(dictionary: MessageDictionary, key: string, values?: TranslationValues): string {
  const entry = resolveEntry(dictionary, key);
  if (typeof entry !== "string") {
    return key;
  }

  return formatTemplate(entry, values);
}

export function createTranslator({
  namespace,
  messages,
}: {
  locale: Locale;
  namespace?: string;
  messages: MessageDictionary;
}): TranslateFn {
  const prefix = namespace ? `${namespace}.` : "";
  return (key: string, values?: TranslationValues) => translate(messages, `${prefix}${key}`, values);
}
