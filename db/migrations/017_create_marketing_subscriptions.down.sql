BEGIN;

DROP TRIGGER IF EXISTS marketing_subscriptions_set_updated_at ON public.marketing_subscriptions;
DROP FUNCTION IF EXISTS public.set_marketing_subscriptions_updated_at();
DROP TABLE IF EXISTS public.marketing_subscriptions;

COMMIT;
