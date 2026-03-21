import "server-only";

import { query } from "@/lib/db/neon";

const LABEL_MAP: Record<string, string> = {
  "window-interior": "Interior Windows",
  "blinds-detail": "Blinds Cleaning",
  dishes: "Dishes",
  "oven-inside": "Inside Oven",
  "fridge-inside": "Inside Fridge",
  "pet-hair": "Pet Hair Removal",
  "heavy-duty": "Heavy Duty Clean",
  "garage-cleaning": "Garage Cleaning",
};

export type ServiceAddon = {
  key: string;
  label: string;
  price: number;
  icon: string;
  unit: string | null;
  category: string;
  appliesTo: string[];
};

export async function getServiceAddons(serviceSlug?: string | null): Promise<ServiceAddon[]> {
  const normalizedSlug = serviceSlug?.toLowerCase().trim() || null;

  const addons = await query<{
    slug: string;
    nombre: string;
    price_cents: number;
    icon: string | null;
    category: string;
    unit: string | null;
    applies_to: string[] | null;
  }>(
    `SELECT slug, nombre, price_cents, icon, category, unit, applies_to
     FROM public.service_addons
     WHERE activo = true
       AND category IN ('cleaning', 'carpet')
     ORDER BY sort_order ASC`,
    undefined,
    { name: "service_addons", context: "addons-api" },
  );

  const filtered = (normalizedSlug
    ? addons.filter(
        (addon) => !addon.applies_to || addon.applies_to.length === 0 || addon.applies_to.includes(normalizedSlug),
      )
    : addons
  ).filter((addon) => typeof addon.icon === "string" && addon.icon.trim().length > 0);

  return filtered.map((addon) => ({
    key: addon.slug,
    label:
      LABEL_MAP[addon.slug] ||
      addon.nombre ||
      addon.slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
    price: addon.price_cents / 100,
    icon: addon.icon || "",
    unit: addon.unit || null,
    category: addon.category,
    appliesTo: addon.applies_to || [],
  }));
}
