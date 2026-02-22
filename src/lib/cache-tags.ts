export const CACHE_TAGS = {
  stripeServicePrices: "stripe-service-prices",
  servicesCatalog: "services-catalog",
} as const;

export const CACHE_REVALIDATE_SECONDS = {
  stripeServicePrices: 300,
  servicesCatalog: 300,
} as const;
