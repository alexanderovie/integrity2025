/**
 * Quote URL Utilities - Enterprise-Grade
 *
 * Provides utilities for generating friendly, SEO-optimized URLs
 * Client-safe version with static valid slugs
 */

import { query } from "@/lib/db/neon";

export const VALID_SERVICE_SLUGS = [
  'regular-cleaning',
  'deep-cleaning',
  'move-in-out-cleaning',
  'post-construction-cleaning',
  'carpet-cleaning',
  'commercial-cleaning',
  'airbnb-cleaning',
] as const;

export type ValidServiceSlug = typeof VALID_SERVICE_SLUGS[number];

/**
 * Get all valid service slugs from the database (server-only)
 */
export async function getAllServiceSlugs(): Promise<string[]> {
  try {
    const services = await query<{ slug: string }>(
      `SELECT slug FROM public.services WHERE activo = true ORDER BY display_order ASC`
    );
    return services.map(s => s.slug);
  } catch (error) {
    console.error('Error fetching service slugs:', error);
    return [...VALID_SERVICE_SLUGS];
  }
}

/**
 * Validates if a slug is a valid service slug (server-only)
 */
export async function isValidServiceSlug(slug: string): Promise<boolean> {
  const validSlugs = await getAllServiceSlugs();
  return validSlugs.includes(slug);
}

/**
 * Client-safe version: validates if slug is in static list
 */
export function isValidServiceSlugClient(slug: string): boolean {
  return VALID_SERVICE_SLUGS.includes(slug as ValidServiceSlug);
}

/**
 * Generates a friendly quote URL for a service
 */
export function getQuoteUrl(
  serviceSlug: string,
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

const LEGACY_MAPPINGS: Record<string, string> = {
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
  "carpet": "carpet-cleaning",
  "airbnb": "airbnb-cleaning",
  "vacation-rental": "airbnb-cleaning",
  "vrbo": "airbnb-cleaning",
};

function resolveFromStaticList(input: string): string | null {
  const normalized = input.toLowerCase().trim();

  if (VALID_SERVICE_SLUGS.includes(normalized as ValidServiceSlug)) {
    return normalized;
  }

  if (LEGACY_MAPPINGS[normalized]) {
    return LEGACY_MAPPINGS[normalized];
  }

  return null;
}

/**
 * Resolves service slug from various input formats (client-safe version)
 * Uses static list for client-side, DB lookup for server-side
 */
export async function resolveServiceSlug(input: string | null | undefined): Promise<string | null> {
  if (!input) return null;

  const staticResult = resolveFromStaticList(input);
  if (staticResult) {
    return staticResult;
  }

  try {
    const validSlugs = await getAllServiceSlugs();
    if (validSlugs.includes(input.toLowerCase().trim())) {
      return input.toLowerCase().trim();
    }
  } catch {
    console.warn('DB lookup failed, using static fallback');
  }

  return null;
}

/**
 * Client-only synchronous version for use in client components
 */
export function resolveServiceSlugSync(input: string | null | undefined): string | null {
  if (!input) return null;
  return resolveFromStaticList(input);
}
