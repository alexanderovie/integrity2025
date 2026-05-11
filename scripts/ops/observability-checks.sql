-- Read-only operational checks for lead and provider traceability.
-- Usage:
--   psql "$DATABASE_URL" -f scripts/ops/observability-checks.sql

\echo 'Recent lead submissions'
SELECT
  id,
  created_at,
  source,
  status,
  hubspot_status,
  resend_status,
  stripe_status,
  meta_status
FROM public.lead_submissions
ORDER BY created_at DESC
LIMIT 20;

\echo 'Lead provider failures in the last 24 hours'
SELECT
  id,
  created_at,
  source,
  status,
  hubspot_status,
  resend_status,
  error_log
FROM public.lead_submissions
WHERE created_at >= now() - interval '24 hours'
  AND (
    status = 'partial_failure'
    OR hubspot_status LIKE '%failed%'
    OR resend_status LIKE '%failed%'
  )
ORDER BY created_at DESC;

\echo 'Recent integration events'
SELECT
  id,
  created_at,
  provider,
  operation,
  direction,
  status,
  attempt_count,
  lead_submission_id,
  provider_object_id,
  error_code,
  last_error
FROM public.integration_events
ORDER BY created_at DESC
LIMIT 50;

\echo 'Integration events by provider/status in the last 24 hours'
SELECT
  provider,
  operation,
  status,
  count(*) AS total
FROM public.integration_events
WHERE created_at >= now() - interval '24 hours'
GROUP BY provider, operation, status
ORDER BY provider, operation, status;

\echo 'Retryable integration events'
SELECT
  id,
  created_at,
  updated_at,
  provider,
  operation,
  direction,
  status,
  attempt_count,
  next_retry_at,
  provider_event_id,
  provider_object_id,
  last_error
FROM public.integration_events
WHERE status IN ('failed', 'retry_scheduled')
ORDER BY COALESCE(next_retry_at, updated_at) ASC
LIMIT 50;

\echo 'Recent Resend delivery failures'
SELECT
  email_id,
  latest_event_type,
  latest_event_at,
  integration_event_id,
  left(coalesce(subject, ''), 160) AS subject,
  left(coalesce(bounce_message, failed_reason, suppressed_message, ''), 240) AS reason
FROM public.resend_email_deliveries
WHERE latest_event_type IN (
  'email.bounced',
  'email.complained',
  'email.failed',
  'email.suppressed'
)
ORDER BY latest_event_at DESC NULLS LAST, updated_at DESC
LIMIT 50;

\echo 'Stripe webhook events not processed'
SELECT
  event_id,
  type,
  received_at,
  processed,
  processed_at,
  attempt_count,
  next_retry_at,
  error
FROM public.stripe_webhook_events
WHERE processed = false
ORDER BY received_at DESC
LIMIT 50;

\echo 'HubSpot webhook events not processed'
SELECT
  event_id,
  subscription_type,
  object_id,
  property_name,
  received_at,
  processed,
  processed_at,
  attempt_count,
  next_retry_at,
  error
FROM public.hubspot_webhook_events
WHERE processed = false
ORDER BY received_at DESC
LIMIT 50;

\echo 'Resend webhook events not processed'
SELECT
  svix_id,
  event_type,
  email_id,
  created_at AS received_at,
  processed_at,
  left(coalesce(processing_error, ''), 240) AS processing_error
FROM public.resend_webhook_events
WHERE processed_at IS NULL
   OR processing_error IS NOT NULL
ORDER BY created_at DESC
LIMIT 50;
