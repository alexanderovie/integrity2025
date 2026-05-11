BEGIN;

CREATE TABLE IF NOT EXISTS public.hubspot_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  subscription_type TEXT NOT NULL,
  object_id TEXT,
  property_name TEXT,
  occurred_at TIMESTAMPTZ,
  attempt_number INT,
  payload JSONB NOT NULL,
  request_id TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  attempt_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  locked_by TEXT,
  locked_at TIMESTAMPTZ,
  error TEXT
);

CREATE INDEX IF NOT EXISTS hubspot_webhook_events_received_at_idx
  ON public.hubspot_webhook_events (received_at DESC);

CREATE INDEX IF NOT EXISTS hubspot_webhook_events_subscription_idx
  ON public.hubspot_webhook_events (subscription_type, received_at DESC);

CREATE INDEX IF NOT EXISTS hubspot_webhook_events_unprocessed_idx
  ON public.hubspot_webhook_events (received_at DESC)
  WHERE processed = false;

CREATE INDEX IF NOT EXISTS hubspot_webhook_events_next_retry_idx
  ON public.hubspot_webhook_events (next_retry_at)
  WHERE next_retry_at IS NOT NULL;

COMMIT;
