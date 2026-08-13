import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { locales } from "./i18n/config";
import { AUTHOR_DISPLAY_BY_LOCALE, AUTHOR_SAME_AS } from "./lib/content-utils";

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
          code: "custom",
          path: [locale],
          message: `authorDisplay.${locale} must equal "${EXPECTED_AUTHOR_DISPLAY[locale]}"`,
        });
      }
    }
  });

const authorSchemaSchema = z.object({
  sameAs: z
    .array(z.url())
    .nonempty()
    .superRefine((value, ctx) => {
      if (value.length !== EXPECTED_AUTHOR_SAME_AS.length) {
        ctx.addIssue({
          code: "custom",
          message: `authorSchema.sameAs must contain ${EXPECTED_AUTHOR_SAME_AS.length} entries`,
        });
        return;
      }
      for (let index = 0; index < EXPECTED_AUTHOR_SAME_AS.length; index += 1) {
        if (value[index] !== EXPECTED_AUTHOR_SAME_AS[index]) {
          ctx.addIssue({
            code: "custom",
            path: [index],
            message: `authorSchema.sameAs[${index}] must equal "${EXPECTED_AUTHOR_SAME_AS[index]}"`,
          });
        }
      }
    }),
});

const basePostSchema = z.object({
  title: z.string().optional(),
  type: z.enum(["note", "article", "story", "okna"]).default("note"),
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

// Content Layer API. `glob()` derives entry.id the same way legacy collections derived
// entry.slug (see astro/dist/content/loaders/glob.js -> getContentEntryIdAndSlug), so ids
// stay in the "<locale>/<collection>/<file>" form that src/lib/blog.ts splits apart.
const posts = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/posts" }),
  schema: basePostSchema,
});

export const collections = { posts };
