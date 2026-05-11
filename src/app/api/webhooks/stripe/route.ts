import { CACHE_TAGS } from "@/lib/cache-tags";
import { stripe } from "@/lib/stripe";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { sendMetaEvent, hashUserData } from "@/lib/meta/pixel";
import { syncHubSpotPaymentCompleted } from "@/lib/hubspot/payment-completed-sync";
import { query, queryOne, queryRaw } from "@/lib/db/neon";
import { createIntegrationEvent, type IntegrationProvider, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";

type PersistedStripeEvent = {
  id: string;
  processed: boolean;
  duplicate: boolean;
};

type StripeObjectRef = string | { id?: string } | null;

const STRIPE_EVENT_LOCK_TIMEOUT = "5 minutes";

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
    console.log("♻️ Revalidated stripe service prices cache");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error revalidating stripe price cache:", errorMessage);
  }
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

              const { data: paymentData, error: paymentError } = await resend.emails.send({
                from:
                  process.env.FROM_EMAIL ||
                  "Integrity Clean Solutions <info@pay.integritycleansolutions.com>",
                to: [customerEmail],
                subject: "Pago Confirmado - Integrity Clean Solutions",
                html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  <tr>
                    <td align="center" style="padding:40px 20px;">
                      <table role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        <tr>
                          <td style="padding:40px 40px 30px;text-align:center;border-bottom:3px solid #059669;">
                            <h1 style="margin:0;color:#059669;font-size:28px;font-weight:600;">Pago Confirmado</h1>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:40px;">
                            <p style="margin:0 0 20px;color:#333333;font-size:16px;line-height:1.6;">
                              Estimado/a <strong style="color:#059669;">${customerName}</strong>,
                            </p>
                            <p style="margin:0 0 30px;color:#333333;font-size:16px;line-height:1.6;">
                              Thank you for choosing Integrity Clean Solutions. We have received your payment and your service is confirmed.
                            </p>
                            <table role="presentation" style="width:100%;margin-bottom:30px;background-color:#f0fdf4;border-radius:6px;border-left:4px solid #059669;">
                              <tr>
                                <td style="padding:20px;">
                                  <h3 style="margin:0 0 15px;color:#059669;font-size:18px;font-weight:600;">Detalles del Pago</h3>
                                  <table role="presentation" style="width:100%;">
                                    <tr>
                                      <td style="padding:8px 0;color:#666666;font-size:14px;">ID de Transacción:</td>
                                      <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;font-family:monospace;">${session.id.substring(
                                        0,
                                        20,
                                      )}...</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0;color:#666666;font-size:14px;">Monto Pagado:</td>
                                      <td style="padding:8px 0;text-align:right;color:#059669;font-size:16px;font-weight:600;">$${session.amount_total
                                        ? (session.amount_total / 100).toFixed(2)
                                        : "N/A"}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0;color:#666666;font-size:14px;">Fecha de Pago:</td>
                                      <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;">${new Date().toLocaleDateString(
                                        "es-ES",
                                        {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                        },
                                      )}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0;color:#666666;font-size:14px;">Estado:</td>
                                      <td style="padding:8px 0;text-align:right;color:#059669;font-size:14px;font-weight:600;">Confirmado</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                            ${
                              quoteData.propertySize
                                ? `
                            <table role="presentation" style="width:100%;margin-bottom:30px;background-color:#f8f9fa;border-radius:6px;">
                              <tr>
                                <td style="padding:20px;">
                                  <h3 style="margin:0 0 15px;color:#2563eb;font-size:18px;font-weight:600;">Detalles del Servicio</h3>
                                  <p style="margin:0 0 10px;color:#333333;font-size:14px;line-height:1.6;">
                                    <strong>Propiedad:</strong> ${quoteData.propertySize} sq ft, ${quoteData.bedrooms} habitaciones, ${quoteData.bathrooms} baños
                                  </p>
                                  ${
                                    quoteData.frequency
                                      ? `<p style="margin:0 0 10px;color:#333333;font-size:14px;line-height:1.6;"><strong>Frecuencia:</strong> ${quoteData.frequency}</p>`
                                      : ""
                                  }
                                </td>
                              </tr>
                            </table>
                            `
                                : ""
                            }
                            <table role="presentation" style="width:100%;margin-bottom:30px;background-color:#fef3c7;border-radius:6px;border-left:4px solid #f59e0b;">
                              <tr>
                                <td style="padding:20px;">
                                  <h3 style="margin:0 0 15px;color:#f59e0b;font-size:18px;font-weight:600;">Próximos Pasos</h3>
                                  <ul style="margin:0;padding-left:20px;color:#92400e;font-size:14px;line-height:1.8;">
                                    <li style="margin-bottom:8px;">Our team will contact you within the next 24 hours to coordinate details</li>
                                    <li style="margin-bottom:8px;">We will confirm the service date and time based on your preference</li>
                                    <li>Recibirá un recordatorio 24 horas antes de la cita programada</li>
                                  </ul>
                                </td>
                              </tr>
                            </table>
                            <table role="presentation" style="width:100%;margin-top:40px;padding-top:30px;border-top:1px solid #e5e7eb;">
                              <tr>
                                <td style="text-align:center;padding-bottom:20px;">
                                  <p style="margin:0 0 10px;color:#059669;font-size:20px;font-weight:600;">Integrity Clean Solutions</p>
                                  <p style="margin:0 0 5px;color:#666666;font-size:14px;">Servicios de Limpieza Profesional</p>
                                </td>
                              </tr>
                              <tr>
                                <td style="text-align:center;padding:20px 0;">
                                  <p style="margin:0 0 8px;color:#999999;font-size:12px;line-height:1.6;">
                                  If you have any questions about your service, please contact us.
                                  </p>
                                  <p style="margin:0;color:#999999;font-size:12px;">
                                    <strong style="color:#666666;">Email:</strong> info@integritycleansolutions.com
                                  </p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <table role="presentation" style="width:100%;margin-top:20px;">
                        <tr>
                          <td style="text-align:center;padding:20px;">
                            <p style="margin:0;color:#999999;font-size:11px;">
                              This is an automated email. Please do not reply to this message.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
              });

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

            const { data: teamData, error: teamError } = await resend.emails.send({
              from:
                process.env.FROM_EMAIL ||
                "Integrity Clean Solutions <info@pay.integritycleansolutions.com>",
              to: [process.env.TO_EMAIL || "info@integritycleansolutions.com"],
              subject: "Nuevo Pago Recibido - Integrity Clean Solutions",
              html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f5f5f5;">
              <table role="presentation" style="width:100%;border-collapse:collapse;">
                <tr>
                  <td align="center" style="padding:40px 20px;">
                    <table role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                      <tr>
                        <td style="padding:40px 40px 30px;text-align:center;border-bottom:3px solid #059669;">
                          <h1 style="margin:0;color:#059669;font-size:28px;font-weight:600;">Nuevo Pago Recibido</h1>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:40px;">
                          <p style="margin:0 0 30px;color:#333333;font-size:16px;line-height:1.6;">
                            A successful payment has been processed in the system.
                          </p>
                          <table role="presentation" style="width:100%;margin-bottom:30px;background-color:#f0fdf4;border-radius:6px;border-left:4px solid #059669;">
                            <tr>
                              <td style="padding:20px;">
                                <h3 style="margin:0 0 15px;color:#059669;font-size:18px;font-weight:600;">Información del Pago</h3>
                                <table role="presentation" style="width:100%;">
                                  <tr>
                                    <td style="padding:8px 0;color:#666666;font-size:14px;">ID de Transacción:</td>
                                    <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;font-family:monospace;">${session.id.substring(
                                      0,
                                      25,
                                    )}...</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 0;color:#666666;font-size:14px;">Cliente:</td>
                                    <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;font-weight:600;">${
                                      session.metadata?.customerName || "N/A"
                                    }</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 0;color:#666666;font-size:14px;">Email del Cliente:</td>
                                    <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;">${
                                      session.customer_email || "N/A"
                                    }</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 0;color:#666666;font-size:14px;">Monto:</td>
                                    <td style="padding:8px 0;text-align:right;color:#059669;font-size:16px;font-weight:600;">$${session.amount_total
                                      ? (session.amount_total / 100).toFixed(2)
                                      : "N/A"}</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 0;color:#666666;font-size:14px;">Servicio:</td>
                                    <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;">${
                                      session.metadata?.serviceId || "N/A"
                                    }</td>
                                  </tr>
                                  <tr>
                                    <td style="padding:8px 0;color:#666666;font-size:14px;">Fecha y Hora:</td>
                                    <td style="padding:8px 0;text-align:right;color:#333333;font-size:14px;">${new Date().toLocaleString(
                                      "es-ES",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          <table role="presentation" style="width:100%;margin-bottom:30px;background-color:#f0f9ff;border-radius:6px;border-left:4px solid #0369a1;">
                            <tr>
                              <td style="padding:20px;">
                                <h3 style="margin:0 0 15px;color:#0369a1;font-size:18px;font-weight:600;">Acciones Requeridas</h3>
                                <ul style="margin:0;padding-left:20px;color:#1e40af;font-size:14px;line-height:1.8;">
                                  <li style="margin-bottom:8px;">Contact the customer to coordinate the service</li>
                                  <li style="margin-bottom:8px;">Schedule the service date and time</li>
                                  <li style="margin-bottom:8px;">Prepare the team and required supplies</li>
                                  <li>Send a reminder 24 hours before the service</li>
                                </ul>
                              </td>
                            </tr>
                          </table>
                          <table role="presentation" style="width:100%;margin-top:40px;padding-top:30px;border-top:1px solid #e5e7eb;">
                            <tr>
                              <td style="text-align:center;padding-bottom:20px;">
                                <p style="margin:0 0 10px;color:#059669;font-size:20px;font-weight:600;">Integrity Clean Solutions</p>
                                <p style="margin:0 0 5px;color:#666666;font-size:14px;">Sistema de Notificaciones Automáticas</p>
                              </td>
                            </tr>
                            <tr>
                              <td style="text-align:center;padding:20px 0;">
                                <p style="margin:0;color:#999999;font-size:12px;">
                                  This is an automated email generated by the payment system.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
              `,
            });

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
      case "product.updated":
      case "product.deleted":
      case "price.created":
      case "price.updated":
      case "price.deleted": {
        revalidateStripePriceCache();
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
