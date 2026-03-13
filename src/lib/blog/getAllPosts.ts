import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPostMetadata, BlogFrontmatter } from "./types";
import { sanityClient, isSanityEnabled } from "@/sanity/lib/client";
import { sanityPostsQuery } from "@/sanity/lib/queries";
import { urlForSanityImage } from "@/sanity/lib/image";
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
 * Gets all blog posts from the file system
 * Sorted by publishedAt descending (newest first)
 * @returns Array of blog post metadata (without full content)
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

const mapSanityPost = (post: SanityBlogPost): BlogPostMetadata => {
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
      image: post.mainImage ? urlForSanityImage(post.mainImage)?.width(1600).fit("max").url() : undefined,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
    },
    readingTime: Math.max(1, Math.ceil(readingStats.minutes)),
  };
};

function getAllLocalPosts(): BlogPostMetadata[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPosts: BlogPostMetadata[] = [];

  for (const fileName of fileNames) {
    // Only process .mdx files
    if (!fileName.endsWith(".mdx")) {
      continue;
    }

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Validate frontmatter structure
    if (!validateFrontmatter(data)) {
      console.warn(
        `⚠️ Skipping ${fileName}: Invalid frontmatter structure`
      );
      continue;
    }

    // Derive slug from filename (remove .mdx extension)
    const slug = fileName.replace(/\.mdx$/, "");

    // Calculate reading time
    const stats = readingTime(content);
    const readingTimeMinutes = Math.ceil(stats.minutes);

    allPosts.push({
      slug,
      source: "mdx",
      frontmatter: data,
      readingTime: readingTimeMinutes,
    });
  }

  // Sort by publishedAt descending (newest first)
  return allPosts.sort((a, b) => {
    const dateA = new Date(a.frontmatter.publishedAt).getTime();
    const dateB = new Date(b.frontmatter.publishedAt).getTime();
    return dateB - dateA;
  });
}

export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  if (isSanityEnabled && sanityClient) {
    try {
      const sanityPosts = await sanityClient.fetch<SanityBlogPost[]>(sanityPostsQuery);

      if (sanityPosts.length > 0) {
        return sanityPosts.map(mapSanityPost);
      }
    } catch (error) {
      console.warn("⚠️ Falling back to local blog posts because Sanity fetch failed", error);
    }
  }

  return getAllLocalPosts();
}
