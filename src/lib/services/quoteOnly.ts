export const QUOTE_ONLY_SERVICE_SLUGS = ["airbnb-cleaning"] as const;

export type QuoteOnlyServiceSlug = (typeof QUOTE_ONLY_SERVICE_SLUGS)[number];

export const isQuoteOnlyService = (slug?: string | null): slug is QuoteOnlyServiceSlug => {
  return Boolean(slug && QUOTE_ONLY_SERVICE_SLUGS.includes(slug as QuoteOnlyServiceSlug));
};

export const getQuoteOnlyCtaLabel = (slug?: string | null): string => {
  if (slug === "airbnb-cleaning") {
    return "Request Airbnb Quote";
  }

  return "Request a Quote";
};

export const getQuoteOnlyNotice = (slug?: string | null): { title: string; text: string } => {
  if (slug === "airbnb-cleaning") {
    return {
      title: "CUSTOM TURNOVER QUOTE",
      text: "Airbnb and short-term rental turnovers depend on bedrooms, laundry, restocking, check-in timing, and guest-ready setup. Share the property details and we will prepare a custom quote before payment.",
    };
  }

  return {
    title: "CUSTOM QUOTE REQUIRED",
    text: "This service needs review before payment so we can price the scope correctly.",
  };
};
