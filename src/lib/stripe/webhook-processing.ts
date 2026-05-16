import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { Resend } from "resend";
import Stripe from "stripe";

import { CACHE_TAGS } from "@/lib/cache-tags";
import { query, queryOne, queryRaw } from "@/lib/db/neon";
import {
  getEmailFooterAddress,
  renderPaymentConfirmationEmail,
  renderPaymentTeamNotificationEmail,
} from "@/lib/email";
import { syncHubSpotPaymentCompleted } from "@/lib/hubspot/payment-completed-sync";
import { sendMetaEvent, hashUserData } from "@/lib/meta/pixel";
import { createIntegrationEvent, type IntegrationProvider, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, logEvent } from "@/lib/observability/logger";
import { stripe } from "@/lib/stripe";

export type PersistedStripeEvent = {
  id: string;
  processed: boolean;
  duplicate: boolean;
};

export type StripeWebhookRetryCandidate = {
  event_id: string;
  type: string;
  payload: Stripe.Event;
  attempt_count: number;
  next_retry_at: string | null;
  received_at: string;
};

export type StripeWebhookProcessResult = {
  eventId: string;
  type: string;
  status: "processed" | "locked" | "failed";
  error?: string;
};

type StripeObjectRef = string | { id?: string } | null;

const STRIPE_EVENT_LOCK_TIMEOUT = "5 minutes";

const formatPaymentAmount = (amountTotal: number | null): string => {
  if (typeof amountTotal !== "number") return "N/A";
  return `$${(amountTotal / 100).toFixed(2)}`;
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDateTime = (date: Date): string => {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStripeObjectId = (value: StripeObjectRef): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id || null;
};

export async function persistStripeEvent(event: Stripe.Event): Promise<PersistedStripeEvent> {
  const result = await queryRaw<PersistedStripeEvent>(
    `
      WITH inserted AS (
        INSERT INTO stripe_webhook_events (event_id, type, payload, received_at)
        VALUES ($1, $2, $3::jsonb, NOW())
        ON CONFLICT (event_id) DO NOTHING
        RETURNING id, processed, false AS duplicate
      )
      SELECT id, processed, duplicate FROM inserted
      UNION ALL
      SELECT id, processed, true AS duplicate
      FROM stripe_webhook_events
      WHERE event_id = $1
        AND NOT EXISTS (SELECT 1 FROM inserted)
      LIMIT 1
    `,
    [event.id, event.type, JSON.stringify(event)],
    {
      name: "stripe_webhook_event_persist",
      context: "stripe_webhook",
    },
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error(`Stripe webhook event ${event.id} was not persisted.`);
  }

  return row;
}

async function acquireStripeEventLock(eventId: string, handlerId: string): Promise<boolean> {
  const result = await queryRaw(
    `
      UPDATE stripe_webhook_events
      SET
        locked_by = $2,
        locked_at = NOW(),
        attempt_count = COALESCE(attempt_count, 0) + 1
      WHERE event_id = $1
        AND processed = false
        AND (
          locked_at IS NULL
          OR locked_at < NOW() - $3::interval
        )
      RETURNING id
    `,
    [eventId, handlerId, STRIPE_EVENT_LOCK_TIMEOUT],
    {
      name: "stripe_webhook_event_lock",
      context: "stripe_webhook",
    },
  );

  return result.rowCount === 1;
}

async function markEventProcessed(eventId: string): Promise<void> {
  await query(
    `
      UPDATE stripe_webhook_events
      SET
        processed = true,
        processed_at = NOW(),
        next_retry_at = NULL,
        locked_by = NULL,
        locked_at = NULL,
        error = NULL
      WHERE event_id = $1
    `,
    [eventId],
    {
      name: "stripe_webhook_event_processed",
      context: "stripe_webhook",
    },
  );
}

async function markEventFailed(eventId: string, error: unknown): Promise<void> {
  await query(
    `
      UPDATE stripe_webhook_events
      SET
        error = $2,
        next_retry_at = NOW() + INTERVAL '5 minutes',
        locked_by = NULL,
        locked_at = NULL
      WHERE event_id = $1
    `,
    [eventId, getErrorMessage(error)],
    {
      name: "stripe_webhook_event_failed",
      context: "stripe_webhook",
    },
  );
}

const runProviderSideEffect = async (
  input: {
    requestId: string;
    stripeEventId: string;
    provider: IntegrationProvider;
    operation: string;
    metadata?: Record<string, unknown>;
  },
  action: () => Promise<string | null | undefined>,
): Promise<void> => {
  let integrationEventId: string | null = null;

  try {
    integrationEventId = await createIntegrationEvent({
      requestId: input.requestId,
      provider: input.provider,
      operation: input.operation,
      status: "processing",
      providerEventId: input.stripeEventId,
      idempotencyKey: `${input.provider}:stripe:${input.operation}:${input.stripeEventId}`,
      metadata: {
        source: "stripe_webhook",
        stripeEventId: input.stripeEventId,
        ...input.metadata,
      },
    });

    const providerObjectId = await action();
    await updateIntegrationEvent(integrationEventId, {
      status: "succeeded",
      providerObjectId,
    });
  } catch (error) {
    if (integrationEventId) {
      await updateIntegrationEvent(integrationEventId, {
        status: "failed",
        lastError: getErrorMessage(error),
      });
    }

    logEvent({
      level: "error",
      event: "stripe_provider_side_effect_failed",
      requestId: input.requestId,
      integrationEventId,
      provider: input.provider,
      operation: input.operation,
      providerEventId: input.stripeEventId,
      error,
    });
  }
};

const getResend = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
};

