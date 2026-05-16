import { CACHE_TAGS } from "@/lib/cache-tags";
import { stripe } from "@/lib/stripe";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { sendMetaEvent, hashUserData } from "@/lib/meta/pixel";
import { syncHubSpotPaymentCompleted } from "@/lib/hubspot/payment-completed-sync";
import { query, queryOne, queryRaw } from "@/lib/db/neon";
import { createIntegrationEvent, type IntegrationProvider, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import {
  getEmailFooterAddress,
  renderPaymentConfirmationEmail,
  renderPaymentTeamNotificationEmail,
} from "@/lib/email";

type PersistedStripeEvent = {
  id: string;
  processed: boolean;
  duplicate: boolean;
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

const persistStripeEvent = async (event: Stripe.Event): Promise<PersistedStripeEvent> => {
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
};

const acquireStripeEventLock = async (eventId: string, handlerId: string): Promise<boolean> => {
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
};

const markEventProcessed = async (eventId: string): Promise<void> => {
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
};

const markEventFailed = async (eventId: string, error: unknown): Promise<void> => {
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
};

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
    console.log("♻️ Revalidated Stripe and services catalog caches");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error revalidating stripe price cache:", errorMessage);
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error revalidating service price paths:", errorMessage);
  }
};

const markStripeServicePriceSyncInvalid = async (
  input: {
    slug?: string | null;
    stripeProductId: string;
    status: string;
    error: string;
  },
): Promise<void> => {
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
};

const syncStripeProductPriceToService = async (
  productId: string,
): Promise<string | null> => {
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
};

const syncStripePriceEventToService = async (price: Stripe.Price): Promise<string | null> => {
  const productId = getStripeObjectId(price.product);
  if (!productId) {
    return null;
  }

  return syncStripeProductPriceToService(productId);
};

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Webhook signature verification failed:", errorMessage);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let persistedEvent: PersistedStripeEvent;
  try {
    persistedEvent = await persistStripeEvent(event);
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

  if (persistedEvent.duplicate && persistedEvent.processed) {
    return NextResponse.json({ received: true, duplicate: true, processed: true });
  }

  const handlerId = `${requestId}:${event.id}`;
  const lockAcquired = await acquireStripeEventLock(event.id, handlerId);
  if (!lockAcquired) {
    return NextResponse.json({ received: true, duplicate: persistedEvent.duplicate, locked: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn("💳 Payment successful:", session.id);

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
          const errorMessage = lookupError instanceof Error ? lookupError.message : "Unknown error";
          console.error("❌ Error buscando checkout_sessions:", errorMessage);
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

          if (!customerEmail) {
            console.warn("⚠️ No se encontró email del cliente en la sesión");
          } else {
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

            if (checkoutRecord?.payment_email_sent_at) {
              console.debug("📧 Email de confirmación ya enviado, se omite:", session.id);
            } else {
              console.warn("📧 Enviando email de confirmación de pago a:", customerEmail);
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
                console.error("❌ Error enviando email de confirmación de pago:", paymentError);
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
                console.warn("✅ Email de confirmación de pago enviado correctamente");
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
          const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
          console.error("❌ Error en envío de email de confirmación:", errorMessage);
        }

        try {
          if (checkoutRecord?.team_email_sent_at) {
            console.debug("📧 Notificación al equipo ya enviada, se omite:", session.id);
          } else {
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
              console.error("❌ Error enviando notificación de pago al equipo:", teamError);
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
              console.warn("✅ Notificación de pago enviada al equipo");
              if (checkoutRecord?.id) {
                await query(
                  `UPDATE checkout_sessions SET team_email_sent_at = NOW() WHERE id = $1`,
                  [checkoutRecord.id],
                );
              }
            }
          }
        } catch (teamEmailError) {
          const errorMessage =
            teamEmailError instanceof Error ? teamEmailError.message : "Unknown error";
          console.error("❌ Error en notificación de pago al equipo:", errorMessage);
        }

        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn("💳 Payment Intent succeeded:", paymentIntent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.warn("❌ Payment failed:", failedPayment.id);
        break;
      }
      case "checkout.session.expired": {
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.warn("⏰ Checkout session expired:", expiredSession.id);

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
        console.debug(`Unhandled event type: ${event.type}`);
    }

    await markEventProcessed(event.id);
  } catch (processingError) {
    await markEventFailed(event.id, processingError);
    logEvent({
      level: "error",
      event: "stripe_webhook_processing_failed",
      requestId,
      provider: "stripe",
      operation: "webhook_process",
      providerEventId: event.id,
      error: processingError,
      metadata: {
        stripeEventType: event.type,
      },
    });
    return NextResponse.json(
      { error: "Webhook event processing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
