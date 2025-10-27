'use client';

import type { Locale } from "@/i18n/config";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "@/i18n/locale-utils";

export function persistLocalePreference(locale: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    // ignore cookie write errors (e.g., disabled cookies)
  }

  try {
    localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // localStorage might be unavailable; ignore failures
  }
}