const revalidateStripePriceCache = (): void => {
  try {
    revalidateTag(CACHE_TAGS.stripeServicePrices, "max");
    revalidateTag(CACHE_TAGS.servicesCatalog, "max");
  } catch (error) {
    console.error("[stripe-webhook] Error revalidating stripe price cache:", getErrorMessage(error));
  }
};

const revalidateServicePricePaths = (slug?: string | null): void => {
  try {
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/quote");

    if (slug) {
      revalidatePath(`/services/${slug}`);
      revalidatePath(`/quote/${slug}`);
    }
  } catch (error) {
    console.error("[stripe-webhook] Error revalidating service price paths:", getErrorMessage(error));
  }
};

async function markStripeServicePriceSyncInvalid(input: {
  slug?: string | null;
  stripeProductId: string;
  status: string;
  error: string;
}): Promise<void> {
  if (!input.slug) {
    await query(
      `UPDATE public.services
       SET stripe_price_sync_status = $2,
           stripe_price_sync_error = $3,
           stripe_price_synced_at = NOW(),
           actualizado_en = NOW()
       WHERE stripe_product_id = $1`,
      [input.stripeProductId, input.status, input.error],
      {
        name: "stripe_service_price_sync_invalid_by_product",
        context: "stripe_catalog_sync",
      },
    );
    return;
  }

  await query(
    `UPDATE public.services
     SET stripe_product_id = $2,
         stripe_price_sync_status = $3,
         stripe_price_sync_error = $4,
         stripe_price_synced_at = NOW(),
         actualizado_en = NOW()
     WHERE slug = $1`,
    [input.slug, input.stripeProductId, input.status, input.error],
    {
      name: "stripe_service_price_sync_invalid_by_slug",
      context: "stripe_catalog_sync",
    },
  );
}

