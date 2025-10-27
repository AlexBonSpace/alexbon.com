import { defaultLocale } from "@/i18n/config";
import { buildJsonFeed } from "@/lib/feed";

export const prerender = true;

export function GET() {
  return buildJsonFeed(defaultLocale);
}
