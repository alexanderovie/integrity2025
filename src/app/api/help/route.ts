import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { createDeal } from "@/lib/hubspot/deals";
import { normalizePhone } from "@/lib/validation/phone";
import { createIntegrationEvent, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import {
  createLeadSubmission,
  makeLeadIdempotencyKey,
  updateLeadSubmissionStatus,
} from "@/lib/leads/lead-submissions";
import {
  getEmailFooterAddress,
  renderHelpTeamNotificationEmail,
} from "@/lib/email";

type HelpPayload = {
  name?: string;
  phone?: string;
  notes?: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
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

  let leadSubmissionId: string | null = null;

  try {
    const body = (await request.json()) as HelpPayload;
    const name = body.name?.trim();
    const phone = body.phone?.trim();
    const notes = body.notes?.trim();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required." },
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

    leadSubmissionId = await createLeadSubmission({
      name,
      phone: normalizedPhone,
      message: notes,
      source: "help",
      pagePath: request.nextUrl.pathname,
      idempotencyKey: makeLeadIdempotencyKey("help", [name, normalizedPhone, notes]),
      rawPayload: {
        name,
        phone: normalizedPhone,
        notes,
        source: "help",
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const helpEmail = process.env.HELP_EMAIL || process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !helpEmail) {
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        errorLog: {
          provider: "resend",
          message: "Help email environment is not configured.",
        },
      });

      logEvent({
        level: "error",
        event: "help_missing_email_env",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        provider: "resend",
        operation: "help_team_notification",
      });

      return NextResponse.json(
        { error: "Help service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const hubspotEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "help_deal_sync",
      status: "processing",
      idempotencyKey: `hubspot:help:${leadSubmissionId}`,
      metadata: { source: "help" },
    });

    let hubspotStatus = "hubspot_synced";
    let hubspotDealId: string | null = null;
    try {
      const dealName = `Help Request - ${name}`;
      const dealDescription = `Phone: ${normalizedPhone}\nNotes: ${notes || "N/A"}`;
      const deal = await createDeal({
        dealname: dealName,
        amount: "0",
        dealstage: "appointmentscheduled",
        description: dealDescription,
      });
      hubspotDealId = deal.id;
      await updateIntegrationEvent(hubspotEventId, {
        status: "succeeded",
        providerObjectId: deal.id,
      });
    } catch (hubspotError) {
      hubspotStatus = "hubspot_failed";
      await updateIntegrationEvent(hubspotEventId, {
        status: "failed",
        lastError: getErrorMessage(hubspotError),
      });
      logEvent({
        level: "error",
        event: "help_hubspot_sync_failed",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        integrationEventId: hubspotEventId,
        provider: "hubspot",
        operation: "help_deal_sync",
        error: hubspotError,
      });
    }

    const resend = new Resend(resendApiKey);
    const resendEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "help_team_notification",
      status: "processing",
      idempotencyKey: `resend:help:team:${leadSubmissionId}`,
      metadata: { source: "help" },
    });

    const renderedEmail = await renderHelpTeamNotificationEmail({
      name,
      phone: normalizedPhone,
      notes,
      footerAddress: getEmailFooterAddress(),
    });
    const emailResult = await resend.emails.send(
      {
        from: fromEmail,
        to: helpEmail,
        subject: renderedEmail.subject,
        html: renderedEmail.html,
        text: renderedEmail.text,
      },
      { idempotencyKey: `resend:help:team:${leadSubmissionId}` },
    );

    if (emailResult.error) {
      await updateIntegrationEvent(resendEventId, {
        status: "failed",
        lastError: getErrorMessage(emailResult.error),
      });
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        hubspotStatus,
        hubspotDealId,
        errorLog: {
          provider: "resend",
          message: getErrorMessage(emailResult.error),
        },
      });

      return NextResponse.json(
        { error: "Unable to process your request right now. Please try again later." },
        { status: 502, headers: rateLimit.headers },
      );
    }

    await updateIntegrationEvent(resendEventId, {
      status: "succeeded",
      providerObjectId: emailResult.data?.id,
      metadata: {
        source: "help",
        templateName: renderedEmail.templateName,
        templateVersion: renderedEmail.templateVersion,
      },
    });

    await updateLeadSubmissionStatus(leadSubmissionId, {
      status: hubspotStatus === "hubspot_synced" ? "completed" : "partial_failure",
      resendStatus: "email_sent",
      resendEmailId: emailResult.data?.id,
      hubspotStatus,
      hubspotDealId,
    });

    return NextResponse.json(
      { success: true, leadSubmissionId },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "help_submission_error",
      requestId,
      route: request.nextUrl.pathname,
      leadSubmissionId,
      error,
    });
    return NextResponse.json(
      { error: "Unable to process your request right now. Please try again later." },
      {
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }
}
