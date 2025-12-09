import { describe, it, expect } from "vitest";
import { locales, defaultLocale, type Locale } from "@/i18n/config";

/**
 * Tests for feed utility functions
 * Functions are reimplemented here since lib/feed.ts depends on Astro runtime (astro:content)
 */

// Reimplemented from lib/feed.ts for testing
function resolveLocale(locale: string): Locale | null {
  return locales.includes(locale as Locale) ? (locale as Locale) : null;
}

function resolveFeedLocale(rawLocale?: string): Locale {
  if (!rawLocale) return defaultLocale;
  const resolved = resolveLocale(rawLocale);
  return resolved ?? defaultLocale;
}
function truncatePlainText(text: string, length: number) {
  if (!text) return "";
  if (text.length <= length) return text;
  const cutoff = Math.max(0, length - 3);
  return `${text.slice(0, cutoff).trimEnd()}...`;
}

function ensureAbsoluteUrl(candidate: string, siteUrl = "https://www.alexbon.com") {
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return new URL(candidate.startsWith("/") ? candidate : `/${candidate}`, siteUrl).toString();
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeCdata(value: string) {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

function absolutizeRelativeUrls(html: string, siteUrl = "https://www.alexbon.com"): string {
  let transformed = html.replace(/(href|src|poster)="\/(?!\/)([^"]*)"/g, (_, attr: string, path: string) => {
    const absolute = new URL(path, siteUrl).toString();
    return `${attr}="${absolute}"`;
  });

  transformed = transformed.replace(/srcset="([^"]*)"/g, (_, srcset: string) => {
    const rewritten = srcset
      .split(",")
      .map((entry) => {
        const trimmed = entry.trim();
        if (!trimmed) return trimmed;
        const [url, descriptor] = trimmed.split(/\s+/, 2);
        if (!url || !url.startsWith("/")) return trimmed;
        const absolute = new URL(url, siteUrl).toString();
        return descriptor ? `${absolute} ${descriptor}` : absolute;
      })
      .join(", ");
    return `srcset="${rewritten}"`;
  });

  return transformed;
}

type PlainFeedItem = {
  date_modified: string;
  date_published: string;
  slug?: string;
  url: string;
};

function sortByLastModifiedDesc(a: PlainFeedItem, b: PlainFeedItem) {
  const aTime = new Date(a.date_modified || a.date_published).getTime();
  const bTime = new Date(b.date_modified || b.date_published).getTime();
  if (aTime !== bTime) {
    return bTime - aTime;
  }
  const aPublished = new Date(a.date_published).getTime();
  const bPublished = new Date(b.date_published).getTime();
  if (aPublished !== bPublished) {
    return bPublished - aPublished;
  }
  return (a.slug ?? a.url).localeCompare(b.slug ?? b.url);
}

describe("resolveFeedLocale", () => {
  it("returns default locale for empty input", () => {
    expect(resolveFeedLocale(undefined)).toBe("ua");
    expect(resolveFeedLocale("")).toBe("ua");
  });

  it("returns valid locales unchanged", () => {
    expect(resolveFeedLocale("ua")).toBe("ua");
    expect(resolveFeedLocale("ru")).toBe("ru");
    expect(resolveFeedLocale("en")).toBe("en");
  });

  it("returns default locale for invalid input", () => {
    expect(resolveFeedLocale("fr")).toBe("ua");
    expect(resolveFeedLocale("invalid")).toBe("ua");
  });
});

