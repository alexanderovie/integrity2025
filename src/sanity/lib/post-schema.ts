import "server-only";

import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import {
  sanityPostBySlugQuery,
  sanityPostCountQuery,
  sanityPostSummariesQuery,
  sanityPostsQuery,
} from "@/sanity/lib/queries";
import { urlForSanityImage } from "@/sanity/lib/image";
import { sanityClient } from "@/sanity/lib/client";
import type { BlogFrontmatter, BlogPost, BlogPostMetadata } from "@/lib/blog/types";
import type {
  SanityBlogPost,
  SanityBlogPostSummary,
  SanityGeneratedBlogPost,
  SanityGeneratedBlogPostCount,
  SanityGeneratedBlogPostResult,
  SanityGeneratedBlogPostSummaries,
  SanityGeneratedBlogPosts,
  SanityPortableTextBlock,
  SanityPortableTextLinkMark,
  SanityPortableTextSpan,
} from "@/sanity/types";
import readingTime from "reading-time";

const sanityPortableTextChildSchema: z.ZodType<SanityPortableTextSpan> = z.object({
  _type: z.string(),
  _key: z.string().optional(),
  text: z.string().optional(),
  marks: z.array(z.string()).nullable().optional(),
}).passthrough();

const sanityPortableTextMarkDefSchema: z.ZodType<SanityPortableTextLinkMark> = z.object({
  _key: z.string(),
  _type: z.string(),
  href: z.string().optional(),
}).passthrough();

const sanityPortableTextBlockSchema: z.ZodType<SanityPortableTextBlock> = z.object({
  _key: z.string().optional(),
  _type: z.string(),
  children: z.array(sanityPortableTextChildSchema).optional(),
  style: z.string().optional(),
  listItem: z.string().optional(),
  level: z.number().optional(),
  markDefs: z.array(sanityPortableTextMarkDefSchema).optional(),
  alt: z.string().optional(),
  asset: z.object({
    _ref: z.string().optional(),
    _id: z.string().optional(),
    _type: z.string().optional(),
  }).optional(),
}).passthrough();

const sanityImageSchema = z.object({
  alt: z.string().min(1).optional(),
  asset: z.object({
    _ref: z.string().optional(),
    _id: z.string().optional(),
    _type: z.string().optional(),
  }).passthrough().optional(),
}).passthrough();

export const sanityBlogPostSchema: z.ZodType<SanityBlogPost> = z.object({
  slug: z.string().min(1),
  title: z.string().min(10).max(90),
  description: z.string().min(50).max(180),
  publishedAt: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).min(1),
  featured: z.boolean().nullable(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(180).nullable().optional(),
  mainImage: sanityImageSchema.nullable().optional(),
  body: z.array(sanityPortableTextBlockSchema).min(1),
}).passthrough();

export const sanityBlogPostsSchema: z.ZodType<SanityBlogPost[]> = z.array(sanityBlogPostSchema);

export const sanityBlogPostSummarySchema: z.ZodType<SanityBlogPostSummary> = z.object({
  slug: z.string().min(1),
  title: z.string().min(10).max(90),
  description: z.string().min(50).max(180),
  publishedAt: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).min(1),
  featured: z.boolean().nullable(),
  seoTitle: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(180).nullable().optional(),
  mainImage: sanityImageSchema.nullable().optional(),
  bodyPreview: z.array(sanityPortableTextBlockSchema).default([]),
}).passthrough();

export const sanityBlogPostSummariesSchema: z.ZodType<SanityBlogPostSummary[]> = z.array(
  sanityBlogPostSummarySchema,
);

export const sanityWebhookPayloadSchema = z.object({
  _type: z.string().min(1),
  _id: z.string().min(1).optional(),
  slug: z.object({
    current: z.string().min(1).optional(),
  }).optional(),
});

const getPortableTextPlainText = (
  blocks: SanityBlogPost["body"] | SanityBlogPostSummary["bodyPreview"] | undefined,
): string => {
  if (!blocks?.length) {
    return "";
  }

  return blocks
    .flatMap((block) => {
      if (block._type !== "block") {
        return [];
      }

      return block.children?.map((child) => child.text || "") || [];
    })
    .join(" ")
    .trim();
};

const getReadingTimeMinutes = (
  post: Pick<SanityBlogPost, "body"> | Pick<SanityBlogPostSummary, "bodyPreview">,
): number => {
  const contentBlocks = "body" in post ? post.body : post.bodyPreview;
  const stats = readingTime(getPortableTextPlainText(contentBlocks));
  return Math.max(1, Math.ceil(stats.minutes));
};

