import { describe, it, expect } from "vitest";
import {
  normalizeLocale,
  detectLocaleFromHeaders,
  getLocaleFromPathname,
  buildLocalizedPath,
} from "@/i18n/locale-utils";

describe("normalizeLocale", () => {
  it("returns null for empty or null input", () => {
    expect(normalizeLocale(null)).toBeNull();
    expect(normalizeLocale(undefined)).toBeNull();
    expect(normalizeLocale("")).toBeNull();
    expect(normalizeLocale("   ")).toBeNull();
  });

  it("returns locale directly if already valid", () => {
    expect(normalizeLocale("ua")).toBe("ua");
    expect(normalizeLocale("ru")).toBe("ru");
    expect(normalizeLocale("en")).toBe("en");
  });

  it("normalizes case and whitespace", () => {
    expect(normalizeLocale("UA")).toBe("ua");
    expect(normalizeLocale("  RU  ")).toBe("ru");
    expect(normalizeLocale("En")).toBe("en");
  });

  it("maps uk variants to ua locale", () => {
    expect(normalizeLocale("uk")).toBe("ua");
    expect(normalizeLocale("uk-UA")).toBe("ua");
    expect(normalizeLocale("uk-ua")).toBe("ua");
    expect(normalizeLocale("ua-ua")).toBe("ua");
  });

  it("maps ru variants to ru locale", () => {
    expect(normalizeLocale("ru-RU")).toBe("ru");
    expect(normalizeLocale("ru-ru")).toBe("ru");
    expect(normalizeLocale("be")).toBe("ru");
    expect(normalizeLocale("kz")).toBe("ru");
  });

  it("maps en variants to en locale", () => {
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("en-us")).toBe("en");
    expect(normalizeLocale("en-GB")).toBe("en");
    expect(normalizeLocale("en-gb")).toBe("en");
  });

  it("returns null for unknown locales", () => {
    expect(normalizeLocale("fr")).toBeNull();
    expect(normalizeLocale("de")).toBeNull();
    expect(normalizeLocale("es")).toBeNull();
    expect(normalizeLocale("xyz")).toBeNull();
  });
});

describe("detectLocaleFromHeaders", () => {
  it("returns null for empty or null Accept-Language", () => {
    expect(detectLocaleFromHeaders(null)).toBeNull();
    expect(detectLocaleFromHeaders(undefined)).toBeNull();
    expect(detectLocaleFromHeaders("")).toBeNull();
  });

  it("detects single language", () => {
    expect(detectLocaleFromHeaders("uk")).toBe("ua");
    expect(detectLocaleFromHeaders("ru")).toBe("ru");
    expect(detectLocaleFromHeaders("en")).toBe("en");
  });

  it("respects quality values and picks highest", () => {
    expect(detectLocaleFromHeaders("en;q=0.5, ru;q=0.9")).toBe("ru");
    expect(detectLocaleFromHeaders("ru;q=0.5, en;q=0.8, uk;q=0.9")).toBe("ua");
  });

  it("defaults quality to 1.0 when not specified", () => {
    expect(detectLocaleFromHeaders("ru;q=0.5, en")).toBe("en");
    expect(detectLocaleFromHeaders("uk, ru;q=0.9")).toBe("ua");
  });

  it("handles complex Accept-Language headers", () => {
    expect(detectLocaleFromHeaders("uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7")).toBe("ua");
    expect(detectLocaleFromHeaders("en-US,en;q=0.9,ru;q=0.8")).toBe("en");
  });

  it("ignores unsupported languages and picks best supported", () => {
    expect(detectLocaleFromHeaders("fr;q=1.0, de;q=0.9, ru;q=0.5")).toBe("ru");
    expect(detectLocaleFromHeaders("zh;q=1.0, ja;q=0.9")).toBeNull();
  });

  it("handles whitespace in header values", () => {
    expect(detectLocaleFromHeaders("  uk  ,  ru;q=0.5  ")).toBe("ua");
  });
});

describe("getLocaleFromPathname", () => {
  it("returns null for root path", () => {
    expect(getLocaleFromPathname("/")).toBeNull();
  });

  it("extracts locale from first path segment", () => {
    expect(getLocaleFromPathname("/ua/")).toBe("ua");
    expect(getLocaleFromPathname("/ru/blog/")).toBe("ru");
    expect(getLocaleFromPathname("/en/about/")).toBe("en");
  });

  it("handles paths without trailing slash", () => {
    expect(getLocaleFromPathname("/ua")).toBe("ua");
    expect(getLocaleFromPathname("/ru/blog")).toBe("ru");
  });

  it("returns null for non-locale first segment", () => {
    expect(getLocaleFromPathname("/blog/")).toBeNull();
    expect(getLocaleFromPathname("/about/")).toBeNull();
    expect(getLocaleFromPathname("/favicon.ico")).toBeNull();
  });

  it("normalizes locale variants in path", () => {
    expect(getLocaleFromPathname("/uk/blog/")).toBe("ua");
  });
});

describe("buildLocalizedPath", () => {
  it("adds locale prefix to path", () => {
    expect(buildLocalizedPath("/blog/", "ua")).toBe("/ua/blog/");
    expect(buildLocalizedPath("/about/", "ru")).toBe("/ru/about/");
    expect(buildLocalizedPath("/", "en")).toBe("/en/");
  });

  it("replaces existing locale prefix", () => {
    expect(buildLocalizedPath("/ru/blog/", "ua")).toBe("/ua/blog/");
    expect(buildLocalizedPath("/ua/about/", "en")).toBe("/en/about/");
    expect(buildLocalizedPath("/en/", "ru")).toBe("/ru/");
  });

  it("ensures trailing slash", () => {
    expect(buildLocalizedPath("/blog", "ua")).toBe("/ua/blog/");
    expect(buildLocalizedPath("/about", "ru")).toBe("/ru/about/");
  });

  it("returns path unchanged if not starting with slash", () => {
    expect(buildLocalizedPath("blog/", "ua")).toBe("blog/");
    expect(buildLocalizedPath("about", "ru")).toBe("about");
  });

  it("handles deeply nested paths", () => {
    expect(buildLocalizedPath("/blog/tag/psychology/", "en")).toBe("/en/blog/tag/psychology/");
    expect(buildLocalizedPath("/ru/blog/type/story/page/2/", "ua")).toBe("/ua/blog/type/story/page/2/");
  });
});
