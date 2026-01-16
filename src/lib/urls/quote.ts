/**
 * Quote URL Utilities - Enterprise-Grade
 *
 * Follows patterns used by:
 * - Stripe: Clean, semantic URLs
 * - Vercel: Dynamic route generation
 * - Linear: Type-safe URL helpers
 *
 * Provides utilities for generating friendly, SEO-optimized URLs
 */

import { services } from "@/app/api/services";

/**
 * Service slug to friendly URL mapping
 * Ensures consistent URL structure across the application
 */
export const SERVICE_SLUGS = [
  "regular-cleaning",
  "deep-cleaning",
  "move-in-out-cleaning",
  "post-construction-cleaning",
  "commercial-cleaning",
  "carpet-cleaning",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/**
 * Validates if a slug is a valid service slug
 */
export function isValidServiceSlug(slug: string): slug is ServiceSlug {
  return SERVICE_SLUGS.includes(slug as ServiceSlug);
}

/**
 * Generates a friendly quote URL for a service
 *
 * @example
 * getQuoteUrl("regular-cleaning") // "/quote/regular-cleaning"
 * getQuoteUrl("regular-cleaning", { name: "John" }) // "/quote/regular-cleaning?name=John"
 */
export function getQuoteUrl(
  serviceSlug: ServiceSlug | string,
  params?: {
    name?: string;
    email?: string;
    phone?: string;
    zipCode?: string;
  },
): string {
  const baseUrl = `/quote/${serviceSlug}`;

  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();

  if (params.name) searchParams.set("name", params.name);
  if (params.email) searchParams.set("email", params.email);
  if (params.phone) searchParams.set("phone", params.phone);
  if (params.zipCode) searchParams.set("zipCode", params.zipCode);

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Gets all valid service slugs from the services array
 */
export function getAllServiceSlugs(): ServiceSlug[] {
  return services.map((service) => service.slug as ServiceSlug).filter(isValidServiceSlug);
}

/**
 * Resolves service slug from various input formats
 * Handles legacy formats and normalizes to current slug format
 */
export function resolveServiceSlug(input: string | null | undefined): ServiceSlug | null {
  if (!input) return null;

  const normalized = input.toLowerCase().trim();

  // Direct match
  if (isValidServiceSlug(normalized)) {
    return normalized;
  }

  // Legacy format mappings
  const legacyMappings: Record<string, ServiceSlug> = {
    "regular-cleaning": "regular-cleaning",
    "deep-cleaning": "deep-cleaning",
    "move-in-out": "move-in-out-cleaning",
    "move-in-clean": "move-in-out-cleaning",
    "move-out-clean": "move-in-out-cleaning",
    "movein-moveout": "move-in-out-cleaning",
    "post-construction": "post-construction-cleaning",
    "removal-storage": "post-construction-cleaning",
    "eco-friendly": "carpet-cleaning",
    "eco-friendly-cleaning": "carpet-cleaning",
    "post-renovation": "post-construction-cleaning",
    "post-renovation-cleaning": "post-construction-cleaning",
    "commercial": "commercial-cleaning",
    "commercial-cleaning": "commercial-cleaning",
    "carpet": "carpet-cleaning",
    "carpet-cleaning": "carpet-cleaning",
  };

  if (legacyMappings[normalized]) {
    return legacyMappings[normalized];
  }

  // Try to find in services array
  const service = services.find((s) => s.slug === normalized);
  if (service && isValidServiceSlug(service.slug)) {
    return service.slug as ServiceSlug;
  }

  return null;
}
