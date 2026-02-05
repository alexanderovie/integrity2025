/**
 * Quote URL Utilities - Client-Safe Version
 *
 * Static utilities that don't require DB access
 * Safe for use in client components
 */

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
 * Client-safe synchronous version for use in client components
 */
export function resolveServiceSlugSync(input: string | null | undefined): string | null {
  if (!input) return null;
  return resolveFromStaticList(input);
}

/**
 * Client-safe slug validation
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
    preferredDate?: string;
    serviceDate?: string;
    timeSlot?: string;
  },
): string {
  const safeSlug = serviceSlug && serviceSlug.trim().length > 0 ? serviceSlug : "regular-cleaning";
  const baseUrl = `/quote/${safeSlug}`;

  if (!params || Object.keys(params).length === 0) {
    return baseUrl;
  }

  const searchParams = new URLSearchParams();

  if (params.name) searchParams.set("name", params.name);
  if (params.email) searchParams.set("email", params.email);
  if (params.phone) searchParams.set("phone", params.phone);
  if (params.zipCode) searchParams.set("zipCode", params.zipCode);
  if (params.preferredDate) searchParams.set("preferredDate", params.preferredDate);
  if (params.serviceDate) searchParams.set("serviceDate", params.serviceDate);
  if (params.timeSlot) searchParams.set("timeSlot", params.timeSlot);

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
