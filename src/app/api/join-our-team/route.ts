import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { parseName } from "@/lib/hubspot/utils";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createDeal } from "@/lib/hubspot/deals";
import { normalizePhone } from "@/lib/validation/phone";
import { createIntegrationEvent, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import {
  createLeadSubmission,
  makeLeadIdempotencyKey,
  updateLeadSubmissionStatus,
} from "@/lib/leads/lead-submissions";

type JoinPayload = {
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  role?: string;
  availability?: string;
  startDate?: string;
  experienceYears?: string;
  workAuthorization?: string;
  transportation?: string;
  references?: string;
  summary?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const rateLimit = rateLimitMiddleware(request, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  let leadSubmissionId: string | null = null;

  try {
    const body = (await request.json()) as JoinPayload;
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const city = body.city?.trim();
    const role = body.role?.trim();
    const availability = body.availability?.trim();
    const startDate = body.startDate?.trim();
    const experienceYears = body.experienceYears?.trim();
    const workAuthorization = body.workAuthorization?.trim();
    const transportation = body.transportation?.trim();
    const references = body.references?.trim();
    const summary = body.summary?.trim();

    if (!name || !email || !phone || !city || !role || !availability || !workAuthorization || !transportation || !summary) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const phoneResult = normalizePhone(phone, { required: true });
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { error: phoneResult.error || "Please provide a valid phone number." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const normalizedPhone = phoneResult.e164 || phone;

    leadSubmissionId = await createLeadSubmission({
      name,
      email,
      phone: normalizedPhone,
      service: role,
      propertyType: city,
      preferredDate: startDate,
      message: summary,
      source: "join_our_team",
      pagePath: request.nextUrl.pathname,
      idempotencyKey: makeLeadIdempotencyKey("join_our_team", [email, normalizedPhone, role]),
      rawPayload: {
        name,
        email,
        phone: normalizedPhone,
        city,
        role,
        availability,
        startDate,
        experienceYears,
        workAuthorization,
        transportation,
        references,
        summary,
        source: "join_our_team",
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const toEmail = process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !toEmail) {
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        errorLog: {
          provider: "resend",
          message: "Join our team email environment is not configured.",
        },
      });

      logEvent({
        level: "error",
        event: "join_missing_email_env",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        provider: "resend",
        operation: "job_application_email_send",
      });

      return NextResponse.json(
        { error: "Application service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const hubspotEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "job_application_sync",
      status: "processing",
      idempotencyKey: `hubspot:join_our_team:${leadSubmissionId}`,
      metadata: { source: "join_our_team" },
    });

    let hubspotStatus = "hubspot_synced";
    let hubspotContactId: string | null = null;
    let hubspotDealId: string | null = null;
    try {
      const { firstname, lastname } = parseName(name);

      const contact = await createOrUpdateContact({
        email,
        firstname,
        lastname,
        phone: normalizedPhone,
        address: city,
      });
      hubspotContactId = contact.id;

      const dealName = `Job Application - ${name}`;
      const dealDescription = `Role: ${role}\nAvailability: ${availability}\nCity/ZIP: ${city}\nStart date: ${startDate || "N/A"}\nExperience: ${experienceYears || "N/A"}\nWork authorization: ${workAuthorization}\nTransportation: ${transportation}\nReferences: ${references || "N/A"}\n\nSummary:\n${summary}`;

      const deal = await createDeal(
        {
          dealname: dealName,
          amount: "0",
          dealstage: "appointmentscheduled",
          description: dealDescription,
        },
        email,
      );
      hubspotDealId = deal.id;

      await updateIntegrationEvent(hubspotEventId, {
        status: "succeeded",
        providerObjectId: deal.id,
        metadata: {
          contactId: contact.id,
          dealId: deal.id,
        },
      });
    } catch (hubspotError) {
      hubspotStatus = "hubspot_failed";
      await updateIntegrationEvent(hubspotEventId, {
        status: "failed",
        lastError: getErrorMessage(hubspotError),
      });
      logEvent({
        level: "error",
        event: "join_hubspot_sync_failed",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        integrationEventId: hubspotEventId,
        provider: "hubspot",
        operation: "job_application_sync",
        error: hubspotError,
      });
    }

    const resend = new Resend(resendApiKey);
    const teamEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "job_application_team_notification",
      status: "processing",
      idempotencyKey: `resend:join_our_team:team:${leadSubmissionId}`,
      metadata: { source: "join_our_team" },
    });

    const teamEmail = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `New Job Application from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin-bottom: 16px; color: #059669;">New Join Our Team Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${normalizedPhone}</p>
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

    if (teamEmail.error) {
      await updateIntegrationEvent(teamEmailEventId, {
        status: "failed",
        lastError: getErrorMessage(teamEmail.error),
      });
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        hubspotStatus,
        hubspotContactId,
        hubspotDealId,
        errorLog: {
          provider: "resend",
          message: getErrorMessage(teamEmail.error),
        },
      });

      return NextResponse.json(
        { error: "Unable to process your application right now. Please try again later." },
        { status: 502, headers: rateLimit.headers },
      );
    }

    await updateIntegrationEvent(teamEmailEventId, {
      status: "succeeded",
      providerObjectId: teamEmail.data?.id,
    });

    const applicantEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "job_application_confirmation",
      status: "processing",
      idempotencyKey: `resend:join_our_team:applicant:${leadSubmissionId}`,
      metadata: { source: "join_our_team" },
    });

    const applicantEmail = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: "We received your application - Integrity Clean Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
          <h2 style="margin-bottom: 12px;">Thanks for applying, ${name}!</h2>
          <p style="margin: 0 0 16px;">We received your application and our team will review it shortly.</p>
          <p style="margin: 0 0 16px;">If your experience matches what we need, we will contact you at ${normalizedPhone}.</p>
          <p style="margin: 0;">Integrity Clean Solutions</p>
        </div>
      `,
    });

    if (applicantEmail.error) {
      await updateIntegrationEvent(applicantEmailEventId, {
        status: "failed",
        lastError: getErrorMessage(applicantEmail.error),
      });
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        resendEmailId: teamEmail.data?.id,
        hubspotStatus,
        hubspotContactId,
        hubspotDealId,
        errorLog: {
          provider: "resend",
          message: getErrorMessage(applicantEmail.error),
        },
      });

      return NextResponse.json(
        { error: "Unable to process your application right now. Please try again later." },
        { status: 502, headers: rateLimit.headers },
      );
    }

    await updateIntegrationEvent(applicantEmailEventId, {
      status: "succeeded",
      providerObjectId: applicantEmail.data?.id,
    });

    await updateLeadSubmissionStatus(leadSubmissionId, {
      status: hubspotStatus === "hubspot_synced" ? "completed" : "partial_failure",
      resendStatus: "email_sent",
      resendEmailId: teamEmail.data?.id,
      resendConfirmationEmailId: applicantEmail.data?.id,
      hubspotStatus,
      hubspotContactId,
      hubspotDealId,
    });

    return NextResponse.json(
      { success: true, leadSubmissionId },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "join_submission_error",
      requestId,
      route: request.nextUrl.pathname,
      leadSubmissionId,
      error,
    });
    return NextResponse.json(
      { error: "Unable to process your application right now. Please try again later." },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
