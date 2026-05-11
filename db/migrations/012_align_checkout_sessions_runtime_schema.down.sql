BEGIN;

-- Refuse rollback if checkout rows still depend on the nullable pre-Stripe state.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.checkout_sessions
    WHERE stripe_session_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Cannot restore checkout_sessions.stripe_session_id NOT NULL while NULL rows exist';
  END IF;
END;
$$;

ALTER TABLE public.checkout_sessions
  ALTER COLUMN stripe_session_id SET NOT NULL,
  DROP COLUMN IF EXISTS team_email_sent_at,
  DROP COLUMN IF EXISTS payment_email_sent_at,
  DROP COLUMN IF EXISTS stripe_payment_intent_id,
  DROP COLUMN IF EXISTS service_id;

COMMIT;
