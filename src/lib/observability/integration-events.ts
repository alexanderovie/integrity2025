import "server-only";

import { createHash } from "crypto";
import { query, queryOne } from "@/lib/db/neon";

export type IntegrationProvider = "hubspot" | "resend" | "stripe" | "meta";
export type IntegrationDirection = "inbound" | "outbound";
export type IntegrationStatus = "pending" | "processing" | "succeeded" | "failed" | "retry_scheduled" | "dead_letter";

type IntegrationEventInput = {
  requestId?: string | null;
  traceId?: string | null;
  leadSubmissionId?: string | null;
  provider: IntegrationProvider;
  operation: string;
  direction?: IntegrationDirection;
  status?: IntegrationStatus;
  providerEventId?: string | null;
  providerObjectId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
};

type IntegrationEventUpdate = {
  status: IntegrationStatus;
  providerEventId?: string | null;
  providerObjectId?: string | null;
  errorCode?: string | null;
  lastError?: string | null;
  metadata?: Record<string, unknown> | null;
  incrementAttempt?: boolean;
};

type IntegrationEventRow = {
  id: string;
};

export type RetryableIntegrationEvent = {
  id: string;
  created_at: string;
  request_id: string | null;
  trace_id: string | null;
  lead_submission_id: string | null;
  provider: IntegrationProvider;
  operation: string;
  direction: IntegrationDirection;
  status: IntegrationStatus;
  attempt_count: number;
  provider_event_id: string | null;
  provider_object_id: string | null;
  idempotency_key: string | null;
  next_retry_at: string | null;
  metadata: Record<string, unknown>;
};

function metadataHash(metadata?: Record<string, unknown> | null): string | null {
  if (!metadata) return null;
  return createHash("sha256").update(JSON.stringify(metadata)).digest("hex");
}

export async function createIntegrationEvent(input: IntegrationEventInput): Promise<string> {
  const metadata = input.metadata ? JSON.stringify(input.metadata) : "{}";
  const row = await queryOne<IntegrationEventRow>(
    `
      INSERT INTO public.integration_events (
        request_id,
        trace_id,
        lead_submission_id,
        provider,
        operation,
        direction,
        status,
        provider_event_id,
        provider_object_id,
        idempotency_key,
        payload_hash,
        metadata
      )
      VALUES ($1, $2, $3::uuid, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
      ON CONFLICT (idempotency_key) DO UPDATE
      SET
        updated_at = now(),
        status = EXCLUDED.status,
        metadata = EXCLUDED.metadata
      RETURNING id
    `,
    [
      input.requestId ?? null,
      input.traceId ?? null,
      input.leadSubmissionId ?? null,
      input.provider,
      input.operation,
      input.direction ?? "outbound",
      input.status ?? "pending",
      input.providerEventId ?? null,
      input.providerObjectId ?? null,
      input.idempotencyKey ?? null,
      metadataHash(input.metadata),
      metadata,
    ],
    {
      name: "integration_event_create",
      context: "observability",
    },
  );

  if (!row?.id) {
    throw new Error("Integration event was not persisted.");
  }

  return row.id;
}

export async function updateIntegrationEvent(id: string, update: IntegrationEventUpdate): Promise<void> {
  const metadata = update.metadata ? JSON.stringify(update.metadata) : null;

  await query(
    `
      UPDATE public.integration_events
      SET
        status = $2,
        attempt_count = CASE WHEN $8::boolean THEN attempt_count + 1 ELSE attempt_count END,
        processed_at = CASE WHEN $2 = 'succeeded' THEN now() ELSE processed_at END,
        provider_event_id = COALESCE($3, provider_event_id),
        provider_object_id = COALESCE($4, provider_object_id),
        error_code = COALESCE($5, error_code),
        last_error = COALESCE($6, last_error),
        metadata = COALESCE($7::jsonb, metadata),
        locked_by = NULL,
        locked_at = NULL
      WHERE id = $1
    `,
    [
      id,
      update.status,
      update.providerEventId ?? null,
      update.providerObjectId ?? null,
      update.errorCode ?? null,
      update.lastError ?? null,
      metadata,
      update.incrementAttempt ?? true,
    ],
    {
      name: "integration_event_update",
      context: "observability",
    },
  );
}

