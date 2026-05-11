BEGIN;

ALTER TABLE public.integration_events
  ADD COLUMN IF NOT EXISTS locked_by TEXT,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS integration_events_retry_claim_idx
  ON public.integration_events (next_retry_at, created_at)
  WHERE status = 'retry_scheduled';

CREATE INDEX IF NOT EXISTS integration_events_locked_at_idx
  ON public.integration_events (locked_at)
  WHERE locked_at IS NOT NULL;

COMMIT;
