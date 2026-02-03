import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/neon';

const LABEL_MAP: Record<string, string> = {
  'window-interior': 'Interior Windows',
  'blinds-detail': 'Blinds Cleaning',
  'dishes': 'Dishes',
  'oven-inside': 'Inside Oven',
  'fridge-inside': 'Inside Fridge',
  'pet-hair': 'Pet Hair Removal',
  'heavy-duty': 'Heavy Duty Clean',
  'garage-cleaning': 'Garage Cleaning',
};

export async function GET(request: NextRequest) {
  try {
    const serviceSlug = request.nextUrl.searchParams.get('service')?.toLowerCase().trim() || null;
    const addons = await query<{
      slug: string;
      nombre: string;
      price_cents: number;
      icon: string | null;
      category: string;
      unit: string | null;
      applies_to: string[] | null;
    }>(`
      SELECT slug, nombre, price_cents, icon, category, unit, applies_to
      FROM public.service_addons
      WHERE activo = true
        AND category IN ('cleaning', 'carpet')
      ORDER BY sort_order ASC
    `);

    const filtered = serviceSlug
      ? addons.filter((addon) => !addon.applies_to || addon.applies_to.length === 0 || addon.applies_to.includes(serviceSlug))
      : addons;

    const extras = filtered.map(a => ({
      key: a.slug,
      label: LABEL_MAP[a.slug] || a.nombre || a.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: a.price_cents / 100,
      icon: a.icon || '',
      unit: a.unit || null,
      category: a.category,
      appliesTo: a.applies_to || [],
    }));

    return NextResponse.json(extras);
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json(
      { error: 'Error interno al cargar extras' },
      { status: 500 }
    );
  }
}
