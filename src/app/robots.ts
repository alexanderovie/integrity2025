import type { MetadataRoute } from "next";

const CANONICAL_BASE_URL = "https://www.integritycleansolutions.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${CANONICAL_BASE_URL}/sitemap.xml`,
    host: CANONICAL_BASE_URL.replace(/^https?:\/\//, ""),
  };
}

