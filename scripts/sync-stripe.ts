import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

import { getSupabaseServiceRoleClient } from "@/lib/db/supabase-admin";
import { syncStripeProduct, syncStripePrice } from "@/lib/pricing/stripe-sync";
import { stripe } from "@/lib/stripe";

const PRODUCTS_PAGE_SIZE = 100;
const PRICES_PAGE_SIZE = 100;

const setTenantContext = async (supabase: SupabaseClient, tenantId: string): Promise<void> => {
  const { error } = await supabase.rpc("set_app_current_tenant", { tenant_uuid: tenantId });
  if (error) {
    throw error;
  }
};

const listAllProducts = async (): Promise<Stripe.Product[]> => {
  const products: Stripe.Product[] = [];
  let startingAfter: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await stripe.products.list({
      limit: PRODUCTS_PAGE_SIZE,
      starting_after: startingAfter,
    });

    products.push(...response.data);
    hasMore = response.has_more;
    startingAfter = response.data.length ? response.data[response.data.length - 1].id : undefined;
  }

  return products;
};

const listPricesForProduct = async (productId: string): Promise<Stripe.Price[]> => {
  const prices: Stripe.Price[] = [];
  let startingAfter: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await stripe.prices.list({
      product: productId,
      limit: PRICES_PAGE_SIZE,
      starting_after: startingAfter,
    });

    prices.push(...response.data);
    hasMore = response.has_more;
    startingAfter = response.data.length ? response.data[response.data.length - 1].id : undefined;
  }

  return prices;
};

const sync = async (): Promise<void> => {
  const products = await listAllProducts();
  let syncedProducts = 0;
  let syncedPrices = 0;

  const productsByTenant = products.reduce<Record<string, Stripe.Product[]>>((acc, product) => {
    const tenantId = product.metadata?.tenant_id;
    if (!tenantId) {
      console.warn("Skipping product without tenant metadata:", product.id);
      return acc;
    }
    acc[tenantId] ??= [];
    acc[tenantId].push(product);
    return acc;
  }, {});

  for (const [tenantId, tenantProducts] of Object.entries(productsByTenant)) {
    const supabase = getSupabaseServiceRoleClient();
    await setTenantContext(supabase, tenantId);

    for (const product of tenantProducts) {
      await syncStripeProduct(product, supabase, { tenantId });
      syncedProducts += 1;

      const prices = await listPricesForProduct(product.id);
      for (const price of prices) {
        await syncStripePrice(price, supabase, { tenantId });
        syncedPrices += 1;
      }
    }
  }

  console.log(`Sync complete – products: ${syncedProducts}, prices: ${syncedPrices}`);
};

sync().catch((error) => {
  console.error("sync-stripe failed:", error);
  process.exit(1);
});
