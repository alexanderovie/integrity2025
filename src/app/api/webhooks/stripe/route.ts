import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { sendMetaEvent, hashUserData } from "@/lib/meta/pixel";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createDeal } from "@/lib/hubspot/deals";
import { DEAL_STAGES } from "@/lib/hubspot/pipeline";
import { enrichContact, enrichDeal } from "@/lib/hubspot/enrichment";
import { query, queryOne } from "@/lib/db/neon";

const markEventProcessed = async (eventId: string): Promise<void> => {
  try {
    await query(
      `UPDATE stripe_webhook_events SET processed = true, processed_at = NOW() WHERE event_id = $1`,
      [eventId]
    );
    console.log(`✅ Evento marcado como procesado: ${eventId}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error marcando evento como procesado:", errorMessage);
  }
};

const getResend = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest): Promise<NextResponse> {
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

  // === PERSISTENCIA EN DB (idempotente) ===
  try {
    const existingEvent = await queryOne<{ id: string }>(
      `SELECT id FROM stripe_webhook_events WHERE event_id = $1`,
      [event.id]
    );

    if (existingEvent) {
      console.log(`🔁 Webhook duplicado ignorado: ${event.id}`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    await query(
      `INSERT INTO stripe_webhook_events (event_id, type, payload, received_at)
       VALUES ($1, $2, $3, NOW())`,
      [event.id, event.type, JSON.stringify(event)]
    );

    console.log(`✅ Webhook persistido: ${event.id} (${event.type})`);
  } catch (dbError) {
    const errorMessage = dbError instanceof Error ? dbError.message : "Unknown DB error";
    console.error("❌ Error persistiendo webhook:", errorMessage);
    // No fallar el webhook por error de DB, solo loguear
  }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.warn("💳 Payment successful:", session.id);

        // === UPDATE checkout_sessions a 'paid' ===
        try {
          await query(
            `UPDATE checkout_sessions
             SET status = 'paid',
                 stripe_payment_intent_id = $1,
                 updated_at = NOW()
             WHERE stripe_session_id = $2`,
            [session.payment_intent, session.id],
          );
          console.log("✅ checkout_sessions marcado como paid:", session.id);
        } catch (updateError) {
          const errorMessage = updateError instanceof Error ? updateError.message : "Unknown error";
          console.error("❌ Error actualizando checkout_sessions:", errorMessage);
        }

        // Track Purchase event via CAPI
      try {
        const customPrice = session.metadata?.customPrice || "0";
        const purchaseValue = parseInt(customPrice) / 100; // Convert from cents to dollars

        interface MetaUserData {
          em?: string;
          external_id?: string;
        }

        const userData: MetaUserData = {} as MetaUserData;
        if (session.customer_email) {
          userData.em = await hashUserData(session.customer_email);
          userData.external_id = session.customer_email.split("@")[0];
        }

        await sendMetaEvent(
          "Purchase",
          userData,
          {
            value: purchaseValue,
            currency: "USD",
            content_name: session.metadata?.serviceId || "Cleaning Service",
            content_category: "Cleaning Service",
          },
          {
            eventId: session.id, // Use Stripe session ID as event_id for deduplication
          }
        );
      } catch (pixelError) {
        console.error("Error tracking Purchase event:", pixelError);
      }

      try {
        const customerEmail = session.customer_email;
        const customerName = session.metadata?.customerName || "Cliente";
        const customPrice = session.metadata?.customPrice || "0";
        const quoteData = session.metadata?.quoteData
          ? JSON.parse(session.metadata.quoteData)
          : {};

        if (customerEmail) {
          // Sincronizar con HubSpot
          try {
            const nameParts = customerName.split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            // Crear o actualizar contacto en HubSpot
            const contact = await createOrUpdateContact({
              email: customerEmail,
              firstname: firstName,
              lastname: lastName,
              phone: quoteData.phone || quoteData.phone || "",
              zip: quoteData.zipCode || quoteData.zip || "",
              address: quoteData.address || "",
            });

            console.log("✅ Contacto sincronizado en HubSpot:", contact.id);

            // Enriquecer contacto con datos calculados
            await enrichContact(customerEmail, {
              propertySize: quoteData.propertySize ? parseInt(quoteData.propertySize) : undefined,
              bedrooms: quoteData.bedrooms ? parseInt(quoteData.bedrooms) : undefined,
              bathrooms: quoteData.bathrooms ? parseInt(quoteData.bathrooms) : undefined,
              serviceCount: quoteData.services ? (Array.isArray(quoteData.services) ? quoteData.services.length : quoteData.services.split(",").length) : undefined,
              serviceFrequency: quoteData.frequency || undefined,
              hasQuoteForm: true,
              hasPayment: true,
              hasPaymentCompleted: true,
              zip: quoteData.zipCode || quoteData.zip || undefined,
            });

            // Crear deal en HubSpot con el nuevo pipeline
            const dealAmount = (parseInt(customPrice) / 100).toString();
            const dealName = `Cleaning Service - ${customerName} - $${dealAmount}`;

            const deal = await createDeal(
              {
                dealname: dealName,
                amount: dealAmount,
                dealstage: DEAL_STAGES.PAYMENT_COMPLETED, // Usar nuevo pipeline
                description: `Servicio de limpieza. Propiedad: ${quoteData.propertySize || "N/A"} sq ft, ${quoteData.bedrooms || "N/A"} habitaciones, ${quoteData.bathrooms || "N/A"} baños. Frecuencia: ${quoteData.frequency || "One-time"}`,
                property_size: quoteData.propertySize?.toString(),
                bedrooms: quoteData.bedrooms?.toString(),
                bathrooms: quoteData.bathrooms?.toString(),
                services_requested: quoteData.services ? (Array.isArray(quoteData.services) ? quoteData.services.join(", ") : quoteData.services) : undefined,
              },
              customerEmail
            );

            console.log("✅ Deal creado en HubSpot:", deal.id);

            // Enriquecer deal con datos calculados
            await enrichDeal(deal.id, {
              propertySize: quoteData.propertySize ? parseInt(quoteData.propertySize) : undefined,
              bedrooms: quoteData.bedrooms ? parseInt(quoteData.bedrooms) : undefined,
              bathrooms: quoteData.bathrooms ? parseInt(quoteData.bathrooms) : undefined,
              servicesRequested: quoteData.services ? (Array.isArray(quoteData.services) ? quoteData.services.join(", ") : quoteData.services) : undefined,
            });
          } catch (hubspotError) {
            // No fallar el webhook si HubSpot falla
            console.error("⚠️ Error sincronizando con HubSpot:", hubspotError);
          }

          console.warn("📧 Enviando email de confirmación de pago a:", customerEmail);
          const resend = getResend();

          const { error: paymentError } = await resend.emails.send({
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
                              Gracias por confiar en Integrity Clean Solutions. Hemos recibido su pago y su servicio ha sido confirmado exitosamente.
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
                                      <td style="padding:8px 0;text-align:right;color:#059669;font-size:16px;font-weight:600;">$${(
                                        parseInt(customPrice) / 100
                                      ).toFixed(2)}</td>
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
                                    <li style="margin-bottom:8px;">Nuestro equipo se pondrá en contacto con usted en las próximas 24 horas para coordinar los detalles</li>
                                    <li style="margin-bottom:8px;">Confirmaremos la fecha y hora del servicio según su preferencia</li>
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
                                    Si tiene alguna pregunta sobre su servicio, no dude en contactarnos.
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
                              Este es un correo automático. Por favor, no responda a este mensaje.
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
            console.error("❌ Error enviando email de confirmación de pago:", paymentError);
          } else {
            console.warn("✅ Email de confirmación de pago enviado correctamente");
          }
        } else {
          console.warn("⚠️ No se encontró email del cliente en la sesión");
        }
      } catch (emailError) {
        const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
        console.error("❌ Error en envío de email de confirmación:", errorMessage);
      }

      try {
        const resend = getResend();
        const { error: teamError } = await resend.emails.send({
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
                            Se ha procesado un pago exitoso en el sistema de pagos.
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
                                    <td style="padding:8px 0;text-align:right;color:#059669;font-size:16px;font-weight:600;">$${session.metadata
                                      ?.customPrice
                                      ? (
                                          parseInt(session.metadata.customPrice) / 100
                                        ).toFixed(2)
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
                                  <li style="margin-bottom:8px;">Contactar al cliente para coordinar el servicio</li>
                                  <li style="margin-bottom:8px;">Programar la fecha y hora del servicio</li>
                                  <li style="margin-bottom:8px;">Preparar equipo y suministros necesarios</li>
                                  <li>Enviar recordatorio 24 horas antes del servicio</li>
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
                                  Este es un correo automático generado por el sistema de pagos.
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
          console.error("❌ Error enviando notificación de pago al equipo:", teamError);
        } else {
          console.warn("✅ Notificación de pago enviada al equipo");
        }
        } catch (teamEmailError) {
          const errorMessage =
            teamEmailError instanceof Error ? teamEmailError.message : "Unknown error";
          console.error("❌ Error en notificación de pago al equipo:", errorMessage);
        }

        await markEventProcessed(event.id);
        break;
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn("💳 Payment Intent succeeded:", paymentIntent.id);
        await markEventProcessed(event.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.warn("❌ Payment failed:", failedPayment.id);
        await markEventProcessed(event.id);
        break;
      }
      case "checkout.session.expired": {
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        console.warn("⏰ Checkout session expired:", expiredSession.id);

        // === UPDATE checkout_sessions a 'expired' ===
        try {
          await query(
            `UPDATE checkout_sessions
             SET status = 'expired', updated_at = NOW()
             WHERE stripe_session_id = $1`,
            [expiredSession.id],
          );
          console.log("✅ checkout_sessions marcado como expired:", expiredSession.id);
        } catch (updateError) {
          const errorMessage = updateError instanceof Error ? updateError.message : "Unknown error";
          console.error("❌ Error actualizando checkout_sessions (expired):", errorMessage);
        }

        await markEventProcessed(event.id);
        break;
      }
      default:
        console.warn(`Unhandled event type: ${event.type}`);
        await markEventProcessed(event.id);
    }

  return NextResponse.json({ received: true });
}
