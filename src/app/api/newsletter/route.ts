import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";

type Payload = {
  email?: string;
};

export async function POST(request: NextRequest) {
  // Rate limiting: 3 requests per hour per IP (prevent spam)
  const rateLimit = rateLimitMiddleware(request, 3, 60 * 60 * 1000);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many subscription attempts. Please try again later." },
      { 
        status: 429,
        headers: rateLimit.headers,
      },
    );
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const notifyEmail = process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !notifyEmail) {
      console.error("[newsletter] missing environment variables");
      return NextResponse.json(
        { error: "Newsletter service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

    const body = (await request.json()) as Payload;
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

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

    return NextResponse.json(
      { success: true },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("[newsletter] subscription error", error);
    return NextResponse.json(
      { error: "Unable to process subscription right now." },
      { 
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }
}
