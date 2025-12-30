import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Endpoint para recibir webhooks de HubSpot
 *
 * Documentación oficial: https://developers.hubspot.com/docs/api-reference/webhooks-webhooks-v3
 *
 * Este endpoint procesa eventos de HubSpot cuando se crean/actualizan contactos, deals, etc.
 * Implementa verificación de firma según las mejores prácticas de seguridad de HubSpot.
 */

const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const ENABLE_WEBHOOK_VERIFICATION = process.env.ENABLE_HUBSPOT_WEBHOOK_VERIFICATION !== "false";

/**
 * Verifica la firma del webhook usando el client secret
 *
 * HubSpot envía la firma en el header x-hubspot-signature-v3
 * La firma es un HMAC SHA256 del body usando el client secret
 *
 * Referencia: https://developers.hubspot.com/docs/api-reference/webhooks-webhooks-v3/guide
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Crear HMAC SHA256 del body usando el client secret
    const hash = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("hex");

    // Comparación timing-safe para prevenir timing attacks
    if (signature.length !== hash.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch (error) {
    console.error("Error en verificación de firma:", error);
    return false;
  }
}

interface HubSpotWebhookEvent {
  subscriptionType: string;
  objectId: string;
  propertyName?: string;
  propertyValue?: string;
}

/**
 * Procesa un evento individual del webhook
 */
async function processWebhookEvent(event: HubSpotWebhookEvent): Promise<void> {
  const { subscriptionType, objectId, propertyName, propertyValue } = event;

  console.log("📥 Webhook recibido:", {
    subscriptionType,
    objectId,
    propertyName,
    propertyValue,
  });

  // Procesar eventos según el tipo
  switch (subscriptionType) {
    case "contact.creation":
      console.log("✅ Nuevo contacto creado en HubSpot:", objectId);
      // Aquí puedes sincronizar con tu base de datos si es necesario
      break;

    case "contact.propertyChange":
      console.log(
        `📝 Propiedad ${propertyName} del contacto ${objectId} cambió a: ${propertyValue}`
      );
      // Aquí puedes actualizar tu sistema cuando cambian propiedades
      break;

    case "deal.creation":
      console.log("✅ Nuevo deal creado en HubSpot:", objectId);
      break;

    case "deal.propertyChange":
      console.log(
        `📝 Propiedad ${propertyName} del deal ${objectId} cambió a: ${propertyValue}`
      );
      if (propertyName === "dealstage" && propertyValue === "closedwon") {
        console.log("🎉 Deal ganado:", objectId);
      }
      break;

    default:
      console.log("ℹ️ Evento no procesado:", subscriptionType);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-hubspot-signature-v3");

    // Verificación de firma (seguridad obligatoria en producción)
    if (ENABLE_WEBHOOK_VERIFICATION) {
      if (!HUBSPOT_CLIENT_SECRET) {
        console.error(
          "❌ HUBSPOT_CLIENT_SECRET no configurado pero verificación está habilitada"
        );
        return NextResponse.json(
          {
            error: "Webhook verification not configured",
            message:
              "HUBSPOT_CLIENT_SECRET must be set when webhook verification is enabled",
          },
          { status: 500 }
        );
      }

      if (!signature) {
        console.error("❌ Webhook recibido sin firma");
        return NextResponse.json(
          {
            error: "Missing signature",
            message: "x-hubspot-signature-v3 header is required",
          },
          { status: 401 }
        );
      }

      const isValid = verifyWebhookSignature(body, signature, HUBSPOT_CLIENT_SECRET);

      if (!isValid) {
        console.error("❌ Firma de webhook inválida - webhook rechazado");
        return NextResponse.json(
          {
            error: "Invalid signature",
            message: "Webhook signature verification failed",
          },
          { status: 401 }
        );
      }

      console.log("✅ Firma de webhook verificada correctamente");
    } else {
      console.warn(
        "⚠️ Verificación de webhooks deshabilitada - solo para desarrollo"
      );
    }

    // Parsear y procesar eventos
    let events;
    try {
      events = JSON.parse(body);
    } catch (parseError) {
      console.error("Error parseando body del webhook:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    // Procesar cada evento
    // Usar Promise.all para procesar en paralelo si hay múltiples eventos
    const eventArray = Array.isArray(events) ? events : [events];
    await Promise.all(
      eventArray.map((event: HubSpotWebhookEvent) => processWebhookEvent(event))
    );

    return NextResponse.json({ success: true, processed: eventArray.length });
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
