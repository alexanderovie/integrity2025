import "server-only";

import { CACHE_REVALIDATE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { query } from "@/lib/db/neon";
import { logServicesFallback, withServicesTimeout } from "@/lib/services/shared";
import { unstable_cache } from "next/cache";

export type ServiceFrequency = {
  frecuencia: string;
  etiqueta: string;
  multiplicador: number;
};

export type ServiceCatalogItem = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  hero_icon: string | null;
  frecuencias: ServiceFrequency[];
};

const FALLBACK_SERVICES: ServiceCatalogItem[] = [
  {
    id: "fallback-regular-cleaning",
    slug: "regular-cleaning",
    nombre: "Regular Cleaning",
    descripcion: "Recurring home cleaning tailored to weekly, bi-weekly, or monthly schedules.",
    precio_base: 12000,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-deep-cleaning",
    slug: "deep-cleaning",
    nombre: "Deep Cleaning",
    descripcion: "Detailed top-to-bottom cleaning for kitchens, bathrooms, and high-touch surfaces.",
    precio_base: 25000,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-move-in-out-cleaning",
    slug: "move-in-out-cleaning",
    nombre: "Move In/Out Cleaning",
    descripcion: "Inspection-ready cleaning support for moving days and property turnovers.",
    precio_base: 30000,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-airbnb-cleaning",
    slug: "airbnb-cleaning",
    nombre: "Airbnb Cleaning",
    descripcion: "Short-term rental cleaning and turnover support for guest-ready properties.",
    precio_base: 0,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-commercial-cleaning",
    slug: "commercial-cleaning",
    nombre: "Commercial Cleaning",
    descripcion: "Custom janitorial support for offices, clinics, and business facilities.",
    precio_base: 0,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-post-construction-cleaning",
    slug: "post-construction-cleaning",
    nombre: "Post-Construction Cleaning",
    descripcion: "Detailed cleanup after remodeling, renovation, and construction work.",
    precio_base: 0,
    hero_icon: null,
    frecuencias: [],
  },
  {
    id: "fallback-carpet-cleaning",
    slug: "carpet-cleaning",
    nombre: "Carpet Cleaning",
    descripcion: "Professional carpet care for odor, stain, and deep fiber removal needs.",
    precio_base: 18000,
    hero_icon: null,
    frecuencias: [],
  },
];

async function fetchServicesCatalog(): Promise<ServiceCatalogItem[]> {
  try {
    const services = await withServicesTimeout(
      query<{
        id: string;
        slug: string;
        nombre: string;
        descripcion: string | null;
        precio_base: number;
        hero_icon: string | null;
      }>(
        `SELECT id, slug, nombre, descripcion, precio_base, hero_icon
         FROM public.services
         WHERE activo = true
         ORDER BY nombre ASC`,
      ),
    );

    const serviceIds = services.map((service) => service.id);
    const frequencies = serviceIds.length
      ? await withServicesTimeout(
          query<{
            service_id: string;
            frecuencia: string;
            etiqueta: string;
            multiplicador: string | number;
          }>(
            `SELECT service_id, frecuencia, etiqueta, multiplicador
             FROM public.service_frequencies
             WHERE activo = true AND service_id = ANY($1)`,
            [serviceIds],
          ),
        )
      : [];

    const frequenciesByService = new Map<string, ServiceFrequency[]>();
    for (const frequency of frequencies) {
      const existing = frequenciesByService.get(frequency.service_id) ?? [];
      existing.push({
        frecuencia: frequency.frecuencia,
        etiqueta: frequency.etiqueta,
        multiplicador: Number(frequency.multiplicador),
      });
      frequenciesByService.set(frequency.service_id, existing);
    }

    return services.map((service) => ({
      ...service,
      frecuencias: frequenciesByService.get(service.id) ?? [],
    }));
  } catch (error) {
    logServicesFallback("services-listing", "services-catalog-query", error);
    return FALLBACK_SERVICES;
  }
}

export const getServicesCatalog = unstable_cache(fetchServicesCatalog, [CACHE_TAGS.servicesCatalog], {
  revalidate: CACHE_REVALIDATE_SECONDS.servicesCatalog,
  tags: [CACHE_TAGS.servicesCatalog],
});
