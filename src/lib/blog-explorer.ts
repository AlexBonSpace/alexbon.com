import type { Locale } from "@/i18n/config";
import { getPostTypeLabel } from "@/lib/post-types";
import type { BlogPost } from "@/lib/blog";

export type ExplorerPostView = {
  slug: string;
  title: string;
  url: string;
  type: BlogPost["type"];
  typeLabel: string;
  typeUrl: string;
  snippet: string;
  description: string;
  tags: string[];
  searchContent: string;
};

const ensureTrailingSlash = (value: string) => (value.endsWith("/") ? value : `${value}/`);

export function buildSnippet(text: string, maxLength = 300) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const segments = cleaned.split(/(?<=\.)\s+/).filter(Boolean);
  if (segments.length === 0) {
    return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength - 1).trim()}…` : cleaned;
  }
  let composed = segments[0];
  for (let i = 0; i < segments.length; i += 1) {
    composed = segments.slice(0, i + 1).join(" ").trim();
    if (composed.length > maxLength) {
      const trimmed = composed.slice(0, maxLength);
      const lastSpace = trimmed.lastIndexOf(" ");
      return `${(lastSpace > 80 ? trimmed.slice(0, lastSpace) : trimmed).trim()}…`;
    }
  }
  if (composed.length < cleaned.length) {
    return `${composed.trim()}…`;
  }
  return composed;
}

export function toExplorerPost(post: BlogPost, locale: Locale): ExplorerPostView {
  const snippetSource =
    post.cardSnippet?.trim() || post.summary || post.description || post.plainText || "";
  const snippet = post.type === "note" ? snippetSource : buildSnippet(snippetSource);
  const prefix = `/${locale}`;
  const typeUrl = ensureTrailingSlash(`${prefix}/blog/type/${post.type}`);

  return {
    slug: post.slug,
    title: post.title,
    url: ensureTrailingSlash(post.url),
    type: post.type,
    typeLabel: getPostTypeLabel(locale, post.type),
    typeUrl,
    snippet,
    description: post.description ?? snippet,
    tags: post.tags,
    searchContent: post.searchContent,
  };
}

export function toExplorerPosts(posts: BlogPost[], locale: Locale): ExplorerPostView[] {
  return posts.map((post) => toExplorerPost(post, locale));
}
