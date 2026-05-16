import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import Stripe from "stripe";

import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import { stripe } from "@/lib/stripe";
import { persistStripeEvent, processStripeWebhookEvent } from "@/lib/stripe/webhook-processing";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature provided" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", getErrorMessage(error));
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const persistedEvent = await persistStripeEvent(event);

    if (persistedEvent.duplicate && persistedEvent.processed) {
      return NextResponse.json({ received: true, duplicate: true, processed: true });
    }

    after(async () => {
      const result = await processStripeWebhookEvent(event, {
        requestId,
        workerId: `${requestId}:stripe-webhook:${event.id}`,
      });

      if (result.status === "failed") {
        logEvent({
          level: "error",
          event: "stripe_webhook_deferred_processing_failed",
          requestId,
          provider: "stripe",
          operation: "webhook_process",
          providerEventId: event.id,
          metadata: {
            stripeEventType: event.type,
            error: result.error,
          },
        });
      }
    });

    return NextResponse.json({ received: true, queued: true });
  } catch (dbError) {
    logEvent({
      level: "error",
      event: "stripe_webhook_persist_failed",
      requestId,
      provider: "stripe",
      operation: "webhook_persist",
      providerEventId: event.id,
      error: dbError,
    });
    return NextResponse.json(
      { error: "Webhook event could not be persisted" },
      { status: 500 },
    );
  }
}
