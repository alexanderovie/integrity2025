import "server-only";

import { unstable_cache } from "next/cache";
import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { stripe } from "@/lib/stripe";

export type StripeServicePrice = {
  slug: string;
  priceId: string;
  productId: string;
  unitAmount: number;
  currency: string;
};

type StripeServicePriceMap = Record<string, StripeServicePrice>;

const fetchStripeServicePrices = async (): Promise<StripeServicePriceMap> => {
  try {
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    const serviceProducts = products.data.filter((product) => {
      return typeof product.metadata?.service_slug === "string" && product.metadata.service_slug.length > 0;
    });

    const priceEntries = await Promise.all(
      serviceProducts.map(async (product) => {
        const slug = product.metadata.service_slug as string;
        const prices = await stripe.prices.list({
          active: true,
          product: product.id,
          limit: 1,
        });

        const price = prices.data[0];
        if (!price || price.unit_amount === null) {
          return null;
        }

        return [slug, {
          slug,
          priceId: price.id,
          productId: product.id,
          unitAmount: price.unit_amount,
          currency: price.currency,
        }] as const;
      }),
    );

    const data = Object.fromEntries(
      priceEntries.filter((entry): entry is [string, StripeServicePrice] => Boolean(entry)),
    );
    return data;
  } catch (error) {
    console.error("[stripe-prices] Unable to load prices", error);
    return {};
  }
};

const getCachedStripeServicePrices = unstable_cache(
  fetchStripeServicePrices,
  [CACHE_TAGS.stripeServicePrices],
  {
    revalidate: CACHE_REVALIDATE_SECONDS.stripeServicePrices,
    tags: [CACHE_TAGS.stripeServicePrices],
  },
);

export const getStripeServicePrices = async (): Promise<StripeServicePriceMap> => {
  return getCachedStripeServicePrices();
};
