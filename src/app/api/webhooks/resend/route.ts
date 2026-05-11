import { NextRequest, NextResponse } from "next/server";
import { Resend, type WebhookEventPayload } from "resend";
import { createIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import {
  markResendWebhookEventFailed,
  markResendWebhookEventProcessed,
  persistResendWebhookEvent,
} from "@/lib/resend/webhook-events";

export const runtime = "nodejs";

function getRequiredHeader(request: NextRequest, name: string): string | null {
  const value = request.headers.get(name);
  return value && value.trim() ? value : null;
}

function getEmailId(payload: WebhookEventPayload): string | null {
  if (!payload.type.startsWith("email.")) return null;
  const data = payload.data as { email_id?: unknown };
  return typeof data.email_id === "string" && data.email_id ? data.email_id : null;
}

function verifyResendWebhook(input: {
  payload: string;
  svixId: string;
  svixTimestamp: string;
  svixSignature: string;
  webhookSecret: string;
}): WebhookEventPayload {
  return new Resend().webhooks.verify({
    payload: input.payload,
    headers: {
      id: input.svixId,
      timestamp: input.svixTimestamp,
      signature: input.svixSignature,
    },
    webhookSecret: input.webhookSecret,
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Resend webhook secret is not configured." },
      { status: 503 },
    );
  }

  const svixId = getRequiredHeader(request, "svix-id");
  const svixTimestamp = getRequiredHeader(request, "svix-timestamp");
  const svixSignature = getRequiredHeader(request, "svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing Svix webhook headers." }, { status: 400 });
  }

  const rawPayload = await request.text();
  let payload: WebhookEventPayload;

  try {
    payload = verifyResendWebhook({
      payload: rawPayload,
      svixId,
      svixTimestamp,
      svixSignature,
      webhookSecret,
    });
  } catch (error) {
    logEvent({
      level: "warn",
      event: "resend_webhook_signature_failed",
      requestId,
      provider: "resend",
      operation: "webhook_verify",
      providerEventId: svixId,
      error,
    });
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let persistedEvent;
  try {
    persistedEvent = await persistResendWebhookEvent({
      svixId,
      svixTimestamp,
      payload,
      rawPayload,
    });
  } catch (error) {
    logEvent({
      level: "error",
      event: "resend_webhook_persist_failed",
      requestId,
      provider: "resend",
      operation: payload.type,
      providerEventId: svixId,
      providerObjectId: getEmailId(payload),
      error,
    });
    return NextResponse.json(
      { error: "Webhook event could not be persisted." },
      { status: 500 },
    );
  }

  if (persistedEvent.duplicate) {
    return NextResponse.json({
      received: true,
      duplicate: true,
    });
  }

  const emailId = getEmailId(payload);

  try {
    await createIntegrationEvent({
      requestId,
      provider: "resend",
      operation: payload.type,
      direction: "inbound",
      status: "succeeded",
      providerEventId: svixId,
      providerObjectId: emailId,
      idempotencyKey: `resend:webhook:${svixId}`,
      metadata: {
        source: "resend_webhook",
        eventType: payload.type,
        eventCreatedAt: payload.created_at,
        emailId,
        outboundIntegrationEventId: persistedEvent.integration_event_id,
      },
    });

    await markResendWebhookEventProcessed(persistedEvent.id);
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    await markResendWebhookEventFailed(persistedEvent.id, errorMessage);
    logEvent({
      level: "error",
      event: "resend_webhook_processing_failed",
      requestId,
      provider: "resend",
      operation: payload.type,
      providerEventId: svixId,
      providerObjectId: emailId,
      error,
    });

    return NextResponse.json(
      { error: "Webhook event processing failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    received: true,
    duplicate: false,
  });
}