async function syncStripeProductPriceToService(productId: string): Promise<string | null> {
  const product = await stripe.products.retrieve(productId);
  if (product.deleted) {
    await markStripeServicePriceSyncInvalid({
      stripeProductId: productId,
      status: "product_deleted",
      error: "Stripe product was deleted.",
    });
    return null;
  }

  const slug = product.metadata?.service_slug;
  if (!slug) {
    console.debug("[stripe-catalog-sync] Product has no service_slug metadata; skipping", {
      productId,
    });
    return null;
  }

  if (!product.active) {
    await markStripeServicePriceSyncInvalid({
      slug,
      stripeProductId: product.id,
      status: "product_inactive",
      error: "Stripe product is inactive.",
    });
    return slug;
  }

  const prices = await stripe.prices.list({
    active: true,
    product: product.id,
    type: "one_time",
    limit: 2,
  });

  if (prices.data.length !== 1) {
    await markStripeServicePriceSyncInvalid({
      slug,
      stripeProductId: product.id,
      status: "invalid_active_price_count",
      error: `Expected exactly one active one-time Stripe price, found ${prices.data.length}.`,
    });
    return slug;
  }

  const price = prices.data[0];
  if (!price || price.unit_amount === null || price.currency !== "usd") {
    await markStripeServicePriceSyncInvalid({
      slug,
      stripeProductId: product.id,
      status: "invalid_price",
      error: "Stripe price must be one-time USD with unit_amount.",
    });
    return slug;
  }

  const updateResult = await queryRaw(
    `UPDATE public.services
     SET precio_base = $2,
         stripe_product_id = $3,
         stripe_price_id = $4,
         stripe_price_currency = $5,
         stripe_price_synced_at = NOW(),
         stripe_price_sync_status = 'synced',
         stripe_price_sync_error = NULL,
         actualizado_en = NOW()
     WHERE slug = $1
     RETURNING id`,
    [slug, price.unit_amount, product.id, price.id, price.currency],
    {
      name: "stripe_service_price_sync",
      context: "stripe_catalog_sync",
    },
  );

  if (updateResult.rowCount === 0) {
    console.warn("[stripe-catalog-sync] No active service matched Stripe service_slug", {
      productId: product.id,
      slug,
    });
    return slug;
  }

  await query(
    `UPDATE public.service_pricing_rules
     SET min_price_cents = $2,
         updated_at = NOW()
     WHERE service_id IN (
       SELECT id FROM public.services WHERE slug = $1
     )`,
    [slug, price.unit_amount],
    {
      name: "stripe_service_min_price_sync",
      context: "stripe_catalog_sync",
    },
  );

  return slug;
}

