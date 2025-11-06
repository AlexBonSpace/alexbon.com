import { locales } from "@/i18n/config";
import { resolveFeedLocale } from "@/lib/feed";

export const prerender = true;

export function getStaticPaths() {
  return locales.map((locale) => ({ params: { locale } }));
}

export function GET({ params }: { params: { locale?: string } }) {
  const locale = resolveFeedLocale(params.locale);
  const location = `/${locale}/feed-full.json`;
  return new Response(null, {
    status: 301,
    statusText: "Moved Permanently",
    headers: {
      Location: location,
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
