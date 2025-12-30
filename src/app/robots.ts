import type { MetadataRoute } from "next";

/**
 * Robots.txt - Enterprise-Grade Configuration
 *
 * Follows patterns used by:
 * - Vercel: Dynamic robots.txt generation
 * - Stripe: Comprehensive crawling rules
 * - Linear: Type-safe robots configuration
 */

const BASE_URL = "https://integritycleansolutions.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/", // API routes should not be crawled
          "/admin/", // Admin routes (if any)
          "/_next/", // Next.js internal files
          "/private/", // Private routes (if any)
        ],
      },
      // Allow Googlebot full access
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/"],
      },
      // Allow Bingbot full access
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL.replace(/^https?:\/\//, ""),
  };
}
