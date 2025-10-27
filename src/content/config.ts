import { defineCollection, z } from "astro:content";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

const basePostSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["note", "article", "story"]).default("note"),
  description: z.string().optional(),
  canonical: z.string().optional(),
  archived: z.string().optional(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().default("Alex Bon"),
  authorUrl: z.string().default("https://alexbon.com"),
  license: z.string().default("CC BY 4.0"),
  cardSnippet: z.string().optional(),
  image: z.string().optional(),
  translationGroup: z.string().optional(),
});

const posts = defineCollection({
  type: "content",
  schema: basePostSchema,
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["heading-anchor"] },
        },
      ],
    ],
  },
});

const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    canonical: z.string().optional(),
    archived: z.string().optional(),
    author: z.string().default("Alex Bon"),
    authorUrl: z.string().default("https://alexbon.com"),
    license: z.string().default("CC BY 4.0"),
    cardSnippet: z.string().optional(),
  }),
  markdown: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "wrap",
          properties: { className: ["heading-anchor"] },
        },
      ],
    ],
  },
});

export const collections = { posts, pages };
