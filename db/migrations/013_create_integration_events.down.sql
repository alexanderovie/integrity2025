BEGIN;

DROP TRIGGER IF EXISTS integration_events_set_updated_at ON public.integration_events;
DROP FUNCTION IF EXISTS public.set_integration_events_updated_at();
DROP TABLE IF EXISTS public.integration_events;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.lead_submissions
    WHERE name IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot restore lead_submissions.name NOT NULL while NULL rows exist';
  END IF;
END;
$$;

ALTER TABLE public.lead_submissions
  ALTER COLUMN name SET NOT NULL;

COMMIT;
