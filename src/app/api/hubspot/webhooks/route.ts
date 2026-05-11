import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query, queryRaw } from "@/lib/db/neon";
import { createIntegrationEvent, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";

const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const ENABLE_WEBHOOK_VERIFICATION = process.env.ENABLE_HUBSPOT_WEBHOOK_VERIFICATION !== "false";
const HUBSPOT_WEBHOOK_LOCK_TIMEOUT = "5 minutes";

const HUBSPOT_URL_DECODE_MAP: Record<string, string> = {
  "%3A": ":",
  "%2F": "/",
  "%3F": "?",
  "%40": "@",
  "%21": "!",
  "%24": "$",
  "%27": "'",
  "%28": "(",
  "%29": ")",
  "%2A": "*",
  "%2C": ",",
  "%3B": ";",
};

type HubSpotWebhookEvent = {
  eventId?: number | string;
  subscriptionId?: number | string;
  portalId?: number | string;
  appId?: number | string;
  occurredAt?: number;
  subscriptionType: string;
  attemptNumber?: number;
  objectId?: number | string;
  propertyName?: string;
  propertyValue?: string;
  changeFlag?: string;
  changeSource?: string;
};

type PersistedHubSpotEvent = {
  id: string;
  processed: boolean;
  duplicate: boolean;
};

function decodeHubspotUrl(input: string): string {
  return Object.entries(HUBSPOT_URL_DECODE_MAP).reduce(
    (result, [encoded, decoded]) => result.replace(new RegExp(encoded, "g"), decoded),
    input,
  );
}

function getExternalUrl(request: NextRequest): string {
  const requestUrl = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host") || requestUrl.host;
  const proto = forwardedProto || requestUrl.protocol.replace(":", "") || "https";

  return `${proto}://${host}${requestUrl.pathname}${requestUrl.search}`;
}

function verifyWebhookSignature(input: {
  method: string;
  fullUrl: string;
  body: string;
  signature: string;
  timestamp: string;
  secret: string;
}): boolean {
  try {
    const normalizedUrl = decodeHubspotUrl(input.fullUrl);
    const baseString = `${input.method.toUpperCase()}${normalizedUrl}${input.body}${input.timestamp}`;
    const hash = crypto
      .createHmac("sha256", input.secret)
      .update(baseString, "utf8")
      .digest("base64");

    const signatureBuffer = Buffer.from(input.signature, "utf8");
    const hashBuffer = Buffer.from(hash, "utf8");

    return (
      signatureBuffer.length === hashBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, hashBuffer)
    );
  } catch {
    return false;
  }
}

function getHubSpotEventId(event: HubSpotWebhookEvent): string {
  if (event.eventId !== undefined && event.eventId !== null) {
    return String(event.eventId);
  }

  return [
    event.subscriptionType,
    event.objectId ?? "unknown-object",
    event.occurredAt ?? "unknown-time",
    event.propertyName ?? "none",
    event.attemptNumber ?? "none",
  ].join(":");
}

function getOccurredAt(value?: number): string | null {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(value).toISOString();
}

async function persistHubSpotEvent(
  event: HubSpotWebhookEvent,
  requestId: string,
): Promise<PersistedHubSpotEvent> {
  const eventId = getHubSpotEventId(event);
  const result = await queryRaw<PersistedHubSpotEvent>(
    `
      WITH inserted AS (
        INSERT INTO public.hubspot_webhook_events (
          event_id,
          subscription_type,
          object_id,
          property_name,
          occurred_at,
          attempt_number,
          payload,
          request_id,
          received_at
        )
        VALUES ($1, $2, $3, $4, $5::timestamptz, $6, $7::jsonb, $8, now())
        ON CONFLICT (event_id) DO NOTHING
        RETURNING id, processed, false AS duplicate
      )
      SELECT id, processed, duplicate FROM inserted
      UNION ALL
      SELECT id, processed, true AS duplicate
      FROM public.hubspot_webhook_events
      WHERE event_id = $1
        AND NOT EXISTS (SELECT 1 FROM inserted)
      LIMIT 1
    `,
    [
      eventId,
      event.subscriptionType,
      event.objectId ? String(event.objectId) : null,
      event.propertyName ?? null,
      getOccurredAt(event.occurredAt),
      event.attemptNumber ?? null,
      JSON.stringify(event),
      requestId,
    ],
    {
      name: "hubspot_webhook_event_persist",
      context: "hubspot_webhook",
    },
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`HubSpot webhook event ${eventId} was not persisted.`);
  }

  return row;
}

async function acquireHubSpotEventLock(eventId: string, handlerId: string): Promise<boolean> {
  const result = await queryRaw(
    `
      UPDATE public.hubspot_webhook_events
      SET
        locked_by = $2,
        locked_at = now(),
        attempt_count = COALESCE(attempt_count, 0) + 1
      WHERE event_id = $1
        AND processed = false
        AND (
          locked_at IS NULL
          OR locked_at < now() - $3::interval
        )
      RETURNING id
    `,
    [eventId, handlerId, HUBSPOT_WEBHOOK_LOCK_TIMEOUT],
    {
      name: "hubspot_webhook_event_lock",
      context: "hubspot_webhook",
    },
  );

  return result.rowCount === 1;
}

