import uaMessages from "@/messages/ua.json";
import ruMessages from "@/messages/ru.json";
import enMessages from "@/messages/en.json";
import type { Locale } from "@/i18n/config";

export const messagesByLocale: Record<Locale, Record<string, unknown>> = {
  ua: uaMessages as Record<string, unknown>,
  ru: ruMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};
