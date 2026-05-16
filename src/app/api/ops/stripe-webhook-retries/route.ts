import { NextRequest, NextResponse } from "next/server";

import { getRequestId } from "@/lib/observability/logger";
import { verifyInternalRequest } from "@/lib/security/internal-api";
import {
  listDueStripeWebhookEvents,
  processDueStripeWebhookEvents,
} from "@/lib/stripe/webhook-processing";

export const runtime = "nodejs";

type RetryRequestBody = {
  dryRun?: unknown;
  limit?: unknown;
};

function toPositiveInteger(value: unknown, fallback: number, max: number): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
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
  const limit = toPositiveInteger(body.limit, 10, 50);
  const dryRun = body.dryRun === true;

  if (dryRun) {
    const candidates = await listDueStripeWebhookEvents(limit);
    return NextResponse.json({
      ok: true,
      dryRun: true,
      count: candidates.length,
      candidates: candidates.map((event) => ({
        eventId: event.event_id,
        type: event.type,
        attemptCount: event.attempt_count,
        nextRetryAt: event.next_retry_at,
        receivedAt: event.received_at,
      })),
    });
  }

  const results = await processDueStripeWebhookEvents({
    requestId,
    limit,
  });

  return NextResponse.json({
    ok: true,
    dryRun: false,
    processed: results.filter((result) => result.status === "processed").length,
    locked: results.filter((result) => result.status === "locked").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  });
}
