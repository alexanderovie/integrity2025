/**
 * Frontmatter metadata structure for blog posts
 * All fields except `featured` and `image` are required
 */
export interface BlogFrontmatter {
  title: string;
  description: string;
  publishedAt: string; // ISO date string
  category: string;
  tags: string[];
  featured?: boolean;
  image?: string;
}

/**
 * Complete blog post type including frontmatter and content
 */
export interface BlogPost {
  slug: string;
  frontmatter: BlogFrontmatter;
  content: string;
  readingTime: number; // in minutes
}

/**
 * Blog post metadata for listing pages (without full content)
 */
export interface BlogPostMetadata {
  slug: string;
  frontmatter: BlogFrontmatter;
  readingTime: number;
}
