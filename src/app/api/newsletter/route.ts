import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { newsletterSchema, validatePayloadSize } from "@/lib/validations/schemas";
import { createErrorResponse, formatValidationError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    // Verificar variables de entorno primero
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const notifyEmail = process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !notifyEmail) {
      console.error("[newsletter] missing environment variables:", {
        hasResendApiKey: !!resendApiKey,
        hasFromEmail: !!fromEmail,
        hasNotifyEmail: !!notifyEmail,
      });
      return NextResponse.json(
        createErrorResponse(
          null,
          500,
          "Newsletter service is unavailable. Please try again later."
        ),
        { status: 500 }
      );
    }

    // Validar tamaño del payload
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText)) {
      return NextResponse.json(
        createErrorResponse(null, 413, "Payload too large"),
        { status: 413 }
      );
    }

    // Parsear JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (error) {
      console.error("[newsletter] JSON parse error:", error);
      return NextResponse.json(
        createErrorResponse(error, 400, "Invalid JSON format"),
        { status: 400 }
      );
    }

    // Validar con Zod
    const validationResult = newsletterSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("[newsletter] validation error:", validationResult.error.issues);
      return NextResponse.json(
        createErrorResponse(
          validationResult.error,
          400,
          `Validation failed: ${formatValidationError(validationResult.error)}`
        ),
        { status: 400 }
      );
    }

    const { email } = validationResult.data;
    const resend = new Resend(resendApiKey);

    // Crear contacto en HubSpot (no bloquea si falla)
    try {
      await createOrUpdateContact({
        email,
        firstname: "",
        lastname: "",
      });
      console.log("✅ Newsletter contact creado en HubSpot:", email);
    } catch (hubspotError) {
      console.error("⚠️ Error creando contacto en HubSpot:", hubspotError);
      // No fallar el newsletter si HubSpot falla
    }

    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to Integrity Clean Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2 style="margin-bottom: 12px;">Thanks for subscribing! 🎉</h2>
          <p style="margin: 0 0 16px;">You’ll now receive cleaning tips, seasonal offers, and important updates from Integrity Clean Solutions.</p>
          <p style="margin: 0 0 16px;">We’re excited to help you keep your spaces spotless.</p>
          <p style="margin: 0;">— The Integrity Clean Solutions Team</p>
        </div>
      `,
    });

    await resend.emails.send({
      from: fromEmail,
      to: notifyEmail,
      subject: "New newsletter subscriber",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <p style="margin: 0 0 12px;">A new visitor just subscribed to the newsletter.</p>
          <p style="margin: 0 0 4px;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0;">Add them to your marketing list in your CRM.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter] subscription error:", error);
    return NextResponse.json(
      createErrorResponse(
        error,
        500,
        "Unable to process subscription right now. Please try again later."
      ),
      { status: 500 }
    );
  }
}
