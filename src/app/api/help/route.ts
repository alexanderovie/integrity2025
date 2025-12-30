import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";

/**
 * POST /api/help
 * Enterprise-ready help request endpoint
 * Replaces console.info() mock
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting: 3 requests per 15 minutes per IP (more restrictive for help)
  const rateLimit = rateLimitMiddleware(request, 3, 15 * 60 * 1000);
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { 
        status: 429,
        headers: rateLimit.headers,
      },
    );
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const helpEmail = process.env.HELP_EMAIL || process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !helpEmail) {
      console.error("[help] missing environment variables");
      return NextResponse.json(
        { error: "Help service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { name, phone, notes } = body;

    // Basic validation
    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
        { status: 400 },
      );
    }

    // Validate phone has at least 7 digits
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 7) {
      return NextResponse.json(
        { error: "Please provide a valid phone number." },
        { status: 400 },
      );
    }

    const resend = new Resend(resendApiKey);

    // Send notification email to team
    await resend.emails.send({
      from: fromEmail,
      to: helpEmail,
      subject: `Help Request from ${name} - Integrity Clean Solutions`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin-bottom: 16px; color: #059669;">New Help Request</h2>
          <p style="margin: 0 0 12px;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 12px;"><strong>Phone:</strong> ${phone}</p>
          ${notes ? `
            <p style="margin: 0 0 12px;"><strong>Additional Details:</strong></p>
            <p style="margin: 0; padding: 12px; background-color: #f3f4f6; border-radius: 6px; white-space: pre-wrap;">${notes}</p>
          ` : ""}
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            This help request was submitted through the Integrity Clean Solutions website.
            Please contact the customer at the provided phone number.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("[help] submission error", error);
    return NextResponse.json(
      { error: "Unable to process your request right now. Please try again later." },
      { 
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }
}

