import { query } from "@/lib/db/neon";
import PricingClient from "./PricingClient";

const QUERY_TIMEOUT_MS = 4000;

const PRICING_ICONS: Record<string, string> = {
  "regular-cleaning": "/images/home/Pricing/pricing-icon-1.svg",
  "deep-cleaning": "/images/home/Pricing/pricing-icon-2.svg",
  "move-in-out-cleaning": "/images/home/Pricing/pricing-icon-3.svg",
  "post-construction-cleaning": "/images/home/Pricing/pricing-icon-4.svg",
};

const FALLBACK_ICON = "/images/home/Pricing/pricing-icon-1.svg";

const FALLBACK_DESCRIPTION = "Professional cleaning tailored to your home and schedule.";

type PricingService = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  display_order: number | null;
};

const FALLBACK_PRICING_SERVICES: PricingService[] = [
  {
    id: "fallback-regular-cleaning",
    slug: "regular-cleaning",
    nombre: "Regular Cleaning",
    descripcion: "Recurring home cleaning tailored to weekly, bi-weekly, or monthly schedules.",
    precio_base: 12000,
    display_order: 1,
  },
  {
    id: "fallback-deep-cleaning",
    slug: "deep-cleaning",
    nombre: "Deep Cleaning",
    descripcion: "Detailed top-to-bottom cleaning for kitchens, bathrooms, baseboards, and high-touch surfaces.",
    precio_base: 25000,
    display_order: 2,
  },
  {
    id: "fallback-move-in-out-cleaning",
    slug: "move-in-out-cleaning",
    nombre: "Move In/Out Cleaning",
    descripcion: "Inspection-ready cleaning support for move-ins, move-outs, and turnover days.",
    precio_base: 30000,
    display_order: 3,
  },
  {
    id: "fallback-commercial-cleaning",
    slug: "commercial-cleaning",
    nombre: "Commercial Cleaning",
    descripcion: "Custom janitorial support for offices, clinics, rentals, and business facilities.",
    precio_base: 0,
    display_order: 4,
  },
];

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

const getPricingServices = async () => {
  try {
    return await withTimeout(
      query<PricingService>(
        `SELECT id, slug, nombre, descripcion, precio_base, display_order
         FROM public.services
         WHERE activo = true
         ORDER BY display_order ASC NULLS LAST, nombre ASC`
      ),
      QUERY_TIMEOUT_MS,
    );
  } catch (error) {
    console.error("Failed to load pricing services, using fallback data", error);
    return FALLBACK_PRICING_SERVICES;
  }
};

const Pricing = async () => {
  const services = await getPricingServices();

  const items = services.map((service) => ({
    id: service.id,
    slug: service.slug,
    title: service.nombre,
    description: service.descripcion || FALLBACK_DESCRIPTION,
    price: (service.precio_base / 100).toFixed(0),
    icon: PRICING_ICONS[service.slug] || FALLBACK_ICON,
  }));

  return <PricingClient items={items} />;
};

export default Pricing;