export const getSanityImageUrl = (
  image: SanityBlogPost["mainImage"],
  width: number,
): string | undefined => urlForSanityImage(image)?.width(width).fit("max").url();

type SanityFrontmatterSource = Pick<
  SanityBlogPost,
  "title" | "description" | "publishedAt" | "category" | "tags" | "featured" | "seoTitle" | "seoDescription" | "mainImage"
>;

const mapSanityFrontmatter = (post: SanityFrontmatterSource, imageWidth: number): BlogFrontmatter => ({
  title: post.title,
  description: post.description,
  publishedAt: post.publishedAt,
  category: post.category,
  tags: post.tags,
  featured: post.featured ?? undefined,
  image: getSanityImageUrl(post.mainImage, imageWidth),
  seoTitle: post.seoTitle ?? undefined,
  seoDescription: post.seoDescription ?? undefined,
});

export const mapSanityPostSummaryToBlogMetadata = (post: SanityBlogPostSummary): BlogPostMetadata => ({
  slug: post.slug,
  source: "sanity",
  frontmatter: mapSanityFrontmatter(post, 1600),
  readingTime: getReadingTimeMinutes(post),
});

export const mapSanityPostToBlogMetadata = (post: SanityBlogPost): BlogPostMetadata => ({
  slug: post.slug,
  source: "sanity",
  frontmatter: mapSanityFrontmatter(post, 1600),
  readingTime: getReadingTimeMinutes(post),
});

export const mapSanityPostToBlogPost = (post: SanityBlogPost): BlogPost => ({
  slug: post.slug,
  source: "sanity",
  frontmatter: mapSanityFrontmatter(post, 1800),
  portableText: post.body,
  readingTime: getReadingTimeMinutes(post),
});

export const mapSanityPostToApiContract = (post: SanityBlogPost) => ({
  slug: post.slug,
  title: post.title,
  description: post.description,
  publishedAt: post.publishedAt,
  category: post.category,
  tags: post.tags,
  featured: post.featured ?? false,
  seoTitle: post.seoTitle ?? undefined,
  seoDescription: post.seoDescription ?? undefined,
  image: getSanityImageUrl(post.mainImage, 1600),
  body: post.body,
});

export async function fetchSanityPosts(): Promise<SanityBlogPost[]> {
  if (!sanityClient) {
    throw new Error("Sanity client is not configured");
  }

  const posts = await sanityClient.fetch<SanityGeneratedBlogPosts>(
    sanityPostsQuery,
    {},
    {
      cache: "force-cache",
      next: {
        tags: [CACHE_TAGS.blogPosts],
      },
    },
  );

  return sanityBlogPostsSchema.parse(posts);
}

export async function fetchSanityPostSummaries(): Promise<SanityBlogPostSummary[]> {
  return fetchPaginatedSanityPostSummaries({ page: 1, pageSize: 100 });
}

export async function fetchPaginatedSanityPostSummaries({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}): Promise<SanityBlogPostSummary[]> {
  if (!sanityClient) {
    throw new Error("Sanity client is not configured");
  }

  const start = Math.max(0, (page - 1) * pageSize);
  const end = start + pageSize;

  const posts = await sanityClient.fetch<SanityGeneratedBlogPostSummaries>(
    sanityPostSummariesQuery,
    { start, end },
    {
      cache: "force-cache",
      next: {
        tags: [CACHE_TAGS.blogPosts],
      },
    },
  );

  return sanityBlogPostSummariesSchema.parse(posts);
}

export async function fetchSanityPostCount(): Promise<number> {
  if (!sanityClient) {
    throw new Error("Sanity client is not configured");
  }

  const count = await sanityClient.fetch<SanityGeneratedBlogPostCount>(
    sanityPostCountQuery,
    {},
    {
      cache: "force-cache",
      next: {
        tags: [CACHE_TAGS.blogPosts],
      },
    },
  );

  return z.number().int().nonnegative().parse(count);
}

export async function fetchSanityPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  if (!sanityClient) {
    throw new Error("Sanity client is not configured");
  }

  const post = await sanityClient.fetch<SanityGeneratedBlogPostResult>(
    sanityPostBySlugQuery,
    { slug },
    {
      cache: "force-cache",
      next: {
        tags: [CACHE_TAGS.blogPosts],
      },
    },
  );

  if (!post) {
    return null;
  }

  return sanityBlogPostSchema.parse(post as SanityGeneratedBlogPost);
}
