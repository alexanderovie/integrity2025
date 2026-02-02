-- Función para adquirir un lock sobre un evento de webhook y evitar procesamiento paralelo
CREATE OR REPLACE FUNCTION app_acquire_webhook_lock(
  in_event_id TEXT,
  in_handler_id TEXT,
  in_lock_timeout INTERVAL
) RETURNS stripe_webhook_events AS $$
DECLARE
  locked_row stripe_webhook_events;
BEGIN
  UPDATE stripe_webhook_events
  SET locked_by = in_handler_id,
      locked_at = now(),
      attempt_count = COALESCE(attempt_count, 0) + 1
  WHERE event_id = in_event_id
    AND (
      locked_at IS NULL
      OR locked_at < now() - in_lock_timeout
    )
  RETURNING * INTO locked_row;

  RETURN locked_row;
END;
$$ LANGUAGE plpgsql STABLE;
