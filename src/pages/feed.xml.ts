import { defaultLocale } from "@/i18n/config";

export const prerender = false;

export function GET() {
  const target = `/${defaultLocale}/feed.xml`;
  return Response.redirect(target, 308);
}
