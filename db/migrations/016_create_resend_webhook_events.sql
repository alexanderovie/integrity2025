BEGIN;

CREATE TABLE IF NOT EXISTS public.resend_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  svix_id TEXT NOT NULL UNIQUE,
  svix_timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_created_at TIMESTAMPTZ,

  email_id TEXT,
  integration_event_id UUID REFERENCES public.integration_events(id) ON DELETE SET NULL,

  from_email TEXT,
  to_emails TEXT[] NOT NULL DEFAULT '{}'::text[],
  subject TEXT,

  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  CONSTRAINT resend_webhook_events_event_type_check
    CHECK (event_type <> '')
);

CREATE INDEX IF NOT EXISTS resend_webhook_events_email_id_idx
  ON public.resend_webhook_events (email_id, event_created_at DESC)
  WHERE email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS resend_webhook_events_event_type_idx
  ON public.resend_webhook_events (event_type, event_created_at DESC);

CREATE INDEX IF NOT EXISTS resend_webhook_events_integration_event_idx
  ON public.resend_webhook_events (integration_event_id)
  WHERE integration_event_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.resend_email_deliveries (
  email_id TEXT PRIMARY KEY,
  integration_event_id UUID REFERENCES public.integration_events(id) ON DELETE SET NULL,

  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  latest_event_type TEXT NOT NULL,
  latest_event_at TIMESTAMPTZ,

  from_email TEXT,
  to_emails TEXT[] NOT NULL DEFAULT '{}'::text[],
  subject TEXT,

  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivery_delayed_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  complained_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  suppressed_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  bounce_type TEXT,
  bounce_subtype TEXT,
  bounce_message TEXT,
  failed_reason TEXT,
  suppressed_type TEXT,
  suppressed_message TEXT,
  last_click_url TEXT,

  payload JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS resend_email_deliveries_latest_event_idx
  ON public.resend_email_deliveries (latest_event_type, latest_event_at DESC);

CREATE INDEX IF NOT EXISTS resend_email_deliveries_integration_event_idx
  ON public.resend_email_deliveries (integration_event_id)
  WHERE integration_event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_resend_webhook_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_resend_email_deliveries_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS resend_webhook_events_set_updated_at ON public.resend_webhook_events;
CREATE TRIGGER resend_webhook_events_set_updated_at
BEFORE UPDATE ON public.resend_webhook_events
FOR EACH ROW
EXECUTE FUNCTION public.set_resend_webhook_events_updated_at();

DROP TRIGGER IF EXISTS resend_email_deliveries_set_updated_at ON public.resend_email_deliveries;
CREATE TRIGGER resend_email_deliveries_set_updated_at
BEFORE UPDATE ON public.resend_email_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.set_resend_email_deliveries_updated_at();

COMMIT;
