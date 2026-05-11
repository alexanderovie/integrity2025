BEGIN;

CREATE TABLE IF NOT EXISTS public.marketing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'subscribed',
  source TEXT,
  lead_submission_id UUID REFERENCES public.lead_submissions(id) ON DELETE SET NULL,

  unsubscribe_token_hash TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  suppressed_at TIMESTAMPTZ,
  suppression_reason TEXT,

  CONSTRAINT marketing_subscriptions_status_check
    CHECK (status IN ('subscribed', 'unsubscribed', 'suppressed'))
);

CREATE INDEX IF NOT EXISTS marketing_subscriptions_status_idx
  ON public.marketing_subscriptions (status);

CREATE INDEX IF NOT EXISTS marketing_subscriptions_lead_submission_idx
  ON public.marketing_subscriptions (lead_submission_id)
  WHERE lead_submission_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_marketing_subscriptions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS marketing_subscriptions_set_updated_at ON public.marketing_subscriptions;

CREATE TRIGGER marketing_subscriptions_set_updated_at
BEFORE UPDATE ON public.marketing_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.set_marketing_subscriptions_updated_at();

COMMIT;
