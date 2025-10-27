import { defaultLocale, type Locale } from "@/i18n/config";
import {
  LOCALE_COOKIE,
  LOCALE_HEADER,
  detectLocaleFromHeaders,
  getLocaleFromPathname,
  normalizeLocale,
} from "@/i18n/locale-utils";

type CookieSource =
  | Map<string, unknown>
  | Record<string, unknown>
  | {
      get(name: string): unknown;
    };

function readCookieValue(source: CookieSource | undefined, name: string): string | null {
  if (!source) {
    return null;
  }

  if (source instanceof Map) {
    const value = source.get(name);
    if (typeof value === "string") {
      return value;
    }
    if (value && typeof value === "object" && "value" in value) {
      const candidate = (value as { value?: unknown }).value;
      return typeof candidate === "string" ? candidate : null;
    }
    return null;
  }

  if (typeof (source as { get?: unknown }).get === "function") {
    const result = (source as { get(name: string): unknown }).get(name);
    if (typeof result === "string") {
      return result;
    }
    if (result && typeof result === "object" && "value" in result) {
      const candidate = (result as { value?: unknown }).value;
      return typeof candidate === "string" ? candidate : null;
    }
    return null;
  }

  const record = source as Record<string, unknown>;
  const value = record[name];
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "value" in value) {
    const candidate = (value as { value?: unknown }).value;
    return typeof candidate === "string" ? candidate : null;
  }
  return null;
}

function escapeForRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readCookieFromHeader(header: string | null | undefined, name: string): string | null {
  if (!header) {
    return null;
  }

  const pattern = new RegExp(`(?:^|;)\\s*${escapeForRegExp(name)}=([^;]*)`);
  const match = header.match(pattern);
  return match ? decodeURIComponent(match[1] ?? "") : null;
}

function resolveRequestUrl(url: URL | string | undefined, request: Request | undefined): URL | null {
  if (url instanceof URL) {
    return url;
  }

  if (typeof url === "string") {
    try {
      return new URL(url, request?.url ?? "http://localhost");
    } catch {
      return null;
    }
  }

  if (request) {
    try {
      return new URL(request.url);
    } catch {
      return null;
    }
  }

  return null;
}

export function resolveRequestLocale({
  request,
  cookies,
  url,
  fallbackLocale = defaultLocale,
}: {
  request?: Request;
  cookies?: CookieSource;
  url?: URL | string;
  fallbackLocale?: Locale;
} = {}): Locale {
  const headers = request?.headers;

  const headerLocale = normalizeLocale(headers?.get(LOCALE_HEADER));
  if (headerLocale) {
    return headerLocale;
  }

  const directCookie = normalizeLocale(readCookieValue(cookies, LOCALE_COOKIE));
  if (directCookie) {
    return directCookie;
  }

  const cookieHeader = headers?.get("cookie");
  const headerCookie = normalizeLocale(readCookieFromHeader(cookieHeader, LOCALE_COOKIE));
  if (headerCookie) {
    return headerCookie;
  }

  const requestUrl = resolveRequestUrl(url, request);
  if (requestUrl) {
    const detected = getLocaleFromPathname(requestUrl.pathname);
    if (detected) {
      return detected;
    }
  }

  const acceptedLocale = detectLocaleFromHeaders(headers?.get("accept-language"));
  return acceptedLocale ?? fallbackLocale;
}