describe("truncatePlainText", () => {
  it("returns empty string for empty input", () => {
    expect(truncatePlainText("", 100)).toBe("");
  });

  it("returns text unchanged if within limit", () => {
    expect(truncatePlainText("Hello", 100)).toBe("Hello");
    expect(truncatePlainText("Short text", 20)).toBe("Short text");
  });

  it("truncates and adds ellipsis", () => {
    const result = truncatePlainText("Hello world this is a long text", 15);
    expect(result.endsWith("...")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(15);
  });

  it("handles edge case where cutoff is at start", () => {
    expect(truncatePlainText("Hi", 3)).toBe("Hi");
    expect(truncatePlainText("Hello", 4)).toBe("H...");
  });
});

describe("ensureAbsoluteUrl", () => {
  it("returns absolute URLs unchanged", () => {
    expect(ensureAbsoluteUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(ensureAbsoluteUrl("http://example.com")).toBe("http://example.com");
  });

  it("converts relative paths to absolute", () => {
    expect(ensureAbsoluteUrl("/blog/post")).toBe("https://www.alexbon.com/blog/post");
    expect(ensureAbsoluteUrl("/about/")).toBe("https://www.alexbon.com/about/");
  });

  it("handles paths without leading slash", () => {
    expect(ensureAbsoluteUrl("blog/post")).toBe("https://www.alexbon.com/blog/post");
  });
});

describe("escapeXml", () => {
  it("escapes ampersands", () => {
    expect(escapeXml("Tom & Jerry")).toBe("Tom &amp; Jerry");
  });

  it("escapes less than and greater than", () => {
    expect(escapeXml("<tag>")).toBe("&lt;tag&gt;");
  });

  it("handles multiple special characters", () => {
    expect(escapeXml("a < b & b > c")).toBe("a &lt; b &amp; b &gt; c");
  });

  it("leaves normal text unchanged", () => {
    expect(escapeXml("Hello World")).toBe("Hello World");
  });
});

describe("escapeCdata", () => {
  it("escapes CDATA end sequence", () => {
    expect(escapeCdata("content]]>more")).toBe("content]]]]><![CDATA[>more");
  });

  it("handles multiple CDATA sequences", () => {
    expect(escapeCdata("a]]>b]]>c")).toBe("a]]]]><![CDATA[>b]]]]><![CDATA[>c");
  });

  it("leaves normal text unchanged", () => {
    expect(escapeCdata("Normal text")).toBe("Normal text");
  });
});

describe("absolutizeRelativeUrls", () => {
  it("converts relative href to absolute", () => {
    const html = '<a href="/blog/post">Link</a>';
    expect(absolutizeRelativeUrls(html)).toBe('<a href="https://www.alexbon.com/blog/post">Link</a>');
  });

  it("converts relative src to absolute", () => {
    const html = '<img src="/images/photo.jpg" />';
    expect(absolutizeRelativeUrls(html)).toBe('<img src="https://www.alexbon.com/images/photo.jpg" />');
  });

  it("converts relative poster to absolute", () => {
    const html = '<video poster="/video/thumb.jpg"></video>';
    expect(absolutizeRelativeUrls(html)).toBe('<video poster="https://www.alexbon.com/video/thumb.jpg"></video>');
  });

  it("leaves absolute URLs unchanged", () => {
    const html = '<a href="https://example.com">External</a>';
    expect(absolutizeRelativeUrls(html)).toBe(html);
  });

  it("handles srcset attribute", () => {
    const html = '<img srcset="/img/small.jpg 1x, /img/large.jpg 2x" />';
    const result = absolutizeRelativeUrls(html);
    expect(result).toContain("https://www.alexbon.com/img/small.jpg 1x");
    expect(result).toContain("https://www.alexbon.com/img/large.jpg 2x");
  });

  it("does not modify protocol-relative URLs", () => {
    const html = '<a href="//example.com/path">Link</a>';
    expect(absolutizeRelativeUrls(html)).toBe(html);
  });
});

describe("sortByLastModifiedDesc", () => {
  it("sorts by date_modified descending", () => {
    const items: PlainFeedItem[] = [
      { date_modified: "2024-01-01", date_published: "2024-01-01", url: "/a" },
      { date_modified: "2024-03-01", date_published: "2024-03-01", url: "/b" },
      { date_modified: "2024-02-01", date_published: "2024-02-01", url: "/c" },
    ];

    const sorted = [...items].sort(sortByLastModifiedDesc);
    expect(sorted[0].url).toBe("/b");
    expect(sorted[1].url).toBe("/c");
    expect(sorted[2].url).toBe("/a");
  });

  it("falls back to date_published when modified dates equal", () => {
    const items: PlainFeedItem[] = [
      { date_modified: "2024-01-15", date_published: "2024-01-01", url: "/a" },
      { date_modified: "2024-01-15", date_published: "2024-01-10", url: "/b" },
    ];

    const sorted = [...items].sort(sortByLastModifiedDesc);
    expect(sorted[0].url).toBe("/b");
  });

  it("falls back to slug/url alphabetically when dates equal", () => {
    const items: PlainFeedItem[] = [
      { date_modified: "2024-01-01", date_published: "2024-01-01", slug: "zebra", url: "/z" },
      { date_modified: "2024-01-01", date_published: "2024-01-01", slug: "apple", url: "/a" },
    ];

    const sorted = [...items].sort(sortByLastModifiedDesc);
    expect(sorted[0].slug).toBe("apple");
  });

  it("uses url when slug is not available", () => {
    const items: PlainFeedItem[] = [
      { date_modified: "2024-01-01", date_published: "2024-01-01", url: "/zebra" },
      { date_modified: "2024-01-01", date_published: "2024-01-01", url: "/apple" },
    ];

    const sorted = [...items].sort(sortByLastModifiedDesc);
    expect(sorted[0].url).toBe("/apple");
  });
});
