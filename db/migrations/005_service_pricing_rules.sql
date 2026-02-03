-- Pricing rules per service (sqft + rooms)
CREATE TABLE IF NOT EXISTS public.service_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  price_per_sqft_cents INT NOT NULL,
  per_bedroom_cents INT NOT NULL DEFAULT 800,
  per_bathroom_cents INT NOT NULL DEFAULT 1200,
  min_price_cents INT NOT NULL DEFAULT 7500,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_id)
);

CREATE INDEX IF NOT EXISTS service_pricing_rules_service_idx
  ON public.service_pricing_rules (service_id);

-- Seed rules from current pricing formula
INSERT INTO public.service_pricing_rules (
  service_id,
  price_per_sqft_cents,
  per_bedroom_cents,
  per_bathroom_cents,
  min_price_cents
)
SELECT
  s.id,
  CASE s.slug
    WHEN 'regular-cleaning' THEN 12
    WHEN 'deep-cleaning' THEN 20
    WHEN 'move-in-out-cleaning' THEN 18
    WHEN 'post-construction-cleaning' THEN 25
    WHEN 'carpet-cleaning' THEN 15
    WHEN 'commercial-cleaning' THEN 18
    WHEN 'airbnb-cleaning' THEN 15
    ELSE 12
  END AS price_per_sqft_cents,
  800 AS per_bedroom_cents,
  1200 AS per_bathroom_cents,
  7500 AS min_price_cents
FROM public.services s
WHERE s.activo = true
ON CONFLICT (service_id) DO NOTHING;
