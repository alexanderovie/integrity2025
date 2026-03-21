import "server-only";

import { getServicesCatalog } from "@/lib/services/catalog";

export type PricingService = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  display_order: number | null;
};

export async function getPricingServices(): Promise<PricingService[]> {
  const services = await getServicesCatalog();

  return services
    .map((service, index) => ({
      id: service.id,
      slug: service.slug,
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio_base: service.precio_base,
      display_order: index + 1,
    }))
    .sort((a, b) => {
      const aIsCommercial = a.precio_base === 0;
      const bIsCommercial = b.precio_base === 0;

      if (aIsCommercial !== bIsCommercial) {
        return aIsCommercial ? 1 : -1;
      }

      return a.nombre.localeCompare(b.nombre);
    });
}
