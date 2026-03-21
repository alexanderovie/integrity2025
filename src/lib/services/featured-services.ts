import "server-only";

import { getServicesCatalog } from "@/lib/services/catalog";

export type FeaturedServiceCard = {
  id: string;
  slug: string;
  nombre: string;
  hero_icon: string | null;
};

export async function getFeaturedServices(featuredSlugs: string[]): Promise<FeaturedServiceCard[]> {
  const services = await getServicesCatalog();
  const servicesBySlug = new Map(services.map((service) => [service.slug, service]));

  return featuredSlugs
    .map((slug) => servicesBySlug.get(slug))
    .filter((service): service is NonNullable<typeof service> => Boolean(service))
    .map((service) => ({
      id: service.id,
      slug: service.slug,
      nombre: service.nombre,
      hero_icon: service.hero_icon,
    }));
}
