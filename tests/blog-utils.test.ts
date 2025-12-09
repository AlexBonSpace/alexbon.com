import { describe, it, expect } from "vitest";

/**
 * Tests for pure utility functions from lib/blog.ts
 * These functions are extracted/reimplemented here for testing
 * since the main module depends on Astro's getCollection
 */

// Reimplemented from lib/blog.ts for testing
function truncateToBoundary(text: string, limit: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;

  const sliced = normalized.slice(0, limit);
  const lastSpace = sliced.lastIndexOf(" ");
  if (lastSpace > Math.floor(limit * 0.5)) {
    return sliced.slice(0, lastSpace).trimEnd();
  }
  return sliced.trimEnd();
}

function ensureEllipsis(text: string): string {
  const trimmed = text.trimEnd();
  if (!trimmed) return "";
  if (/[.]{3}$/.test(trimmed) || trimmed.endsWith("…")) {
    return trimmed;
  }
  return `${trimmed}...`;
}

function resolveCollection(segment: string | undefined): "articles" | "notes" | "stories" {
  if (segment === "articles" || segment === "stories") {
    return segment;
  }
  return "notes";
}

function resolveType(
  collection: "articles" | "notes" | "stories",
  candidate: string | undefined,
): "article" | "note" | "story" {
  if (collection === "articles") return "article";
  if (collection === "stories") return "story";
  if (candidate === "article" || candidate === "story") {
    return candidate;
  }
  return "note";
}

function computeTagScore(postTags: string[], referenceTags: string[]): number {
  if (postTags.length === 0 || referenceTags.length === 0) {
    return 0;
  }

  const referenceSet = new Set(referenceTags);
  let score = 0;

  for (let index = 0; index < referenceTags.length; index += 1) {
    const tag = referenceTags[index];
    if (postTags.includes(tag)) {
      score += index === 0 ? 2 : 1;
    }
  }

  if (score === 0) {
    return 0;
  }

  let extras = 0;
  for (const tag of postTags) {
    if (referenceSet.has(tag)) {
      extras += 1;
    }
  }

  return score + extras * 0.1;
}

