-- Align min_price_cents with service precio_base when present
UPDATE public.service_pricing_rules r
SET min_price_cents = s.precio_base,
    updated_at = now()
FROM public.services s
WHERE s.id = r.service_id
  AND s.precio_base IS NOT NULL
  AND s.precio_base > 0;