async function syncStripePriceEventToService(price: Stripe.Price): Promise<string | null> {
  const productId = getStripeObjectId(price.product);
  if (!productId) {
    return null;
  }

  return syncStripeProductPriceToService(productId);
}

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  session: Stripe.Checkout.Session,
  requestId: string,
): Promise<void> {
  const paymentIntentId = getStripeObjectId(session.payment_intent);
  const updateResult = await queryRaw(
    `UPDATE checkout_sessions
     SET status = 'paid',
         stripe_payment_intent_id = $1,
         paid_at = COALESCE(paid_at, NOW()),
         updated_at = NOW()
     WHERE stripe_session_id = $2
        OR id = NULLIF($3, '')::uuid`,
    [paymentIntentId, session.id, session.metadata?.checkout_id || ""],
    {
      name: "stripe_checkout_session_mark_paid",
      context: "stripe_webhook",
    },
  );

  if (updateResult.rowCount === 0) {
    throw new Error(`No checkout_session found for Stripe session ${session.id}.`);
  }

  await runProviderSideEffect(
    {
      requestId,
      stripeEventId: event.id,
      provider: "meta",
      operation: "purchase_capi",
      metadata: {
        stripeSessionId: session.id,
      },
    },
    async () => {
      const purchaseValue = (session.amount_total || 0) / 100;

      interface MetaUserData {
        em?: string;
        external_id?: string;
      }

      const userData: MetaUserData = {};
      if (session.customer_email) {
        userData.em = await hashUserData(session.customer_email);
        userData.external_id = session.customer_email.split("@")[0];
      }

      const result = await sendMetaEvent(
        "Purchase",
        userData,
        {
          value: purchaseValue,
          currency: "USD",
          content_name: session.metadata?.serviceId || "Cleaning Service",
          content_category: "Cleaning Service",
        },
        {
          eventId: session.id,
        },
      );

      if (!result.success) {
        throw new Error(result.error || "Meta CAPI purchase event failed.");
      }

      return result.fbtrace_id;
    },
  );

  let checkoutRecord: { id: string; payment_email_sent_at: string | null; team_email_sent_at: string | null } | null = null;
  try {
    checkoutRecord = await queryOne(
      `SELECT id, payment_email_sent_at, team_email_sent_at
       FROM checkout_sessions
       WHERE stripe_session_id = $1`,
      [session.id],
    );
  } catch (lookupError) {
    console.error("[stripe-webhook] Error loading checkout session:", getErrorMessage(lookupError));
  }

  try {
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = session.metadata?.customerName || session.customer_details?.name || "Cliente";
    const quoteData = session.metadata?.quoteData
      ? JSON.parse(session.metadata.quoteData) as {
          propertySize?: string;
          bedrooms?: string;
          bathrooms?: string;
          frequency?: string;
          services?: string | string[];
        }
      : {};

    if (customerEmail) {
      await runProviderSideEffect(
        {
          requestId,
          stripeEventId: event.id,
          provider: "hubspot",
          operation: "payment_completed_sync",
          metadata: {
            stripeSessionId: session.id,
          },
        },
        async () => syncHubSpotPaymentCompleted(session),
      );

      if (!checkoutRecord?.payment_email_sent_at) {
        const resend = getResend();
        const paymentEmailEventId = await createIntegrationEvent({
          requestId,
          provider: "resend",
          operation: "payment_confirmation_email",
          status: "processing",
          providerEventId: event.id,
          idempotencyKey: `resend:stripe:payment_confirmation_email:${event.id}`,
          metadata: {
            source: "stripe_webhook",
            stripeSessionId: session.id,
          },
        });

        const paymentRenderedEmail = await renderPaymentConfirmationEmail({
          customerName,
          transactionId: `${session.id.substring(0, 20)}...`,
          amount: formatPaymentAmount(session.amount_total),
          paidAt: formatDate(new Date()),
          propertySize: quoteData.propertySize,
          bedrooms: quoteData.bedrooms,
          bathrooms: quoteData.bathrooms,
          frequency: quoteData.frequency,
          footerAddress: getEmailFooterAddress(),
        });
        const { data: paymentData, error: paymentError } = await resend.emails.send(
          {
            from:
              process.env.FROM_EMAIL ||
              "Integrity Clean Solutions <info@pay.integritycleansolutions.com>",
            to: [customerEmail],
            subject: paymentRenderedEmail.subject,
            html: paymentRenderedEmail.html,
            text: paymentRenderedEmail.text,
          },
          { idempotencyKey: `resend:stripe:payment_confirmation_email:${event.id}` },
        );

        if (paymentError) {
          await updateIntegrationEvent(paymentEmailEventId, {
            status: "failed",
            lastError: getErrorMessage(paymentError),
          });
        } else {
          await updateIntegrationEvent(paymentEmailEventId, {
            status: "succeeded",
            providerObjectId: paymentData?.id,
            metadata: {
              source: "stripe_webhook",
              stripeSessionId: session.id,
              templateName: paymentRenderedEmail.templateName,
              templateVersion: paymentRenderedEmail.templateVersion,
            },
          });
          if (checkoutRecord?.id) {
            await query(
              `UPDATE checkout_sessions SET payment_email_sent_at = NOW() WHERE id = $1`,
              [checkoutRecord.id],
            );
          }
        }
      }
    }
  } catch (emailError) {
    console.error("[stripe-webhook] Customer confirmation side effect failed:", getErrorMessage(emailError));
  }

  try {
    if (!checkoutRecord?.team_email_sent_at) {
      const resend = getResend();
      const teamEmailEventId = await createIntegrationEvent({
        requestId,
        provider: "resend",
        operation: "payment_team_notification",
        status: "processing",
        providerEventId: event.id,
        idempotencyKey: `resend:stripe:payment_team_notification:${event.id}`,
        metadata: {
          source: "stripe_webhook",
          stripeSessionId: session.id,
        },
      });

      const teamRenderedEmail = await renderPaymentTeamNotificationEmail({
        transactionId: `${session.id.substring(0, 25)}...`,
        customerName: session.metadata?.customerName || "N/A",
        customerEmail: session.customer_email || "N/A",
        amount: formatPaymentAmount(session.amount_total),
        serviceId: session.metadata?.serviceId || null,
        paidAt: formatDateTime(new Date()),
        footerAddress: getEmailFooterAddress(),
      });
      const { data: teamData, error: teamError } = await resend.emails.send(
        {
          from:
            process.env.FROM_EMAIL ||
            "Integrity Clean Solutions <info@pay.integritycleansolutions.com>",
          to: [process.env.TO_EMAIL || "info@integritycleansolutions.com"],
          subject: teamRenderedEmail.subject,
          html: teamRenderedEmail.html,
          text: teamRenderedEmail.text,
        },
        { idempotencyKey: `resend:stripe:payment_team_notification:${event.id}` },
      );

      if (teamError) {
        await updateIntegrationEvent(teamEmailEventId, {
          status: "failed",
          lastError: getErrorMessage(teamError),
        });
      } else {
        await updateIntegrationEvent(teamEmailEventId, {
          status: "succeeded",
          providerObjectId: teamData?.id,
          metadata: {
            source: "stripe_webhook",
            stripeSessionId: session.id,
            templateName: teamRenderedEmail.templateName,
            templateVersion: teamRenderedEmail.templateVersion,
          },
        });
        if (checkoutRecord?.id) {
          await query(
            `UPDATE checkout_sessions SET team_email_sent_at = NOW() WHERE id = $1`,
            [checkoutRecord.id],
          );
        }
      }
    }
  } catch (teamEmailError) {
    console.error("[stripe-webhook] Team notification side effect failed:", getErrorMessage(teamEmailError));
  }
}