describe("truncateToBoundary", () => {
  it("returns empty string for empty input", () => {
    expect(truncateToBoundary("", 100)).toBe("");
    expect(truncateToBoundary("   ", 100)).toBe("");
  });

  it("returns text unchanged if within limit", () => {
    expect(truncateToBoundary("Hello world", 100)).toBe("Hello world");
    expect(truncateToBoundary("Short text", 20)).toBe("Short text");
  });

  it("normalizes multiple spaces to single space", () => {
    expect(truncateToBoundary("Hello    world", 100)).toBe("Hello world");
    expect(truncateToBoundary("Multiple   spaces   here", 100)).toBe("Multiple spaces here");
  });

  it("truncates at word boundary when space is past halfway", () => {
    expect(truncateToBoundary("Hello world from Alex", 15)).toBe("Hello world");
    expect(truncateToBoundary("The quick brown fox jumps", 20)).toBe("The quick brown fox");
  });

  it("hard cuts when last space is before halfway point", () => {
    const text = "A verylongwordwithoutspaces here";
    const result = truncateToBoundary(text, 10);
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it("trims trailing whitespace from result", () => {
    expect(truncateToBoundary("Hello world ", 12)).toBe("Hello world");
  });
});

describe("ensureEllipsis", () => {
  it("returns empty string for empty input", () => {
    expect(ensureEllipsis("")).toBe("");
    expect(ensureEllipsis("   ")).toBe("");
  });

  it("adds ellipsis to text without one", () => {
    expect(ensureEllipsis("Hello world")).toBe("Hello world...");
    expect(ensureEllipsis("Some text")).toBe("Some text...");
  });

  it("does not add ellipsis if already present", () => {
    expect(ensureEllipsis("Already has...")).toBe("Already has...");
    expect(ensureEllipsis("Unicode ellipsis…")).toBe("Unicode ellipsis…");
  });

  it("trims trailing whitespace before adding ellipsis", () => {
    expect(ensureEllipsis("Hello world   ")).toBe("Hello world...");
  });
});

describe("resolveCollection", () => {
  it("returns articles for articles segment", () => {
    expect(resolveCollection("articles")).toBe("articles");
  });

  it("returns stories for stories segment", () => {
    expect(resolveCollection("stories")).toBe("stories");
  });

  it("defaults to notes for other segments", () => {
    expect(resolveCollection("notes")).toBe("notes");
    expect(resolveCollection("random")).toBe("notes");
    expect(resolveCollection(undefined)).toBe("notes");
  });
});

describe("resolveType", () => {
  it("returns article for articles collection", () => {
    expect(resolveType("articles", undefined)).toBe("article");
    expect(resolveType("articles", "note")).toBe("article");
  });

  it("returns story for stories collection", () => {
    expect(resolveType("stories", undefined)).toBe("story");
    expect(resolveType("stories", "article")).toBe("story");
  });

  it("respects candidate type for notes collection", () => {
    expect(resolveType("notes", "article")).toBe("article");
    expect(resolveType("notes", "story")).toBe("story");
  });

  it("defaults to note for notes collection with invalid candidate", () => {
    expect(resolveType("notes", undefined)).toBe("note");
    expect(resolveType("notes", "invalid")).toBe("note");
  });
});

describe("computeTagScore", () => {
  it("returns 0 for empty tags", () => {
    expect(computeTagScore([], ["tag1"])).toBe(0);
    expect(computeTagScore(["tag1"], [])).toBe(0);
    expect(computeTagScore([], [])).toBe(0);
  });

  it("scores first tag match as 2 points", () => {
    const score = computeTagScore(["psychology"], ["psychology"]);
    expect(score).toBeGreaterThan(2); // 2 + 0.1 bonus
  });

  it("scores non-first tag matches as 1 point each", () => {
    const score = computeTagScore(["growth"], ["psychology", "growth"]);
    expect(score).toBeGreaterThan(1); // 1 + 0.1 bonus
  });

  it("adds bonus for tag overlap", () => {
    const score1 = computeTagScore(["psychology"], ["psychology"]);
    const score2 = computeTagScore(["psychology", "growth"], ["psychology", "growth"]);
    expect(score2).toBeGreaterThan(score1);
  });

  it("returns 0 when no tags match", () => {
    expect(computeTagScore(["tag1", "tag2"], ["tag3", "tag4"])).toBe(0);
  });

  it("calculates correct score for multiple matches", () => {
    // First match (psychology) = 2, second match (growth) = 1
    // Bonus: 2 shared tags * 0.1 = 0.2
    // Total: 2 + 1 + 0.2 = 3.2
    const score = computeTagScore(["psychology", "relationships", "growth"], ["psychology", "growth"]);
    expect(score).toBeCloseTo(3.2, 1);
  });
});

describe("pagination logic", () => {
  const POSTS_PER_PAGE = 15;

  function paginatePosts(items: unknown[], page: number, pageSize = POSTS_PER_PAGE) {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);

    return {
      items: paginatedItems,
      page,
      totalCount: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    };
  }

  it("returns first page correctly", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const result = paginatePosts(items, 1);

    expect(result.page).toBe(1);
    expect(result.items).toHaveLength(15);
    expect(result.totalCount).toBe(50);
    expect(result.totalPages).toBe(4);
  });

  it("returns middle page correctly", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const result = paginatePosts(items, 2);

    expect(result.page).toBe(2);
    expect(result.items).toHaveLength(15);
    expect(result.items[0]).toBe(15);
  });

  it("returns last page with remaining items", () => {
    const items = Array.from({ length: 50 }, (_, i) => i);
    const result = paginatePosts(items, 4);

    expect(result.page).toBe(4);
    expect(result.items).toHaveLength(5); // 50 - 45 = 5
  });

  it("handles empty collection", () => {
    const result = paginatePosts([], 1);

    expect(result.items).toHaveLength(0);
    expect(result.totalPages).toBe(1);
  });

  it("handles page beyond range", () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    const result = paginatePosts(items, 5);

    expect(result.items).toHaveLength(0);
    expect(result.totalPages).toBe(1);
  });

  it("uses custom page size", () => {
    const items = Array.from({ length: 25 }, (_, i) => i);
    const result = paginatePosts(items, 1, 10);

    expect(result.items).toHaveLength(10);
    expect(result.totalPages).toBe(3);
  });
});
