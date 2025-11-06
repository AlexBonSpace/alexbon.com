import { defaultLocale } from "@/i18n/config";

export const prerender = false;

export function GET() {
  const target = `/${defaultLocale}/feed-full.json`;
  return Response.redirect(target, 308);
}
