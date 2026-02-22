import { services } from "@/app/api/services";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/urls/site";
import type { MetadataRoute } from "next";

/**
 * Dynamic Sitemap Generation - Enterprise-Grade
 *
 * Follows Next.js 16 App Router patterns used by:
 * - Vercel: Dynamic sitemap generation
 * - Stripe: Comprehensive URL coverage
 * - Linear: Type-safe sitemap implementation
 *
 * Automatically includes:
 * - All static pages
 * - All service pages (dynamic)
 * - All blog posts (dynamic)
 * - Proper priority and change frequency
 */

// Static pages with their priorities and change frequencies
const staticPages = [
  { path: "", priority: 1.0, changefreq: "weekly" as const },
  { path: "/about-us", priority: 0.8, changefreq: "monthly" as const },
  { path: "/services", priority: 0.9, changefreq: "weekly" as const },
  { path: "/service-areas", priority: 0.8, changefreq: "monthly" as const },
  { path: "/blog", priority: 0.9, changefreq: "weekly" as const },
  { path: "/contact-us", priority: 0.8, changefreq: "monthly" as const },
  { path: "/feedback", priority: 0.6, changefreq: "monthly" as const },
  { path: "/quote", priority: 0.9, changefreq: "weekly" as const },
  { path: "/success", priority: 0.5, changefreq: "monthly" as const },
  { path: "/privacy-policy", priority: 0.3, changefreq: "yearly" as const },
  { path: "/cookie-policy", priority: 0.3, changefreq: "yearly" as const },
  { path: "/terms-and-conditions", priority: 0.3, changefreq: "yearly" as const },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add static pages
  for (const page of staticPages) {
    sitemapEntries.push({
      url: absoluteUrl(page.path || "/"),
      lastModified: new Date(),
      changeFrequency: page.changefreq,
      priority: page.priority,
    });
  }

  // Add service pages (dynamic)
  for (const service of services) {
    sitemapEntries.push({
      url: absoluteUrl(`/services/${service.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    // Add friendly quote URLs for each service
    sitemapEntries.push({
      url: absoluteUrl(`/quote/${service.slug}`),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  // Add blog posts (dynamic)
  try {
    const posts = getAllPosts();
    for (const post of posts) {
      sitemapEntries.push({
        url: absoluteUrl(`/blog/${post.slug}`),
        lastModified: new Date(post.frontmatter.publishedAt),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    // Gracefully handle errors (e.g., if blog directory doesn't exist)
    console.warn("⚠️ Could not load blog posts for sitemap:", error);
  }

  return sitemapEntries;
}
