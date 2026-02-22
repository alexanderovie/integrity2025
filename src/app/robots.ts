import type { MetadataRoute } from "next";
import { SITE_URL_OBJECT, absoluteUrl } from "@/lib/urls/site";

/**
 * Robots.txt - Enterprise-Grade Configuration
 *
 * Follows patterns used by:
 * - Vercel: Dynamic robots.txt generation
 * - Stripe: Comprehensive crawling rules
 * - Linear: Type-safe robots configuration
 */

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
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL_OBJECT.host,
  };
}
