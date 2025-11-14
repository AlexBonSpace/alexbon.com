import { describe, it, expect } from "vitest";
import { buildLocalizedPath as buildLocalizedPathSeo, buildLanguageAlternates } from "@/lib/seo";
import { buildLocalizedPath as buildLocalizedPathLocale } from "@/i18n/locale-utils";
import { normalizePathname, redirectEntries } from "@/middleware";

describe("buildLocalizedPath helpers", () => {
  it("prefixes locale and enforces trailing slash from seo helper", () => {
    expect(buildLocalizedPathSeo("ru", "/blog/")).toBe("/ru/blog/");
    expect(buildLocalizedPathSeo("en", "/")).toBe("/en/");
  });

  it("strips existing locale segments before prefixing new locale", () => {
    expect(buildLocalizedPathLocale("/ru/blog/", "ua")).toBe("/ua/blog/");
    expect(buildLocalizedPathLocale("/", "en")).toBe("/en/");
    expect(buildLocalizedPathLocale("/en/", "ru")).toBe("/ru/");
  });
});

describe("buildLanguageAlternates", () => {
  it("only includes requested locales and sets x-default to existing page", () => {
    const alternates = buildLanguageAlternates(
      {
        ua: "/blog/",
        ru: "/blog/",
      },
      { locales: ["ua", "ru"] },
    );

    expect(alternates).toMatchObject({
      "uk-UA": "https://www.alexbon.com/ua/blog/",
      "ru-RU": "https://www.alexbon.com/ru/blog/",
      "x-default": "https://www.alexbon.com/ua/blog/",
    });
    expect(alternates).not.toHaveProperty("en");
  });

  it("falls back to default locale when mapping is not provided", () => {
    const alternates = buildLanguageAlternates("/about/");
    expect(alternates["uk-UA"]).toBe("https://www.alexbon.com/ua/about/");
    expect(alternates["en"]).toBe("https://www.alexbon.com/en/about/");
  });
});

describe("middleware helpers", () => {
  it("normalizes pathname and keeps file references untouched", () => {
    expect(normalizePathname("/ru/blog/")).toBe("/ru/blog");
    expect(normalizePathname("/ru/blog")).toBe("/ru/blog");
    expect(normalizePathname("ru/blog")).toBe("/ru/blog");
    expect(normalizePathname("/favicon.ico")).toBe("/favicon.ico");
  });

  it("has unique redirect entries", () => {
    const keys = redirectEntries.map(([from]) => normalizePathname(from));
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index);
    expect(duplicates).toHaveLength(0);
  });
});
