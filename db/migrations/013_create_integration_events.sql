BEGIN;

ALTER TABLE public.lead_submissions
  ALTER COLUMN name DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.integration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  request_id TEXT,
  trace_id TEXT,
  lead_submission_id UUID REFERENCES public.lead_submissions(id) ON DELETE SET NULL,

  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'outbound',
  status TEXT NOT NULL DEFAULT 'pending',

  attempt_count INT NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,

  provider_event_id TEXT,
  provider_object_id TEXT,
  idempotency_key TEXT UNIQUE,
  payload_hash TEXT,

  error_code TEXT,
  last_error TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  CONSTRAINT integration_events_direction_check
    CHECK (direction IN ('inbound', 'outbound')),
  CONSTRAINT integration_events_status_check
    CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'retry_scheduled', 'dead_letter'))
);

CREATE INDEX IF NOT EXISTS integration_events_created_at_idx
  ON public.integration_events (created_at DESC);

CREATE INDEX IF NOT EXISTS integration_events_lead_submission_idx
  ON public.integration_events (lead_submission_id)
  WHERE lead_submission_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS integration_events_provider_status_idx
  ON public.integration_events (provider, status);

CREATE INDEX IF NOT EXISTS integration_events_next_retry_idx
  ON public.integration_events (next_retry_at)
  WHERE next_retry_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS integration_events_provider_event_idx
  ON public.integration_events (provider, provider_event_id)
  WHERE provider_event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_integration_events_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS integration_events_set_updated_at ON public.integration_events;

CREATE TRIGGER integration_events_set_updated_at
BEFORE UPDATE ON public.integration_events
FOR EACH ROW
EXECUTE FUNCTION public.set_integration_events_updated_at();

COMMIT;