async function handleStripeWebhookEvent(event: Stripe.Event, requestId: string): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(event, session, requestId);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await query(
        `UPDATE checkout_sessions
         SET status = CASE WHEN status = 'paid' THEN status ELSE 'paid' END,
             stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, $1),
             paid_at = COALESCE(paid_at, NOW()),
             updated_at = NOW()
         WHERE stripe_payment_intent_id = $1
           AND status IN ('created', 'redirected', 'unknown')`,
        [paymentIntent.id],
        {
          name: "stripe_checkout_session_mark_paid_by_payment_intent",
          context: "stripe_webhook",
        },
      );
      break;
    }
    case "payment_intent.payment_failed": {
      const failedPayment = event.data.object as Stripe.PaymentIntent;
      await query(
        `UPDATE checkout_sessions
         SET status = 'payment_failed',
             stripe_payment_intent_id = COALESCE(stripe_payment_intent_id, $1),
             updated_at = NOW()
         WHERE stripe_payment_intent_id = $1
           AND status IN ('created', 'redirected', 'unknown')`,
        [failedPayment.id],
        {
          name: "stripe_checkout_session_mark_failed_by_payment_intent",
          context: "stripe_webhook",
        },
      );
      break;
    }
    case "checkout.session.expired": {
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      const updateResult = await queryRaw(
        `UPDATE checkout_sessions
         SET status = 'expired', updated_at = NOW()
         WHERE stripe_session_id = $1`,
        [expiredSession.id],
        {
          name: "stripe_checkout_session_mark_expired",
          context: "stripe_webhook",
        },
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`No checkout_session found for expired Stripe session ${expiredSession.id}.`);
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = getStripeObjectId(charge.payment_intent);
      if (!paymentIntentId) {
        throw new Error(`Refunded charge ${charge.id} has no payment_intent.`);
      }

      const updateResult = await queryRaw(
        `UPDATE checkout_sessions
         SET status = 'refunded', updated_at = NOW()
         WHERE stripe_payment_intent_id = $1`,
        [paymentIntentId],
        {
          name: "stripe_checkout_session_mark_refunded",
          context: "stripe_webhook",
        },
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`No checkout_session found for refunded payment_intent ${paymentIntentId}.`);
      }
      break;
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const paymentIntentId = getStripeObjectId(dispute.payment_intent);
      if (!paymentIntentId) {
        throw new Error(`Dispute ${dispute.id} has no payment_intent.`);
      }

      const updateResult = await queryRaw(
        `UPDATE checkout_sessions
         SET status = 'disputed', updated_at = NOW()
         WHERE stripe_payment_intent_id = $1`,
        [paymentIntentId],
        {
          name: "stripe_checkout_session_mark_disputed",
          context: "stripe_webhook",
        },
      );

      if (updateResult.rowCount === 0) {
        throw new Error(`No checkout_session found for disputed payment_intent ${paymentIntentId}.`);
      }
      break;
    }
    case "product.created":
    case "product.updated": {
      const product = event.data.object as Stripe.Product;
      const slug = await syncStripeProductPriceToService(product.id);
      revalidateStripePriceCache();
      revalidateServicePricePaths(slug);
      break;
    }
    case "product.deleted": {
      const product = event.data.object as Stripe.Product;
      await markStripeServicePriceSyncInvalid({
        stripeProductId: product.id,
        status: "product_deleted",
        error: "Stripe product was deleted.",
      });
      revalidateStripePriceCache();
      revalidateServicePricePaths();
      break;
    }
    case "price.created":
    case "price.updated":
    case "price.deleted": {
      const price = event.data.object as Stripe.Price;
      const slug = await syncStripePriceEventToService(price);
      revalidateStripePriceCache();
      revalidateServicePricePaths(slug);
      break;
    }
    default:
      console.debug(`[stripe-webhook] Unhandled event type: ${event.type}`);
  }
}

