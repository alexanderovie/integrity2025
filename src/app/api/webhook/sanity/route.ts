import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { parseBody } from "next-sanity/webhook";

/**
 * Webhook endpoint para revalidación automática desde Sanity
 * 
 * Configuración en Sanity Dashboard:
 * URL: https://integritycleansolutions.com/api/webhook/sanity
 * Method: POST
 * Trigger: Create, Update, Delete
 * Filter: _type == "post"
 * Secret: SANITY_WEBHOOK_SECRET (mismo valor que REVALIDATE_SECRET)
 * 
 * Documentación:
 * https://www.sanity.io/docs/webhooks
 */

type WebhookPayload = {
  _type: string;
  _id?: string;
  slug?: { current?: string };
};

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.SANITY_WEBHOOK_SECRET || process.env.REVALIDATE_SECRET;
    
    if (!secret) {
      console.error("Missing SANITY_WEBHOOK_SECRET or REVALIDATE_SECRET");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Parsear y validar el webhook de Sanity
    // `true` espera 3s por consistencia eventual del Content Lake
    const { isValidSignature, body } = await parseBody<WebhookPayload>(
      request,
      secret,
      true 
    );

    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    if (!body?._type) {
      return NextResponse.json(
        { error: "Bad Request - Missing _type" },
        { status: 400 }
      );
    }

    // Revalidar por tipo de documento
    // Esto invalida TODAS las queries con {next: {tags: ['post']}}
    revalidateTag(body._type, 'page');
    
    console.log(`✅ Revalidated tag: ${body._type}`, {
      documentId: body._id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      revalidated: true,
      tag: body._type,
      documentId: body._id,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET para verificación
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Sanity webhook endpoint is active",
    documentation: "https://www.sanity.io/docs/webhooks",
    configureAt: "https://www.sanity.io/manage",
  });
}
