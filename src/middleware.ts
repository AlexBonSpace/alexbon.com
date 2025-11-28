import type { MiddlewareHandler } from "astro";

export const redirectEntries: Array<[string, string]> = [
  ["/de/", "/ua/blog/"],
  ["/pl/", "/ua/blog/"],
  ["/blog/single-player/", "/en/blog/"],
  ["/blog/heometriia-soniachnoi-pliamy/", "/ua/blog/"],
  ["/сведение-счетов-с-близкими-людьми/", "/ru/blog/"],
  ["/index.html", "/ua/blog/"],
  ["/o-strakhe-sovershit-oshibku/", "/ru/blog/"],
  ["/стремление-находиться-под-защитой/", "/ru/blog/"],
  ["/popadaya_v_lovushku_pribedneniya/", "/ru/blog/"],
  ["/put-k-sebe/strakh-pered-privyazannostyu/", "/ru/blog/"],
  ["/put-k-sebe/vymeshchaya-zlobu-na-drugom/", "/ru/blog/"],
  ["/put-k-sebe/starayas-podlovit-drugogo/", "/ru/blog/"],
  ["/_next/static/media/e4af272ccee01ff0-s.p.woff2", "/ua/blog/"],
  ["/favicon.ico", "/favicon.svg"],
];

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

/**
 * Security headers applied to all responses
 * Protects against XSS, clickjacking, MIME-sniffing, and other common attacks
 */
const securityHeaders = {
  // Content Security Policy - prevents XSS attacks
  // Allows scripts from self and Algolia (for search)
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' *.algolia.net *.algolianet.com",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: fonts.gstatic.com",
    "connect-src 'self' *.algolia.net *.algolianet.com",
    "frame-ancestors 'none'",
  ].join("; "),
  // Prevents clickjacking attacks
  "X-Frame-Options": "DENY",
  // Prevents MIME-sniffing attacks
  "X-Content-Type-Options": "nosniff",
  // Controls referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Disables unwanted browser features
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

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
