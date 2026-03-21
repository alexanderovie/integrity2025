import "server-only";

import { query, queryOne, queryRaw } from "@/lib/db/neon";

export type CatalogSettings = {
  moneda: string;
  impuesto_porcentaje: number;
  trampa_habilitada: boolean;
};

export type CatalogPricingRules = {
  price_per_sqft_cents: number;
  per_bedroom_cents: number;
  per_bathroom_cents: number;
  min_price_cents: number;
};

export type CatalogFrequency = {
  frecuencia: string;
  etiqueta: string;
  multiplicador: number;
};

export type CatalogExtra = {
  id: string;
  nombre: string;
  precio: number;
};

export type CatalogService = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  adelante: number;
  duration: string | null;
  rating: string | null;
  features: string[];
  cleaning_process: string[];
  display_order: number;
  frecuencias: CatalogFrequency[];
  extras: CatalogExtra[];
  pricing_rules?: CatalogPricingRules | null;
};

export type CatalogReadModel = {
  settings: CatalogSettings;
  servicios: CatalogService[];
};

const DEFAULT_SETTINGS: CatalogSettings = {
  moneda: "usd",
  impuesto_porcentaje: 0,
  trampa_habilitada: false,
};

export async function getCatalogReadModel(): Promise<CatalogReadModel> {
  const settingsResult = await queryRaw<{ valor: Record<string, unknown> }>(
    `select valor from public.app_settings where clave = 'catalogo' limit 1`,
    [],
    { name: "catalog_settings", context: "catalog-api" },
  );

  const settings = settingsResult.rowCount && settingsResult.rowCount > 0 && settingsResult.rows[0].valor
    ? settingsResult.rows[0].valor as CatalogSettings
    : DEFAULT_SETTINGS;

  const services = await query<{
    id: string;
    slug: string;
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    adelanto: number;
    duration: string | null;
    rating: string | null;
    features: string[];
    cleaning_process: string[];
    display_order: number;
  }>(
    `select id, slug, nombre, descripcion, precio_base, adelanto,
            duration, rating, features, cleaning_process, display_order
     from public.services
     where activo = true
       and slug not in ('airbnb-cleaning', 'post-construction-cleaning', 'commercial-cleaning')
     order by display_order asc`,
    undefined,
    { name: "catalog_services", context: "catalog-api" },
  );

  if (services.length === 0) {
    return { settings, servicios: [] };
  }

  const serviceIds = services.map((service) => service.id);
  const pricingRulesMap = new Map<string, CatalogPricingRules>();

  const rulesTable = await queryOne<{ exists: string | null }>(
    `SELECT to_regclass('public.service_pricing_rules') AS exists`,
    undefined,
    { name: "catalog_pricing_rules_table", context: "catalog-api" },
  );

  if (rulesTable?.exists) {
    const pricingRules = await query<{
      service_id: string;
      price_per_sqft_cents: number;
      per_bedroom_cents: number;
      per_bathroom_cents: number;
      min_price_cents: number;
    }>(
      `SELECT service_id, price_per_sqft_cents, per_bedroom_cents, per_bathroom_cents, min_price_cents
       FROM public.service_pricing_rules
       WHERE service_id = ANY($1)`,
      [serviceIds],
      { name: "catalog_pricing_rules", context: "catalog-api" },
    );

    for (const rule of pricingRules) {
      pricingRulesMap.set(rule.service_id, {
        price_per_sqft_cents: rule.price_per_sqft_cents,
        per_bedroom_cents: rule.per_bedroom_cents,
        per_bathroom_cents: rule.per_bathroom_cents,
        min_price_cents: rule.min_price_cents,
      });
    }
  }

  const frequencies = await query<{
    service_id: string;
    frecuencia: string;
    etiqueta: string;
    multiplicador: number;
  }>(
    `select service_id, frecuencia, etiqueta, multiplicador
     from public.service_frequencies
     where activo = true and service_id = any($1)`,
    [serviceIds],
    { name: "catalog_frequencies", context: "catalog-api" },
  );

  const extras = await query<{
    id: string;
    service_id: string;
    nombre: string;
    precio: number;
  }>(
    `select id, service_id, nombre, precio
     from public.service_extras
     where activo = true and service_id = any($1)
     order by nombre asc`,
    [serviceIds],
    { name: "catalog_extras", context: "catalog-api" },
  );

  const frequenciesByService = new Map<string, CatalogFrequency[]>();
  for (const frequency of frequencies) {
    const items = frequenciesByService.get(frequency.service_id) ?? [];
    items.push({
      frecuencia: frequency.frecuencia,
      etiqueta: frequency.etiqueta,
      multiplicador: Number(frequency.multiplicador),
    });
    frequenciesByService.set(frequency.service_id, items);
  }

  const extrasByService = new Map<string, CatalogExtra[]>();
  for (const extra of extras) {
    const items = extrasByService.get(extra.service_id) ?? [];
    items.push({
      id: extra.id,
      nombre: extra.nombre,
      precio: extra.precio,
    });
    extrasByService.set(extra.service_id, items);
  }

  return {
    settings,
    servicios: services.map((service) => ({
      id: service.id,
      slug: service.slug,
      nombre: service.nombre,
      descripcion: service.descripcion,
      precio_base: service.precio_base,
      adelante: service.adelanto,
      duration: service.duration,
      rating: service.rating,
      features: Array.isArray(service.features) ? service.features : [],
      cleaning_process: Array.isArray(service.cleaning_process) ? service.cleaning_process : [],
      display_order: service.display_order,
      frecuencias: frequenciesByService.get(service.id) ?? [],
      extras: extrasByService.get(service.id) ?? [],
      pricing_rules: pricingRulesMap.get(service.id) ?? null,
    })),
  };
}
