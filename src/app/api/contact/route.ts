import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { sendContactToHubSpot, parseName } from "@/lib/hubspot/utils";
import { normalizePhone } from "@/lib/validation/phone";
import { sanitizeInput, isValidEmail, containsSQLInjection, containsHeaderInjection } from "@/lib/security";

/**
 * POST /api/contact
 * Enterprise-ready contact form endpoint with security hardening
 * Replaces hardcoded FormSubmit.co calls
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const contactEmail = process.env.CONTACT_EMAIL || process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !contactEmail) {
      console.error("[contact] missing environment variables");
      return NextResponse.json(
        { error: "Contact service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    // Validar tamaño del payload
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 },
      );
    }

    const body = await request.json();
    let { name, email, phone, message } = body;

    // Security: Validar y sanitizar inputs
    if (containsSQLInjection(name) || containsSQLInjection(email) || containsSQLInjection(message)) {
      console.warn("[SECURITY] SQL injection attempt detected in contact form");
      return NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400 },
      );
    }

    if (containsHeaderInjection(email) || containsHeaderInjection(name)) {
      console.warn("[SECURITY] Header injection attempt detected");
      return NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400 },
      );
    }

    // Sanitizar inputs
    name = sanitizeInput(name);
    email = email.trim();
    message = sanitizeInput(message);

    // Validación estricta de email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 },
      );
    }

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const phoneResult = normalizePhone(phone, { required: true });
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { error: phoneResult.error || "Please provide a valid phone number." },
        { status: 400 },
      );
    }

    const normalizedPhone = phoneResult.e164 || phone;

    const resend = new Resend(resendApiKey);

    // Send to HubSpot (non-blocking)
    if (email) {
      const { firstname, lastname } = parseName(name);
      sendContactToHubSpot({
        email,
        firstname,
        lastname,
        phone: normalizedPhone,
      }).catch((error) => {
        console.error("⚠️ Error enviando a HubSpot:", error);
      });
    }

    // Send notification email to team
    await resend.emails.send({
      from: fromEmail,
      to: contactEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin-bottom: 16px; color: #059669;">New Contact Form Submission</h2>
          <p style="margin: 0 0 12px;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 12px;"><strong>Email:</strong> ${email}</p>
        ${normalizedPhone ? `<p style="margin: 0 0 12px;"><strong>Phone:</strong> ${normalizedPhone}</p>` : ""}
          <p style="margin: 0 0 12px;"><strong>Message:</strong></p>
          <p style="margin: 0; padding: 12px; background-color: #f3f4f6; border-radius: 6px; white-space: pre-wrap;">${message}</p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            This message was submitted through the Integrity Clean Solutions contact form.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true }
    );
  } catch (error) {
    console.error("[contact] submission error", error);
    return NextResponse.json(
      { error: "Unable to process your message right now. Please try again later." },
      { status: 500 }
    );
  }
}
