import { defaultLocale } from "@/i18n/config";
import { buildRssFeed } from "@/lib/feed";

export const prerender = true;

export function GET() {
  return buildRssFeed(defaultLocale);
}
