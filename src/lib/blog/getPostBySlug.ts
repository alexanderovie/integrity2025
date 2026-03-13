import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, BlogFrontmatter } from "./types";
import { sanityClient, isSanityEnabled } from "@/sanity/lib/client";
import { urlForSanityImage } from "@/sanity/lib/image";
import { sanityPostBySlugQuery } from "@/sanity/lib/queries";
import type { SanityBlogPost, SanityPortableTextBlock } from "@/sanity/types";

const postsDirectory = path.join(process.cwd(), "content/blog/posts");

/**
 * Validates that frontmatter has all required fields
 * Uses modern TypeScript type narrowing with unknown
 */
function validateFrontmatter(data: unknown): data is BlogFrontmatter {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    typeof obj.title === "string" &&
    typeof obj.description === "string" &&
    typeof obj.publishedAt === "string" &&
    typeof obj.category === "string" &&
    Array.isArray(obj.tags) &&
    obj.tags.every((tag) => typeof tag === "string") &&
    (obj.featured === undefined || typeof obj.featured === "boolean") &&
    (obj.image === undefined || typeof obj.image === "string")
  );
}

/**
 * Gets a single blog post by slug
 * @param slug - The slug of the post (derived from filename or frontmatter)
 * @returns Blog post with full content, or null if not found
 */
const getPortableTextPlainText = (blocks: SanityPortableTextBlock[] | undefined): string => {
  if (!blocks?.length) {
    return "";
  }

  return blocks
    .flatMap((block) => block.children?.map((child) => child.text || "") || [])
    .join(" ")
    .trim();
};

function getLocalPostBySlug(slug: string): BlogPost | null {
  if (!fs.existsSync(postsDirectory)) {
    return null;
  }

  const fileNames = fs.readdirSync(postsDirectory);

  for (const fileName of fileNames) {
    // Only process .mdx files
    if (!fileName.endsWith(".mdx")) {
      continue;
    }

    // Check if filename matches slug
    const fileSlug = fileName.replace(/\.mdx$/, "");
    if (fileSlug !== slug) {
      continue;
    }

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Validate frontmatter structure
    if (!validateFrontmatter(data)) {
      console.warn(
        `⚠️ Post ${slug} has invalid frontmatter structure`
      );
      return null;
    }

    // Calculate reading time
    const stats = readingTime(content);
    const readingTimeMinutes = Math.ceil(stats.minutes);

    return {
      slug,
      source: "mdx",
      frontmatter: data,
      content,
      readingTime: readingTimeMinutes,
    };
  }

  return null;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (isSanityEnabled && sanityClient) {
    try {
      const post = await sanityClient.fetch<SanityBlogPost | null>(sanityPostBySlugQuery, { slug });

      if (post) {
        const readingStats = readingTime(getPortableTextPlainText(post.body));

        return {
          slug: post.slug,
          source: "sanity",
          frontmatter: {
            title: post.title,
            description: post.description,
            publishedAt: post.publishedAt,
            category: post.category,
            tags: post.tags || [],
            featured: post.featured,
            image: post.mainImage ? urlForSanityImage(post.mainImage)?.width(1800).fit("max").url() : undefined,
            seoTitle: post.seoTitle,
            seoDescription: post.seoDescription,
          },
          portableText: post.body,
          readingTime: Math.max(1, Math.ceil(readingStats.minutes)),
        };
      }
    } catch (error) {
      console.warn(`⚠️ Falling back to local blog post for slug ${slug}`, error);
    }
  }

  return getLocalPostBySlug(slug);
}
