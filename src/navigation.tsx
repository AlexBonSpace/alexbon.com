"use client";

import { forwardRef } from "react";
import type { ComponentPropsWithoutRef } from "react";
import type { Locale } from "@/i18n/config";
import { useLocale } from "@/contexts/i18n-context";
import { buildLocalizedPath } from "@/i18n/locale-utils";

function isExternalHref(href: string): boolean {
  return /^[a-z][a-z\d+\-.]*:/i.test(href) || href.startsWith("//");
}

function localizeHref(href: string, locale: Locale): string {
  if (!href || href.startsWith("#") || isExternalHref(href)) {
    return href;
  }

  if (!href.startsWith("/")) {
    return href;
  }

  const [pathWithSearch, hash] = href.split("#", 2);
  const [pathname, search] = pathWithSearch.split("?", 2);
  const localizedPath = buildLocalizedPath(pathname || "/", locale);
  const query = search ? `?${search}` : "";
  const hashSuffix = hash ? `#${hash}` : "";
  return `${localizedPath}${query}${hashSuffix}`;
}

type AnchorProps = ComponentPropsWithoutRef<"a">;

type LinkProps = Omit<AnchorProps, "href"> & {
  href: string;
  locale?: Locale;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, locale, children, ...rest }, ref) {
  const activeLocale = useLocale();
  const targetLocale = locale ?? activeLocale;
  const localizedHref = localizeHref(href, targetLocale);

  return (
    <a href={localizedHref} ref={ref} {...rest}>
      {children}
    </a>
  );
});

export default Link;
