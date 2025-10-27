import { locales } from "@/i18n/config";
import { resolveFeedLocale, buildRssFeed } from "@/lib/feed";

export const prerender = true;

export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export function GET({ params }: { params: { locale?: string } }) {
  const locale = resolveFeedLocale(params.locale);
  return buildRssFeed(locale);
}
