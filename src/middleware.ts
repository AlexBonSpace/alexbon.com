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

const redirectMap = new Map<string, string>(
  redirectEntries.map(([from, to]) => [normalizePathname(from), to]),
);

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

const buildDestination = (origin: string, targetPath: string) =>
  new URL(targetPath, origin).toString();

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

  return next();
};
