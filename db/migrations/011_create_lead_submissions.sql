BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS lead_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  service TEXT,
  property_type TEXT,
  zip TEXT,
  frequency TEXT,
  preferred_date TEXT,
  message TEXT,

  source TEXT,
  page_path TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,

  sms_consent BOOLEAN NOT NULL DEFAULT FALSE,
  sms_consent_text TEXT,
  sms_consent_timestamp TIMESTAMPTZ,

  status TEXT NOT NULL DEFAULT 'received',
  resend_status TEXT,
  hubspot_status TEXT,
  stripe_status TEXT,
  meta_status TEXT,

  resend_email_id TEXT,
  resend_confirmation_email_id TEXT,
  hubspot_contact_id TEXT,
  hubspot_deal_id TEXT,
  stripe_session_id TEXT,
  meta_event_id TEXT,

  idempotency_key TEXT UNIQUE,
  error_log JSONB,
  raw_payload JSONB
);

CREATE INDEX IF NOT EXISTS lead_submissions_created_at_idx
  ON lead_submissions (created_at DESC);

CREATE INDEX IF NOT EXISTS lead_submissions_status_idx
  ON lead_submissions (status);

CREATE INDEX IF NOT EXISTS lead_submissions_email_idx
  ON lead_submissions (email)
  WHERE email IS NOT NULL;

CREATE INDEX IF NOT EXISTS lead_submissions_phone_idx
  ON lead_submissions (phone)
  WHERE phone IS NOT NULL;

CREATE INDEX IF NOT EXISTS lead_submissions_hubspot_status_idx
  ON lead_submissions (hubspot_status)
  WHERE hubspot_status IS NOT NULL;

CREATE OR REPLACE FUNCTION set_lead_submissions_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS lead_submissions_set_updated_at ON lead_submissions;

CREATE TRIGGER lead_submissions_set_updated_at
BEFORE UPDATE ON lead_submissions
FOR EACH ROW
EXECUTE FUNCTION set_lead_submissions_updated_at();

COMMIT;