export async function processStripeWebhookEvent(
  event: Stripe.Event,
  input: {
    requestId: string;
    workerId?: string;
  },
): Promise<StripeWebhookProcessResult> {
  const workerId = input.workerId || `${input.requestId}:${event.id}`;
  const lockAcquired = await acquireStripeEventLock(event.id, workerId);
  if (!lockAcquired) {
    return {
      eventId: event.id,
      type: event.type,
      status: "locked",
    };
  }

  try {
    await handleStripeWebhookEvent(event, input.requestId);
    await markEventProcessed(event.id);
    return {
      eventId: event.id,
      type: event.type,
      status: "processed",
    };
  } catch (processingError) {
    await markEventFailed(event.id, processingError);
    logEvent({
      level: "error",
      event: "stripe_webhook_processing_failed",
      requestId: input.requestId,
      provider: "stripe",
      operation: "webhook_process",
      providerEventId: event.id,
      error: processingError,
      metadata: {
        stripeEventType: event.type,
      },
    });
    return {
      eventId: event.id,
      type: event.type,
      status: "failed",
      error: getErrorMessage(processingError),
    };
  }
}

export async function listDueStripeWebhookEvents(limit: number): Promise<StripeWebhookRetryCandidate[]> {
  return query<StripeWebhookRetryCandidate>(
    `
      SELECT event_id, type, payload, attempt_count, next_retry_at, received_at
      FROM public.stripe_webhook_events
      WHERE processed = false
        AND (next_retry_at IS NULL OR next_retry_at <= now())
        AND (
          locked_at IS NULL
          OR locked_at < now() - $2::interval
        )
      ORDER BY COALESCE(next_retry_at, received_at) ASC
      LIMIT $1
    `,
    [Math.max(1, Math.min(limit, 50)), STRIPE_EVENT_LOCK_TIMEOUT],
    {
      name: "stripe_webhook_events_due_list",
      context: "stripe_webhook_retry",
    },
  );
}

export async function processDueStripeWebhookEvents(input: {
  requestId: string;
  limit: number;
}): Promise<StripeWebhookProcessResult[]> {
  const events = await listDueStripeWebhookEvents(input.limit);
  const results: StripeWebhookProcessResult[] = [];

  for (const row of events) {
    results.push(
      await processStripeWebhookEvent(row.payload, {
        requestId: input.requestId,
        workerId: `${input.requestId}:stripe-webhook-retry:${row.event_id}`,
      }),
    );
  }

  return results;
}