export async function scheduleIntegrationEventRetry(
  id: string,
  input: {
    lastError?: string | null;
    errorCode?: string | null;
    retryAfterSeconds?: number;
  } = {},
): Promise<void> {
  const retryAfterSeconds = input.retryAfterSeconds ?? 300;

  await query(
    `
      UPDATE public.integration_events
      SET
        status = 'retry_scheduled',
        next_retry_at = now() + ($2::int * interval '1 second'),
        error_code = COALESCE($3, error_code),
        last_error = COALESCE($4, last_error),
        locked_by = NULL,
        locked_at = NULL
      WHERE id = $1
    `,
    [
      id,
      retryAfterSeconds,
      input.errorCode ?? null,
      input.lastError ?? null,
    ],
    {
      name: "integration_event_schedule_retry",
      context: "observability",
    },
  );
}

export async function markIntegrationEventDeadLetter(
  id: string,
  input: {
    lastError?: string | null;
    errorCode?: string | null;
  } = {},
): Promise<void> {
  await query(
    `
      UPDATE public.integration_events
      SET
        status = 'dead_letter',
        next_retry_at = NULL,
        error_code = COALESCE($2, error_code),
        last_error = COALESCE($3, last_error),
        locked_by = NULL,
        locked_at = NULL
      WHERE id = $1
    `,
    [
      id,
      input.errorCode ?? null,
      input.lastError ?? null,
    ],
    {
      name: "integration_event_dead_letter",
      context: "observability",
    },
  );
}

export async function claimRetryableIntegrationEvents(input: {
  limit: number;
  workerId: string;
  lockTimeoutMinutes?: number;
  provider?: IntegrationProvider;
  operation?: string;
}): Promise<RetryableIntegrationEvent[]> {
  const lockTimeoutMinutes = input.lockTimeoutMinutes ?? 5;

  const rows = await query<RetryableIntegrationEvent>(
    `
      WITH candidates AS (
        SELECT id
        FROM public.integration_events
        WHERE status = 'retry_scheduled'
          AND (next_retry_at IS NULL OR next_retry_at <= now())
          AND ($4::text IS NULL OR provider = $4)
          AND ($5::text IS NULL OR operation = $5)
          AND (
            locked_at IS NULL
            OR locked_at < now() - ($3::int * interval '1 minute')
          )
        ORDER BY COALESCE(next_retry_at, created_at) ASC, created_at ASC
        LIMIT $1
        FOR UPDATE SKIP LOCKED
      )
      UPDATE public.integration_events AS event
      SET
        status = 'processing',
        attempt_count = event.attempt_count + 1,
        locked_by = $2,
        locked_at = now(),
        next_retry_at = NULL
      FROM candidates
      WHERE event.id = candidates.id
      RETURNING
        event.id,
        event.created_at,
        event.request_id,
        event.trace_id,
        event.lead_submission_id,
        event.provider,
        event.operation,
        event.direction,
        event.status,
        event.attempt_count,
        event.provider_event_id,
        event.provider_object_id,
        event.idempotency_key,
        event.next_retry_at,
        event.metadata
    `,
    [
      Math.max(1, Math.min(input.limit, 50)),
      input.workerId,
      lockTimeoutMinutes,
      input.provider ?? null,
      input.operation ?? null,
    ],
    {
      name: "integration_event_claim_retries",
      context: "observability",
    },
  );

  return rows;
}

export async function listRetryableIntegrationEvents(input: {
  limit: number;
  provider?: IntegrationProvider;
  operation?: string;
  dueOnly?: boolean;
}): Promise<RetryableIntegrationEvent[]> {
  const rows = await query<RetryableIntegrationEvent>(
    `
      SELECT
        id,
        created_at,
        request_id,
        trace_id,
        lead_submission_id,
        provider,
        operation,
        direction,
        status,
        attempt_count,
        provider_event_id,
        provider_object_id,
        idempotency_key,
        next_retry_at,
        metadata
      FROM public.integration_events
      WHERE status = 'retry_scheduled'
        AND ($2::text IS NULL OR provider = $2)
        AND ($3::text IS NULL OR operation = $3)
        AND ($4::boolean = false OR next_retry_at IS NULL OR next_retry_at <= now())
      ORDER BY COALESCE(next_retry_at, created_at) ASC, created_at ASC
      LIMIT $1
    `,
    [
      Math.max(1, Math.min(input.limit, 50)),
      input.provider ?? null,
      input.operation ?? null,
      input.dueOnly ?? true,
    ],
    {
      name: "integration_event_list_retries",
      context: "observability",
    },
  );

  return rows;
}

export async function clearIntegrationEventLock(id: string): Promise<void> {
  await query(
    `
      UPDATE public.integration_events
      SET
        locked_by = NULL,
        locked_at = NULL
      WHERE id = $1
    `,
    [id],
    {
      name: "integration_event_clear_lock",
      context: "observability",
    },
  );
}
