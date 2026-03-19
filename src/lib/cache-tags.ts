export const CACHE_TAGS = {
  blogPosts: "blog-posts",
  stripeServicePrices: "stripe-service-prices",
  servicesCatalog: "services-catalog",
} as const;

export const CACHE_REVALIDATE_SECONDS = {
  blogPosts: false,
  stripeServicePrices: 300,
  servicesCatalog: 300,
} as const;
