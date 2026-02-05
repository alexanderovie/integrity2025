import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { parseName } from "@/lib/hubspot/utils";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createDeal } from "@/lib/hubspot/deals";
import { DEAL_STAGES } from "@/lib/hubspot/pipeline";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = rateLimitMiddleware(request, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const toEmail = process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !toEmail) {
      console.error("[join-our-team] missing environment variables");
      return NextResponse.json(
        { error: "Application service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      city,
      role,
      availability,
      startDate,
      experienceYears,
      workAuthorization,
      transportation,
      references,
      summary,
    } = body;

    if (!name || !email || !phone || !city || !role || !availability || !workAuthorization || !transportation || !summary) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const resend = new Resend(resendApiKey);

    // HubSpot sync (non-blocking)
    try {
      const { firstname, lastname } = parseName(name);

      await createOrUpdateContact({
        email,
        firstname,
        lastname,
        phone,
        address: city,
      });

      const dealName = `Job Application - ${name}`;
      const dealDescription = `Role: ${role}\nAvailability: ${availability}\nCity/ZIP: ${city}\nStart date: ${startDate || "N/A"}\nExperience: ${experienceYears || "N/A"}\nWork authorization: ${workAuthorization}\nTransportation: ${transportation}\nReferences: ${references || "N/A"}\n\nSummary:\n${summary}`;

      await createDeal(
        {
          dealname: dealName,
          amount: "0",
          dealstage: DEAL_STAGES.LEAD_CAPTURED,
          description: dealDescription,
        },
        email,
      );
    } catch (hubspotError) {
      console.error("⚠️ Error sincronizando aplicación con HubSpot:", hubspotError);
    }

    await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `New Job Application from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin-bottom: 16px; color: #059669;">New Join Our Team Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>City/ZIP:</strong> ${city}</p>
          <p><strong>Role:</strong> ${role}</p>
          <p><strong>Availability:</strong> ${availability}</p>
          ${startDate ? `<p><strong>Start date:</strong> ${startDate}</p>` : ""}
          ${experienceYears ? `<p><strong>Experience:</strong> ${experienceYears} years</p>` : ""}
          <p><strong>Work authorization:</strong> ${workAuthorization}</p>
          <p><strong>Transportation:</strong> ${transportation}</p>
          ${references ? `<p><strong>References:</strong><br/>${references}</p>` : ""}
          <p><strong>Summary:</strong></p>
          <p style="margin: 0; padding: 12px; background-color: #f3f4f6; border-radius: 6px; white-space: pre-wrap;">${summary}</p>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            This message was submitted through the Join Our Team form.
          </p>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("[join-our-team] submission error", error);
    return NextResponse.json(
      { error: "Unable to process your application right now. Please try again later." },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
