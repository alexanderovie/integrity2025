import { NextResponse } from 'next/server';
import { query, queryOne, queryRaw } from '@/lib/db/neon';

type Catalogo = {
  settings: {
    moneda: string;
    impuesto_porcentaje: number;
    trampa_habilitada: boolean;
  };
  servicios: Array<{
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
    frecuencias: Array<{
      frecuencia: string;
      etiqueta: string;
      multiplicador: number;
    }>;
    extras: Array<{
      id: string;
      nombre: string;
      precio: number;
    }>;
    pricing_rules?: {
      price_per_sqft_cents: number;
      per_bedroom_cents: number;
      per_bathroom_cents: number;
      min_price_cents: number;
    } | null;
  }>;
};

export async function GET() {
  try {
    const settingsResult = await queryRaw<{ valor: Record<string, unknown> }>(
      `select valor from public.app_settings where clave = 'catalogo' limit 1`,
      []
    );

    const settings = settingsResult.rowCount && settingsResult.rowCount > 0 && settingsResult.rows[0].valor
      ? settingsResult.rows[0].valor as { moneda: string; impuesto_porcentaje: number; trampa_habilitada: boolean }
      : { moneda: 'usd', impuesto_porcentaje: 0, trampa_habilitada: false };

    const serviciosResult = await query<{
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
      `select id, slug, nombre, descripcion, precio_base, adelantado, 
              duration, rating, features, cleaning_process, display_order
       from public.services
       where activo = true
       order by display_order asc`
    );

    if (serviciosResult.length === 0) {
      return NextResponse.json({ settings, servicios: [] });
    }

    const serviceIds = serviciosResult.map((r) => r.id);

    const pricingRulesMap = new Map<string, {
      price_per_sqft_cents: number;
      per_bedroom_cents: number;
      per_bathroom_cents: number;
      min_price_cents: number;
    }>();

    const rulesTable = await queryOne<{ exists: string | null }>(
      `SELECT to_regclass('public.service_pricing_rules') AS exists`
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
        [serviceIds]
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

    const freqResult = await query<{
      service_id: string;
      frecuencia: string;
      etiqueta: string;
      multiplicador: number;
    }>(
      `select service_id, frecuencia, etiqueta, multiplicador
       from public.service_frequencies
       where activo = true and service_id = any($1)`,
      [serviceIds]
    );

    const extrasResult = await query<{
      id: string;
      service_id: string;
      nombre: string;
      precio: number;
    }>(
      `select id, service_id, nombre, precio
       from public.service_extras
       where activo = true and service_id = any($1)
       order by nombre asc`,
      [serviceIds]
    );

    const frecPorServicio = new Map<string, Array<{ frecuencia: string; etiqueta: string; multiplicador: number }>>();
    for (const f of freqResult) {
      const arr = frecPorServicio.get(f.service_id) ?? [];
      arr.push({
        frecuencia: f.frecuencia,
        etiqueta: f.etiqueta,
        multiplicador: f.multiplicador,
      });
      frecPorServicio.set(f.service_id, arr);
    }

    const extrasPorServicio = new Map<string, Array<{ id: string; nombre: string; precio: number }>>();
    for (const e of extrasResult) {
      const arr = extrasPorServicio.get(e.service_id) ?? [];
      arr.push({
        id: e.id,
        nombre: e.nombre,
        precio: e.precio,
      });
      extrasPorServicio.set(e.service_id, arr);
    }

    const catalogo: Catalogo = {
      settings,
      servicios: serviciosResult.map((s) => ({
        id: s.id,
        slug: s.slug,
        nombre: s.nombre,
        descripcion: s.descripcion,
        precio_base: s.precio_base,
        adelante: s.adelanto,
        duration: s.duration,
        rating: s.rating,
        features: Array.isArray(s.features) ? s.features : [],
        cleaning_process: Array.isArray(s.cleaning_process) ? s.cleaning_process : [],
        display_order: s.display_order,
        frecuencias: frecPorServicio.get(s.id) ?? [],
        extras: extrasPorServicio.get(s.id) ?? [],
        pricing_rules: pricingRulesMap.get(s.id) ?? null,
      })),
    };

    return NextResponse.json(catalogo);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Error interno al cargar catálogo' },
      { status: 500 }
    );
  }
}
