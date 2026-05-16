BEGIN;

DROP INDEX IF EXISTS public.services_stripe_price_id_idx;
DROP INDEX IF EXISTS public.services_stripe_product_id_idx;

ALTER TABLE public.services
  DROP COLUMN IF EXISTS stripe_price_sync_error,
  DROP COLUMN IF EXISTS stripe_price_sync_status,
  DROP COLUMN IF EXISTS stripe_price_synced_at,
  DROP COLUMN IF EXISTS stripe_price_currency,
  DROP COLUMN IF EXISTS stripe_price_id,
  DROP COLUMN IF EXISTS stripe_product_id;

COMMIT;
