-- Schedules failed provider side effects for manual/worker retry.
-- This script is intentionally conservative: it does not call providers.
-- Usage:
--   psql "$DATABASE_URL" \
--     -v retry_after='5 minutes' \
--     -v max_attempts='5' \
--     -f scripts/ops/schedule-integration-event-retries.sql

\if :{?retry_after}
\else
\set retry_after '5 minutes'
\endif

\if :{?max_attempts}
\else
\set max_attempts '5'
\endif

UPDATE public.integration_events
SET
  status = CASE
    WHEN attempt_count >= (:'max_attempts')::int
      THEN 'dead_letter'
    ELSE 'retry_scheduled'
  END,
  next_retry_at = CASE
    WHEN attempt_count >= (:'max_attempts')::int
      THEN NULL
    ELSE now() + (:'retry_after')::interval
  END,
  locked_by = NULL,
  locked_at = NULL
WHERE status = 'failed'
RETURNING
  id,
  provider,
  operation,
  status,
  attempt_count,
  next_retry_at,
  left(coalesce(last_error, ''), 240) AS last_error;
