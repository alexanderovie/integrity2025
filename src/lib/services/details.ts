import "server-only";

import { query } from "@/lib/db/neon";

export type ServiceDetailRecord = {
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  hero_icon: string | null;
  duration: string | null;
  rating: string | null;
  features: string[];
  cleaning_process: string[];
  seo_title: string | null;
  seo_description: string | null;
  page_content: unknown | null;
  page_content_updated_at: string | null;
  published_at: string | null;
};

export async function getServiceBySlug(slug: string): Promise<ServiceDetailRecord | null> {
  const services = await query<ServiceDetailRecord>(
    `SELECT slug, nombre, descripcion, precio_base, hero_icon, duration, rating, features, cleaning_process,
            seo_title, seo_description, page_content, page_content_updated_at, published_at
     FROM public.services WHERE slug = $1 AND activo = true`,
    [slug],
    { name: "service_detail_by_slug", context: "service-detail" },
  );

  return services[0] ?? null;
}
