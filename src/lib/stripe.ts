import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

const getStripeSecretKey = (): string => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return key;
};

/**
 * Lazy-loaded Stripe instance
 * Only initializes when first accessed, not at module load time
 */
export const getStripeInstance = (): Stripe => {
  if (!stripeInstance) {
    stripeInstance = new Stripe(getStripeSecretKey(), {
      typescript: true,
    });
  }
  return stripeInstance;
};

/**
 * Get Stripe instance (lazy-loaded)
 * Use this instead of direct stripe export to avoid build-time initialization
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripeInstance()[prop as keyof Stripe];
  },
});

export const getStripe = async (): Promise<
  ReturnType<typeof import("@stripe/stripe-js").loadStripe> | null
> => {
  if (typeof window !== "undefined") {
    const { loadStripe } = await import("@stripe/stripe-js");
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
      return null;
    }
    return loadStripe(publishableKey);
  }
  return null;
};

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image?: string;
}

export const CLEANING_SERVICES: ServiceItem[] = [
  {
    id: "regular-cleaning",
    name: "Limpieza Regular",
    description:
      "Servicio de limpieza semanal o quincenal para hogares y oficinas",
    price: 15000,
    currency: "usd",
  },
  {
    id: "deep-cleaning",
    name: "Limpieza Profunda",
    description: "Limpieza exhaustiva incluyendo áreas que normalmente no se limpian",
    price: 30000,
    currency: "usd",
  },
  {
    id: "move-in-out",
    name: "Limpieza de Mudanza",
    description: "Limpieza completa para mudanzas (entrada o salida)",
    price: 25000,
    currency: "usd",
  },
  {
    id: "post-construction",
    name: "Limpieza Post-Construcción",
    description: "Limpieza especializada después de trabajos de construcción",
    price: 50000,
    currency: "usd",
  },
  {
    id: "commercial-cleaning",
    name: "Limpieza Comercial",
    description: "Servicio de limpieza para oficinas y espacios comerciales",
    price: 35000,
    currency: "usd",
  },
];
