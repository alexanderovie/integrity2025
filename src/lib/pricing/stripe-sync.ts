import Stripe from "stripe";
import { type SupabaseClient } from "@supabase/supabase-js";

import { stripe } from "@/lib/stripe";

type SyncOptions = {
  stripeAccount?: string;
  tenantId?: string;
};

const parseJson = (value?: string): Record<string, unknown> | undefined => {
  if (!value) {
    return undefined;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Unable to parse JSON metadata value", value, error);
    return undefined;
  }
};

const getStripeRequestOptions = (stripeAccount?: string): Stripe.RequestOptions | undefined => {
  if (!stripeAccount) {
    return undefined;
  }
  return { stripeAccount };
};

const getMetadata = (object: { metadata?: Stripe.Metadata }): Stripe.Metadata => {
  return object.metadata ?? {};
};

const normalizePlanKey = (metadata: Stripe.Metadata, fallback: string): string => {
  const candidate = metadata.plan_key || metadata.service_slug;
  if (candidate && candidate.length > 0) {
    return candidate;
  }
  return fallback;
};

const parseDisplayOrder = (metadata: Stripe.Metadata): number => {
  const raw = metadata.display_order ?? metadata.order;
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) {
    return parsed;
  }
  return 100;
};

const resolveTenantFromMetadata = (metadata: Stripe.Metadata | undefined): string | undefined => {
  if (!metadata) return undefined;
  return metadata.tenant_id;
};

const isDeletedStripeProduct = (product: Stripe.Product): boolean => {
  const deletedFlag = (product as { deleted?: boolean }).deleted;
  return deletedFlag === true;
};

