import { config } from "dotenv";
import { Pool, type PoolClient } from "pg";
import Stripe from "stripe";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

type StripeServicePriceRow = {
  slug: string;
  productId: string;
  productName: string;
  priceId: string;
  unitAmount: number;
  currency: string;
};

type ExistingServiceRow = {
  id: string;
  slug: string;
  nombre: string;
  precio_base: number;
};

const APPLY_FLAG = "--apply";

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
};

const getMode = (): "dry-run" | "apply" => {
  return process.argv.includes(APPLY_FLAG) ? "apply" : "dry-run";
};

const loadStripeServicePrices = async (stripe: Stripe): Promise<StripeServicePriceRow[]> => {
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  });

  const serviceProducts = products.data.filter((product) => {
    return typeof product.metadata?.service_slug === "string" && product.metadata.service_slug.length > 0;
  });

  const productCountBySlug = serviceProducts.reduce<Record<string, number>>((counts, product) => {
    const slug = product.metadata.service_slug as string;
    counts[slug] = (counts[slug] || 0) + 1;
    return counts;
  }, {});

  const rows: StripeServicePriceRow[] = [];

  for (const product of serviceProducts) {
    const slug = product.metadata.service_slug as string;
    if (productCountBySlug[slug] !== 1) {
      throw new Error(`Stripe service_slug "${slug}" has ${productCountBySlug[slug]} active products.`);
    }

    const prices = await stripe.prices.list({
      active: true,
      product: product.id,
      type: "one_time",
      limit: 2,
    });

    if (prices.data.length !== 1) {
      throw new Error(`Stripe product "${product.id}" (${slug}) has ${prices.data.length} active one-time prices.`);
    }

    const price = prices.data[0];
    if (!price || price.unit_amount === null || price.currency !== "usd") {
      throw new Error(`Stripe product "${product.id}" (${slug}) must have a one-time USD price with unit_amount.`);
    }

    rows.push({
      slug,
      productId: product.id,
      productName: product.name,
      priceId: price.id,
      unitAmount: price.unit_amount,
      currency: price.currency,
    });
  }

  return rows.sort((left, right) => left.slug.localeCompare(right.slug));
};

const loadServices = async (client: PoolClient): Promise<ExistingServiceRow[]> => {
  const result = await client.query<ExistingServiceRow>(
    `SELECT id, slug, nombre, precio_base
     FROM public.services
     WHERE activo = true
     ORDER BY slug`,
  );
  return result.rows;
};

const applySync = async (
  client: PoolClient,
  rows: StripeServicePriceRow[],
): Promise<void> => {
  for (const row of rows) {
    const updateResult = await client.query(
      `UPDATE public.services
       SET precio_base = $2,
           stripe_product_id = $3,
           stripe_price_id = $4,
           stripe_price_currency = $5,
           stripe_price_synced_at = NOW(),
           stripe_price_sync_status = 'synced',
           stripe_price_sync_error = NULL,
           actualizado_en = NOW()
       WHERE slug = $1`,
      [row.slug, row.unitAmount, row.productId, row.priceId, row.currency],
    );

    if (updateResult.rowCount !== 1) {
      throw new Error(`No active service row matched Stripe service_slug "${row.slug}".`);
    }

    await client.query(
      `UPDATE public.service_pricing_rules
       SET min_price_cents = $2,
           updated_at = NOW()
       WHERE service_id IN (
         SELECT id FROM public.services WHERE slug = $1
       )`,
      [row.slug, row.unitAmount],
    );
  }
};

const main = async (): Promise<void> => {
  const mode = getMode();
  const stripeSecretKey = requireEnv("STRIPE_SECRET_KEY");
  const databaseUrl = requireEnv("DATABASE_URL");

  const stripe = new Stripe(stripeSecretKey);
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    const account = await stripe.accounts.retrieve();
    const stripeRows = await loadStripeServicePrices(stripe);
    const services = await loadServices(client);
    const servicesBySlug = new Map(services.map((service) => [service.slug, service]));

    const missingInNeon = stripeRows
      .filter((row) => !servicesBySlug.has(row.slug))
      .map((row) => row.slug);

    if (missingInNeon.length > 0) {
      throw new Error(`Stripe has service_slug values missing in Neon: ${missingInNeon.join(", ")}`);
    }

    const rows = stripeRows.map((row) => {
      const service = servicesBySlug.get(row.slug);
      return {
        slug: row.slug,
        stripeProduct: row.productName,
        stripeProductId: row.productId,
        stripePriceId: row.priceId,
        stripeAmount: row.unitAmount,
        currentNeonAmount: service?.precio_base ?? null,
        changed: service ? service.precio_base !== row.unitAmount : true,
      };
    });

    console.log(JSON.stringify({
      mode,
      stripeAccountId: account.id,
      stripeMode: stripeSecretKey.startsWith("sk_live_") ? "live" : "test",
      serviceCount: rows.length,
      rows,
    }, null, 2));

    if (mode === "dry-run") {
      console.log(`Dry run only. Re-run with ${APPLY_FLAG} to update Neon.`);
      return;
    }

    await client.query("BEGIN");
    await applySync(client, stripeRows);
    await client.query("COMMIT");

    console.log(`Applied Stripe service price sync for ${stripeRows.length} services.`);
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Stripe service price sync failed: ${message}`);
  process.exit(1);
});
