import { locales } from "@/i18n/config";
import { buildFullJsonFeed, getFullFeedPagination, resolveFeedLocale } from "@/lib/feed";

export const prerender = true;

export function getStaticPaths() {
  const paths: { params: { locale: string; page: string } }[] = [];

  for (const locale of locales) {
    const { totalPages } = getFullFeedPagination(locale);
    for (let page = 2; page <= totalPages; page += 1) {
      paths.push({ params: { locale, page: String(page) } });
    }
  }

  return paths;
}

export function GET({ params }: { params: { locale?: string; page?: string } }) {
  const locale = resolveFeedLocale(params.locale);
  const pageNumber = Number.parseInt(params.page ?? "1", 10) || 1;
  return buildFullJsonFeed(locale, pageNumber);
}
