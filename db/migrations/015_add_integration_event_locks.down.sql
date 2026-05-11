BEGIN;

DROP INDEX IF EXISTS public.integration_events_locked_at_idx;
DROP INDEX IF EXISTS public.integration_events_retry_claim_idx;

ALTER TABLE public.integration_events
  DROP COLUMN IF EXISTS locked_at,
  DROP COLUMN IF EXISTS locked_by;

COMMIT;
