BEGIN;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_currency TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_price_sync_status TEXT,
  ADD COLUMN IF NOT EXISTS stripe_price_sync_error TEXT;

CREATE INDEX IF NOT EXISTS services_stripe_product_id_idx
  ON public.services (stripe_product_id)
  WHERE stripe_product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS services_stripe_price_id_idx
  ON public.services (stripe_price_id)
  WHERE stripe_price_id IS NOT NULL;

COMMIT;
