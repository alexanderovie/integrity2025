BEGIN;

-- Align the checked-in migration history with the runtime checkout flow.
-- /api/checkout creates the row before Stripe returns a Checkout Session ID, so
-- stripe_session_id must remain nullable while preserving its unique constraint.
ALTER TABLE public.checkout_sessions
  ALTER COLUMN stripe_session_id DROP NOT NULL;

ALTER TABLE public.checkout_sessions
  ADD COLUMN IF NOT EXISTS service_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_email_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS team_email_sent_at TIMESTAMPTZ;

COMMIT;
