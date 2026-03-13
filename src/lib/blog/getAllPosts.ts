import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { unstable_cache } from "next/cache";
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

/**
 * Creates a map of slugs to images from local MDX files
 * Used as fallback when Sanity posts don't have images
 */
function getLocalImageMap(): Map<string, string> {
  const imageMap = new Map<string, string>();
  
  if (!fs.existsSync(postsDirectory)) {
    return imageMap;
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  for (const fileName of fileNames) {
    if (!fileName.endsWith(".mdx")) {
      continue;
    }

    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    // Validate frontmatter and extract image
    if (validateFrontmatter(data) && data.image) {
      const slug = fileName.replace(/\.mdx$/, "");
      imageMap.set(slug, data.image);
    }
  }
  
  return imageMap;
}

const mapSanityPostWithFallback = (
  post: SanityBlogPost, 
  localImageMap: Map<string, string>
): BlogPostMetadata => {
  const readingStats = readingTime(getPortableTextPlainText(post.body));
  
  // Try to get image from Sanity
  let image = post.mainImage ? urlForSanityImage(post.mainImage)?.width(1600).fit("max").url() : undefined;
  
  // Fallback to local MDX image if Sanity has no image
  if (!image && localImageMap.has(post.slug)) {
    image = localImageMap.get(post.slug);
  }

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
      image,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
    },
    readingTime: Math.max(1, Math.ceil(readingStats.minutes)),
  };
};

/**
 * Fetch posts from Sanity with caching
 * Uses unstable_cache for ISR with tag-based revalidation
 * Cache is invalidated when Sanity webhook calls revalidateTag('post')
 */
const fetchSanityPosts = unstable_cache(
  async (localImageMap: Map<string, string>): Promise<BlogPostMetadata[]> => {
    if (!sanityClient) {
      throw new Error("Sanity client not initialized");
    }
    
    const sanityPosts = await sanityClient.fetch<SanityBlogPost[]>(sanityPostsQuery);
    
    if (sanityPosts.length === 0) {
      throw new Error("No posts found in Sanity");
    }
    
    return sanityPosts.map(post => mapSanityPostWithFallback(post, localImageMap));
  },
  ["sanity-posts"], // Cache key
  {
    revalidate: false, // Never auto-revalidate, use webhook instead
    tags: ["post"], // Tag for on-demand revalidation
  }
);

export async function getAllPosts(): Promise<BlogPostMetadata[]> {
  // Load local images as fallback
  const localImageMap = getLocalImageMap();
  
  if (isSanityEnabled && sanityClient) {
    try {
      // Use cached fetch with tag-based revalidation
      return await fetchSanityPosts(localImageMap);
    } catch (error) {
      console.warn("⚠️ Falling back to local blog posts because Sanity fetch failed", error);
    }
  }

  return getAllLocalPosts();
}
