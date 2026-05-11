import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { syncHubSpotPaymentCompleted } from "@/lib/hubspot/payment-completed-sync";
import {
  claimRetryableIntegrationEvents,
  listRetryableIntegrationEvents,
  markIntegrationEventDeadLetter,
  scheduleIntegrationEventRetry,
  updateIntegrationEvent,
  type IntegrationProvider,
  type RetryableIntegrationEvent,
} from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import { verifyInternalRequest } from "@/lib/security/internal-api";

export const runtime = "nodejs";

const SUPPORTED_PROVIDER: IntegrationProvider = "hubspot";
const SUPPORTED_OPERATION = "payment_completed_sync";

type RetryRequestBody = {
  dryRun?: unknown;
  limit?: unknown;
  maxAttempts?: unknown;
  provider?: unknown;
};

type RetryResult = {
  id: string;
  provider: IntegrationProvider;
  operation: string;
  attemptCount: number;
  status: "succeeded" | "retry_scheduled" | "dead_letter";
  providerObjectId?: string | null;
  error?: string;
};

function toPositiveInteger(value: unknown, fallback: number, max: number): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

function getProvider(value: unknown): IntegrationProvider | null {
  return value === undefined || value === null ? SUPPORTED_PROVIDER : value === SUPPORTED_PROVIDER ? SUPPORTED_PROVIDER : null;
}

function getStripeSessionId(event: RetryableIntegrationEvent): string | null {
  const value = event.metadata?.stripeSessionId;
  return typeof value === "string" && value ? value : null;
}

function nextRetryDelaySeconds(attemptCount: number): number {
  return Math.min(3600, 60 * 2 ** Math.max(0, attemptCount - 1));
}

function summarizeCandidate(event: RetryableIntegrationEvent) {
  return {
    id: event.id,
    provider: event.provider,
    operation: event.operation,
    attemptCount: event.attempt_count,
    providerEventId: event.provider_event_id,
    nextRetryAt: event.next_retry_at,
    createdAt: event.created_at,
  };
}

async function parseBody(request: NextRequest): Promise<RetryRequestBody> {
  try {
    return (await request.json()) as RetryRequestBody;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = verifyInternalRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const requestId = getRequestId(request);
  const body = await parseBody(request);
  const provider = getProvider(body.provider);

  if (!provider) {
    return NextResponse.json(
      {
        error: "Only HubSpot payment_completed_sync retries are supported by this runner.",
      },
      { status: 400 },
    );
  }

  const limit = toPositiveInteger(body.limit, 10, 50);
  const maxAttempts = toPositiveInteger(body.maxAttempts, 5, 10);
  const dryRun = body.dryRun === true;

  if (dryRun) {
    const candidates = await listRetryableIntegrationEvents({
      limit,
      provider,
      operation: SUPPORTED_OPERATION,
      dueOnly: true,
    });

    return NextResponse.json({
      ok: true,
      dryRun: true,
      count: candidates.length,
      candidates: candidates.map(summarizeCandidate),
    });
  }

  const workerId = `${requestId}:integration-retries`;
  const events = await claimRetryableIntegrationEvents({
    limit,
    provider,
    operation: SUPPORTED_OPERATION,
    workerId,
  });
  const results: RetryResult[] = [];

  for (const event of events) {
    const stripeSessionId = getStripeSessionId(event);

    if (!stripeSessionId) {
      const error = "Retry event is missing metadata.stripeSessionId.";
      await markIntegrationEventDeadLetter(event.id, {
        errorCode: "missing_stripe_session_id",
        lastError: error,
      });
      results.push({
        id: event.id,
        provider: event.provider,
        operation: event.operation,
        attemptCount: event.attempt_count,
        status: "dead_letter",
        error,
      });
      continue;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
      const dealId = await syncHubSpotPaymentCompleted(session);

      await updateIntegrationEvent(event.id, {
        status: "succeeded",
        providerObjectId: dealId,
        incrementAttempt: false,
        metadata: {
          ...event.metadata,
          retry: {
            workerId,
            completedAt: new Date().toISOString(),
          },
        },
      });

      results.push({
        id: event.id,
        provider: event.provider,
        operation: event.operation,
        attemptCount: event.attempt_count,
        status: "succeeded",
        providerObjectId: dealId,
      });
    } catch (error) {
      const errorMessage = getErrorMessage(error);

      if (event.attempt_count >= maxAttempts) {
        await markIntegrationEventDeadLetter(event.id, {
          errorCode: "retry_attempts_exhausted",
          lastError: errorMessage,
        });
        results.push({
          id: event.id,
          provider: event.provider,
          operation: event.operation,
          attemptCount: event.attempt_count,
          status: "dead_letter",
          error: errorMessage,
        });
        continue;
      }

      await scheduleIntegrationEventRetry(event.id, {
        lastError: errorMessage,
        retryAfterSeconds: nextRetryDelaySeconds(event.attempt_count),
      });
      results.push({
        id: event.id,
        provider: event.provider,
        operation: event.operation,
        attemptCount: event.attempt_count,
        status: "retry_scheduled",
        error: errorMessage,
      });

      logEvent({
        level: "error",
        event: "integration_retry_failed",
        requestId,
        integrationEventId: event.id,
        provider: event.provider,
        operation: event.operation,
        providerEventId: event.provider_event_id,
        error,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    dryRun: false,
    claimed: events.length,
    results,
  });
}
