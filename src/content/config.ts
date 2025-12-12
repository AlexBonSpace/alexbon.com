import { defineCollection, z } from "astro:content";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { locales } from "../i18n/config";
import { AUTHOR_DISPLAY_BY_LOCALE, AUTHOR_SAME_AS } from "../lib/content-utils";

const EXPECTED_AUTHOR_DISPLAY = AUTHOR_DISPLAY_BY_LOCALE;
const EXPECTED_AUTHOR_SAME_AS = Array.from(AUTHOR_SAME_AS);

const authorDisplaySchema = z
  .object({
    ua: z.string(),
    ru: z.string(),
    en: z.string(),
  })
  .superRefine((value, ctx) => {
    for (const locale of locales) {
      if (value[locale] !== EXPECTED_AUTHOR_DISPLAY[locale]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [locale],
          message: `authorDisplay.${locale} must equal "${EXPECTED_AUTHOR_DISPLAY[locale]}"`,
        });
      }
    }
  });

const authorSchemaSchema = z.object({
  sameAs: z
    .array(z.string().url())
    .nonempty()
    .superRefine((value, ctx) => {
      if (value.length !== EXPECTED_AUTHOR_SAME_AS.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `authorSchema.sameAs must contain ${EXPECTED_AUTHOR_SAME_AS.length} entries`,
        });
        return;
      }
      for (let index = 0; index < EXPECTED_AUTHOR_SAME_AS.length; index += 1) {
        if (value[index] !== EXPECTED_AUTHOR_SAME_AS[index]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [index],
            message: `authorSchema.sameAs[${index}] must equal "${EXPECTED_AUTHOR_SAME_AS[index]}"`,
          });
        }
      }
    }),
});

const basePostSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["note", "article", "story", "okno"]).default("note"),
  description: z.string().optional(),
  canonical: z.string().optional(),
  publishedAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().default("Alex Bon"),
  authorUrl: z.string().default("https://alexbon.com"),
  authorDisplay: authorDisplaySchema,
  authorSchema: authorSchemaSchema,
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

export const collections = { posts };
