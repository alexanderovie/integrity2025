import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Endpoint para recibir webhooks de HubSpot
 *
 * HubSpot envía eventos cuando se crean/actualizan contactos, deals, etc.
 * Este endpoint procesa esos eventos y puede sincronizar con tu sistema
 */

const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hubspot-signature-v3");

    // Verificar la firma del webhook (seguridad)
    if (HUBSPOT_CLIENT_SECRET && signature) {
      const isValid = verifyWebhookSignature(
        body,
        signature,
        HUBSPOT_CLIENT_SECRET
      );

      if (!isValid) {
        console.error("❌ Firma de webhook inválida");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const events = JSON.parse(body);

    // Procesar cada evento
    for (const event of events) {
      await processWebhookEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error procesando webhook de HubSpot:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Verifica la firma del webhook usando el client secret
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hash = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  } catch (error) {
    return false;
  }
}

/**
 * Procesa un evento individual del webhook
 */
async function processWebhookEvent(event: any): Promise<void> {
  const { subscriptionType, objectId, propertyName, propertyValue } = event;

  console.log("📥 Webhook recibido:", {
    subscriptionType,
    objectId,
    propertyName,
    propertyValue,
  });

  // Ejemplos de procesamiento según el tipo de evento
  switch (subscriptionType) {
    case "contact.creation":
      console.log("✅ Nuevo contacto creado:", objectId);
      // Aquí puedes hacer algo cuando se crea un contacto
      break;

    case "contact.propertyChange":
      console.log(
        `📝 Propiedad ${propertyName} del contacto ${objectId} cambió a: ${propertyValue}`
      );
      // Aquí puedes hacer algo cuando cambia una propiedad
      break;

    case "deal.creation":
      console.log("✅ Nuevo deal creado:", objectId);
      // Aquí puedes hacer algo cuando se crea un deal
      break;

    case "deal.propertyChange":
      console.log(
        `📝 Propiedad ${propertyName} del deal ${objectId} cambió a: ${propertyValue}`
      );
      // Si el deal se marca como "won", puedes hacer algo
      if (propertyName === "dealstage" && propertyValue === "closedwon") {
        console.log("🎉 Deal ganado:", objectId);
      }
      break;

    default:
      console.log("ℹ️ Evento no procesado:", subscriptionType);
  }
}