async function markHubSpotEventProcessed(eventId: string): Promise<void> {
  await query(
    `
      UPDATE public.hubspot_webhook_events
      SET
        processed = true,
        processed_at = now(),
        next_retry_at = NULL,
        locked_by = NULL,
        locked_at = NULL,
        error = NULL
      WHERE event_id = $1
    `,
    [eventId],
    {
      name: "hubspot_webhook_event_processed",
      context: "hubspot_webhook",
    },
  );
}

async function markHubSpotEventFailed(eventId: string, error: unknown): Promise<void> {
  await query(
    `
      UPDATE public.hubspot_webhook_events
      SET
        error = $2,
        next_retry_at = now() + interval '5 minutes',
        locked_by = NULL,
        locked_at = NULL
      WHERE event_id = $1
    `,
    [eventId, getErrorMessage(error)],
    {
      name: "hubspot_webhook_event_failed",
      context: "hubspot_webhook",
    },
  );
}

async function processWebhookEvent(
  event: HubSpotWebhookEvent,
  input: { requestId: string },
): Promise<void> {
  const eventId = getHubSpotEventId(event);
  const integrationEventId = await createIntegrationEvent({
    requestId: input.requestId,
    provider: "hubspot",
    operation: event.subscriptionType,
    direction: "inbound",
    status: "processing",
    providerEventId: eventId,
    providerObjectId: event.objectId ? String(event.objectId) : null,
    idempotencyKey: `hubspot:webhook:${eventId}`,
    metadata: {
      subscriptionType: event.subscriptionType,
      propertyName: event.propertyName,
      changeFlag: event.changeFlag,
      changeSource: event.changeSource,
      attemptNumber: event.attemptNumber,
    },
  });

  logEvent({
    level: "info",
    event: "hubspot_webhook_event_received",
    requestId: input.requestId,
    provider: "hubspot",
    operation: event.subscriptionType,
    providerEventId: eventId,
    providerObjectId: event.objectId ? String(event.objectId) : null,
    integrationEventId,
  });

  await updateIntegrationEvent(integrationEventId, {
    status: "succeeded",
    providerEventId: eventId,
    providerObjectId: event.objectId ? String(event.objectId) : null,
  });
}

function parseWebhookEvents(body: string): HubSpotWebhookEvent[] {
  const parsed = JSON.parse(body) as unknown;
  const events = Array.isArray(parsed) ? parsed : [parsed];

  return events.map((event) => {
    if (!event || typeof event !== "object") {
      throw new Error("Invalid HubSpot webhook event.");
    }

    const webhookEvent = event as Partial<HubSpotWebhookEvent>;
    if (!webhookEvent.subscriptionType) {
      throw new Error("HubSpot webhook event is missing subscriptionType.");
    }

    return webhookEvent as HubSpotWebhookEvent;
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const body = await request.text();
  const signature = request.headers.get("x-hubspot-signature-v3");
  const timestamp = request.headers.get("x-hubspot-request-timestamp");

  try {
    if (ENABLE_WEBHOOK_VERIFICATION) {
      if (!HUBSPOT_CLIENT_SECRET) {
        return NextResponse.json(
          { error: "Webhook verification not configured" },
          { status: 500 },
        );
      }

      if (!signature || !timestamp) {
        return NextResponse.json(
          { error: "Missing signature" },
          { status: 401 },
        );
      }

      const timestampMs = Number(timestamp);
      const maxSkewMs = 5 * 60 * 1000;
      if (!Number.isFinite(timestampMs) || Date.now() - timestampMs > maxSkewMs) {
        return NextResponse.json(
          { error: "Invalid timestamp" },
          { status: 401 },
        );
      }

      const isValid = verifyWebhookSignature({
        method: request.method,
        fullUrl: getExternalUrl(request),
        body,
        signature,
        timestamp,
        secret: HUBSPOT_CLIENT_SECRET,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    const events = parseWebhookEvents(body);

    for (const event of events) {
      const eventId = getHubSpotEventId(event);
      const persistedEvent = await persistHubSpotEvent(event, requestId);

      if (persistedEvent.duplicate && persistedEvent.processed) {
        continue;
      }

      const locked = await acquireHubSpotEventLock(eventId, requestId);
      if (!locked) {
        continue;
      }

      try {
        await processWebhookEvent(event, { requestId });
        await markHubSpotEventProcessed(eventId);
      } catch (processingError) {
        await markHubSpotEventFailed(eventId, processingError);
        throw processingError;
      }
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error) {
    logEvent({
      level: "error",
      event: "hubspot_webhook_processing_failed",
      requestId,
      route: request.nextUrl.pathname,
      provider: "hubspot",
      operation: "webhook",
      error,
    });

    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