export const getTenantByStripeAccount = async (
  supabase: SupabaseClient,
  stripeAccountId?: string,
): Promise<string | undefined> => {
  if (!stripeAccountId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("stripe_connected_account_id", stripeAccountId)
    .maybeSingle();

  if (error) {
    console.error("Error looking up tenant by Stripe account", error);
    return undefined;
  }

  return data?.id ?? undefined;
};

const getPlanByProductId = async (
  supabase: SupabaseClient,
  productId: string,
): Promise<{
  id: string;
  tenant_id: string;
  features?: Record<string, unknown>;
  limits?: Record<string, unknown>;
  display_order?: number;
} | null> => {
  const { data } = await supabase
    .from("plans")
    .select("id, tenant_id, features, limits, display_order")
    .eq("stripe_product_id", productId)
    .maybeSingle();
  if (!data) {
    return null;
  }
  return {
    id: data.id,
    tenant_id: data.tenant_id,
    features: data.features ?? undefined,
    limits: data.limits ?? undefined,
    display_order: data.display_order ?? undefined,
  };
};

const getPlanAndTenantByPriceId = async (
  supabase: SupabaseClient,
  priceId: string,
): Promise<{ plan_id: string; tenant_id: string } | null> => {
  const { data } = await supabase
    .from("plan_prices")
    .select("plan_id, plans (tenant_id)")
    .eq("stripe_price_id", priceId)
    .maybeSingle();

  if (!data) {
    return null;
  }

  const relatedTenantId = data.plans?.[0]?.tenant_id;
  if (!relatedTenantId) {
    return null;
  }

  return {
    plan_id: data.plan_id,
    tenant_id: relatedTenantId,
  };
};

const buildPlanPayload = (
  product: Stripe.Product,
  tenantId: string,
  existing: { features?: Record<string, unknown>; limits?: Record<string, unknown>; display_order?: number } | null,
) => {
  const metadata = getMetadata(product);
  const features = parseJson(metadata.features) ?? existing?.features ?? {};
  const limits = parseJson(metadata.limits) ?? existing?.limits ?? {};
  const serviceSlug = metadata.service_slug || metadata.plan_key || metadata.service || product.name || product.id;
  const planKey = normalizePlanKey(metadata, serviceSlug ?? product.id);
  const displayOrder = parseDisplayOrder(metadata);
  const isDeleted = isDeletedStripeProduct(product);

  return {
    tenant_id: tenantId,
    stripe_product_id: product.id,
    service_slug: serviceSlug ?? "",
    plan_key: planKey,
    name: product.name ?? planKey,
    description: product.description ?? "",
    category: metadata.category ?? null,
    display_order: Number.isFinite(displayOrder) ? displayOrder : 100,
    active: !isDeleted && product.active !== false,
    features,
    limits,
    metadata,
    updated_at: new Date().toISOString(),
  };
};

export const syncStripeProduct = async (
  product: Stripe.Product,
  supabase: SupabaseClient,
  options: SyncOptions = {},
): Promise<{ planId: string; tenantId: string }> => {
  const metadataTenant = resolveTenantFromMetadata(product.metadata);
  const planRow = await getPlanByProductId(supabase, product.id);
  const tenantFromAccount = options.tenantId ?? (options.stripeAccount ? await getTenantByStripeAccount(supabase, options.stripeAccount) : undefined);
  const tenantId = metadataTenant ?? tenantFromAccount ?? planRow?.tenant_id;

  if (!tenantId) {
    throw new Error("Unable to resolve tenant for Stripe product");
  }

  const payload = buildPlanPayload(product, tenantId, planRow ? { features: planRow.features, limits: planRow.limits, display_order: planRow.display_order } : null);

  if (planRow) {
    await supabase.from("plans").update(payload).eq("id", planRow.id);
    return { planId: planRow.id, tenantId };
  }

  const { data, error } = await supabase.from("plans").insert(payload).select("id").single();
  if (error || !data) {
    throw new Error(`Unable to insert plan: ${error?.message ?? "unknown error"}`);
  }

  return { planId: data.id, tenantId };
};

export const deactivateStripeProduct = async (
  productId: string,
  supabase: SupabaseClient,
): Promise<void> => {
  const plan = await getPlanByProductId(supabase, productId);
  if (!plan) {
    return;
  }

  await supabase.from("plans").update({
    active: false,
    updated_at: new Date().toISOString(),
  }).eq("id", plan.id);

  await supabase.from("plan_prices").update({
    active: false,
    updated_at: new Date().toISOString(),
  }).eq("plan_id", plan.id);
};

const DEFAULT_PRICE_TYPE = "base";

export const syncStripePrice = async (
  price: Stripe.Price,
  supabase: SupabaseClient,
  options: SyncOptions = {},
): Promise<{ planId: string; priceId: string; tenantId: string }> => {
  const metadataTenant = resolveTenantFromMetadata(price.metadata);
  const planEntry = await getPlanByProductId(
    supabase,
    typeof price.product === "string" ? price.product : price.product?.id ?? "",
  );

  const tenantFromPlan = planEntry?.tenant_id;
  const tenantFromAccount = options.tenantId ?? (options.stripeAccount ? await getTenantByStripeAccount(supabase, options.stripeAccount) : undefined);
  const tenantId = metadataTenant ?? tenantFromPlan ?? tenantFromAccount;

  if (!tenantId) {
    throw new Error("Unable to resolve tenant for Stripe price");
  }

  const planId = planEntry?.id ?? (await syncStripeProduct(
    await stripe.products.retrieve(
      typeof price.product === "string" ? price.product : price.product?.id ?? "",
      undefined,
      getStripeRequestOptions(options.stripeAccount),
    ),
    supabase,
    { stripeAccount: options.stripeAccount, tenantId },
  )).planId;

  const metadata = getMetadata(price);
  const priceType = (metadata.price_type as string) ?? DEFAULT_PRICE_TYPE;
  const lookupKey = price.lookup_key ?? metadata.lookup_key ?? null;

  const payload = {
    plan_id: planId,
    stripe_price_id: price.id,
    lookup_key: lookupKey,
    price_type: priceType,
    unit_amount: price.unit_amount ?? 0,
    currency: price.currency ?? "usd",
    interval: price.recurring?.interval ?? null,
    billing_scheme: price.billing_scheme ?? null,
    recurring: price.recurring ?? null,
    metadata,
    active: price.active !== false,
    updated_at: new Date().toISOString(),
  };

  const { data } = await supabase
    .from("plan_prices")
    .select("id")
    .eq("stripe_price_id", price.id)
    .maybeSingle();

  if (data?.id) {
    await supabase.from("plan_prices").update(payload).eq("id", data.id);
    return { planId, priceId: price.id, tenantId };
  }

  const { error } = await supabase.from("plan_prices").insert(payload);
  if (error) {
    throw new Error(`Unable to insert plan price: ${error.message}`);
  }

  return { planId, priceId: price.id, tenantId };
};

export const deactivateStripePrice = async (
  priceId: string,
  supabase: SupabaseClient,
): Promise<void> => {
  await supabase.from("plan_prices").update({
    active: false,
    updated_at: new Date().toISOString(),
  }).eq("stripe_price_id", priceId);
};

export const resolveTenantIdForEvent = async (
  event: Stripe.Event,
  supabase: SupabaseClient,
): Promise<string | undefined> => {
  const metadata = getMetadata(event.data.object as { metadata?: Stripe.Metadata });
  if (metadata.tenant_id) {
    return metadata.tenant_id;
  }

  if (event.account) {
    const accountTenant = await getTenantByStripeAccount(supabase, event.account);
    if (accountTenant) {
      return accountTenant;
    }
  }

  if (event.type.startsWith("product.")) {
    const product = event.data.object as Stripe.Product;
    const plan = await getPlanByProductId(supabase, product.id);
    if (plan) {
      return plan.tenant_id;
    }
  }

  if (event.type.startsWith("price.")) {
    const price = event.data.object as Stripe.Price;
    const record = await getPlanAndTenantByPriceId(supabase, price.id);
    if (record) {
      return record.tenant_id;
    }
  }

  return undefined;
};
