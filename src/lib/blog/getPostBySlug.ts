import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, BlogFrontmatter } from "./types";

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
export function getPostBySlug(slug: string): BlogPost | null {
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
      frontmatter: data,
      content,
      readingTime: readingTimeMinutes,
    };
  }

  return null;
}
