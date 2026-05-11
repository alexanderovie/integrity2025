-- Read-only report for provider side effects that need retry/backfill review.
-- Usage:
--   psql "$DATABASE_URL" -f scripts/ops/integration-events-retry-report.sql

\echo 'Retry/backfill candidates'
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
  lead_submission_id,
  provider_event_id,
  provider_object_id,
  left(coalesce(last_error, ''), 240) AS last_error
FROM public.integration_events
WHERE status IN ('failed', 'retry_scheduled')
ORDER BY COALESCE(next_retry_at, updated_at) ASC, created_at ASC;

\echo 'Retry/backfill summary'
SELECT
  provider,
  operation,
  direction,
  status,
  count(*) AS total,
  min(created_at) AS oldest,
  max(updated_at) AS newest
FROM public.integration_events
WHERE status IN ('failed', 'retry_scheduled')
GROUP BY provider, operation, direction, status
ORDER BY total DESC, provider, operation;

\echo 'Dead letter events'
SELECT
  id,
  created_at,
  updated_at,
  provider,
  operation,
  direction,
  attempt_count,
  lead_submission_id,
  provider_event_id,
  provider_object_id,
  left(coalesce(last_error, ''), 240) AS last_error
FROM public.integration_events
WHERE status = 'dead_letter'
ORDER BY updated_at DESC;
