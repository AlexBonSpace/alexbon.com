import type { MiddlewareHandler } from "astro";
import securityHeaders from "@/config/security-headers.json";
import legacyRedirects from "@/config/legacy-redirects.json";

// Dead URLs from the previous, Russian-only site (those posts no longer exist) -> homepage,
// where locale is auto-detected. This is the SINGLE SOURCE, shared with
// scripts/build-edge-config.mjs which emits the SAME list into the edge _redirects file.
// The edge file is what actually redirects them: under Workers static assets this
// middleware does NOT run for paths that match no route (they are served 404.html directly),
// so middleware-only redirects are unreliable. The map below is a harmless fallback for
// paths that do reach the Worker.
export const redirectEntries = legacyRedirects as Array<[string, string]>;

const fileLikePattern = /\.[^/]+$/;

const redirectMap = new Map<string, string>(redirectEntries.map(([from, to]) => [normalizePathname(from), to]));

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function normalizePathname(pathname: string): string {
  let normalized = safeDecode(pathname.trim());
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }
  if (normalized === "/") {
    return normalized;
  }
  if (fileLikePattern.test(normalized.split("/").pop() ?? "")) {
    return normalized;
  }
  return normalized.endsWith("/") ? normalized.slice(0, -1) : normalized;
}

const buildDestination = (origin: string, targetPath: string) => new URL(targetPath, origin).toString();

// Security headers (CSP, X-Frame-Options, etc.) live in src/config/security-headers.json
// as the single source of truth. This middleware applies them to Worker-served (SSR)
// responses; scripts/build-edge-config.mjs writes the SAME values into the edge _headers
// file so that static-asset responses (the bulk of the site) are covered too. Under
// Cloudflare Workers static assets, prerendered pages are served WITHOUT invoking this
// middleware, so _headers is not optional - it is what protects most pages.

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url = new URL(context.request.url);
  const isFileRequest = fileLikePattern.test(url.pathname.split("/").pop() ?? "");
  if (!isFileRequest && url.pathname !== "/" && !url.pathname.endsWith("/")) {
    const slashUrl = new URL(url);
    slashUrl.pathname = `${url.pathname}/`;
    return context.redirect(slashUrl.toString(), 308);
  }
  const lookupKey = normalizePathname(url.pathname);
  const target = redirectMap.get(lookupKey);

  if (target) {
    return context.redirect(buildDestination(url.origin, target), 308);
  }

  if (lookupKey === "/blog" && url.searchParams.has("q")) {
    const query = url.searchParams.get("q") ?? "";
    const isPlaceholder = query.includes("{search_term_string}") || query.trim().length === 0;
    const destination = new URL("/ua/search/", url.origin);
    if (!isPlaceholder) {
      destination.searchParams.set("q", query);
    }
    return context.redirect(destination.toString(), 308);
  }

  // Get response from next handler
  const response = await next();

  // Apply security headers to response
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  return response;
};
