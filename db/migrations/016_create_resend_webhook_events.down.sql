BEGIN;

DROP TRIGGER IF EXISTS resend_email_deliveries_set_updated_at ON public.resend_email_deliveries;
DROP TRIGGER IF EXISTS resend_webhook_events_set_updated_at ON public.resend_webhook_events;

DROP FUNCTION IF EXISTS public.set_resend_email_deliveries_updated_at();
DROP FUNCTION IF EXISTS public.set_resend_webhook_events_updated_at();

DROP TABLE IF EXISTS public.resend_email_deliveries;
DROP TABLE IF EXISTS public.resend_webhook_events;

COMMIT;
