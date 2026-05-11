import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createDeal } from "@/lib/hubspot/deals";
import { parseName } from "@/lib/hubspot/utils";
import { normalizePhone } from "@/lib/validation/phone";
import {
  containsHeaderInjection,
  containsSQLInjection,
  isValidEmail,
  sanitizeInput,
} from "@/lib/security";
import { createIntegrationEvent, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import {
  createLeadSubmission,
  makeLeadIdempotencyKey,
  updateLeadSubmissionStatus,
  type LeadSubmissionStatusUpdate,
} from "@/lib/leads/lead-submissions";
import {
  getEmailFooterAddress,
  renderHelpConfirmationEmail,
  renderHelpTeamNotificationEmail,
} from "@/lib/email";

async function safeUpdateLeadSubmissionStatus(
  leadSubmissionId: string,
  update: LeadSubmissionStatusUpdate,
): Promise<void> {
  try {
    await updateLeadSubmissionStatus(leadSubmissionId, update);
  } catch (error) {
    console.error("[help] lead status update failed", error);
  }
}

function getPayloadString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

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
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const payload = body as Record<string, unknown>;
    let name = getPayloadString(payload, "name").trim();
    const email = getPayloadString(payload, "email").trim().toLowerCase();
    const phone = getPayloadString(payload, "phone").trim();
    let notes = (getPayloadString(payload, "notes") || getPayloadString(payload, "issue")).trim();

    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (
      containsSQLInjection(name) ||
      containsSQLInjection(email) ||
      containsSQLInjection(notes) ||
      containsHeaderInjection(name) ||
      containsHeaderInjection(email)
    ) {
      return NextResponse.json(
        { error: "Invalid input detected." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    name = sanitizeInput(name);
    notes = sanitizeInput(notes);

    if (!isValidEmail(email)) {
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

    try {
      leadSubmissionId = await createLeadSubmission({
        name,
        email,
        phone: normalizedPhone,
        message: notes,
        source: "help",
        pagePath: request.nextUrl.pathname,
        idempotencyKey: makeLeadIdempotencyKey("help", [name, email, normalizedPhone, notes]),
        rawPayload: {
          name,
          email,
          phone: normalizedPhone,
          notes,
          source: "help",
        },
      });
    } catch (error) {
      console.error("[help] lead persistence failed", error);
      return NextResponse.json(
        { error: "Help service is unavailable. Please try again later." },
        { status: 503, headers: rateLimit.headers },
      );
    }

    const hubspotContactEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "help_contact_sync",
      status: "processing",
      idempotencyKey: `hubspot:help:contact:${leadSubmissionId}`,
      metadata: { source: "help" },
    });

    let hubspotContactId: string | null = null;
    let hubspotContactStatus = "hubspot_failed";
    let hubspotContactError: string | null = null;

    if (process.env.HUBSPOT_ACCESS_TOKEN) {
      try {
        const { firstname, lastname } = parseName(name);
        const contact = await createOrUpdateContact({
          email,
          firstname,
          lastname,
          phone: normalizedPhone,
        });
        hubspotContactId = contact.id;
        hubspotContactStatus = "hubspot_synced";
        await updateIntegrationEvent(hubspotContactEventId, {
          status: "succeeded",
          providerObjectId: contact.id,
        });
      } catch (error) {
        hubspotContactError = getErrorMessage(error);
        await updateIntegrationEvent(hubspotContactEventId, {
          status: "failed",
          lastError: hubspotContactError,
        });
        logEvent({
          level: "error",
          event: "help_hubspot_contact_sync_failed",
          requestId,
          route: request.nextUrl.pathname,
          leadSubmissionId,
          integrationEventId: hubspotContactEventId,
          provider: "hubspot",
          operation: "help_contact_sync",
          error,
        });
      }
    } else {
      hubspotContactError = "HUBSPOT_ACCESS_TOKEN is not configured.";
      await updateIntegrationEvent(hubspotContactEventId, {
        status: "failed",
        lastError: hubspotContactError,
      });
    }

    const hubspotDealEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "help_deal_sync",
      status: "processing",
      idempotencyKey: `hubspot:help:deal:${leadSubmissionId}`,
      metadata: { source: "help" },
    });

    let hubspotDealId: string | null = null;
    let hubspotDealStatus = "hubspot_failed";
    let hubspotDealError: string | null = null;

    if (process.env.HUBSPOT_ACCESS_TOKEN) {
      try {
        const dealName = `Help Request - ${name}`;
        const dealDescription = `Email: ${email}\nPhone: ${normalizedPhone}\nNotes: ${notes || "N/A"}`;
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
        hubspotDealStatus = "hubspot_synced";
        await updateIntegrationEvent(hubspotDealEventId, {
          status: "succeeded",
          providerObjectId: deal.id,
        });
      } catch (error) {
        hubspotDealError = getErrorMessage(error);
        await updateIntegrationEvent(hubspotDealEventId, {
          status: "failed",
          lastError: hubspotDealError,
        });
        logEvent({
          level: "error",
          event: "help_hubspot_deal_sync_failed",
          requestId,
          route: request.nextUrl.pathname,
          leadSubmissionId,
          integrationEventId: hubspotDealEventId,
          provider: "hubspot",
          operation: "help_deal_sync",
          error,
        });
      }
    } else {
      hubspotDealError = "HUBSPOT_ACCESS_TOKEN is not configured.";
      await updateIntegrationEvent(hubspotDealEventId, {
        status: "failed",
        lastError: hubspotDealError,
      });
    }

    const teamEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "help_team_notification",
      status: "processing",
      idempotencyKey: `resend:help:team:${leadSubmissionId}`,
      metadata: { source: "help" },
    });

    const confirmationEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "help_customer_confirmation",
      status: "processing",
      idempotencyKey: `resend:help:customer:${leadSubmissionId}`,
      metadata: { source: "help" },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const helpEmail = process.env.HELP_EMAIL || process.env.TO_EMAIL;
    let teamEmailId: string | null = null;
    let confirmationEmailId: string | null = null;
    const emailErrors: Array<{ operation: string; message: string }> = [];

    if (!resendApiKey || !fromEmail || !helpEmail) {
      const message = "Help email environment is not configured.";
      await updateIntegrationEvent(teamEmailEventId, {
        status: "failed",
        lastError: message,
      });
      await updateIntegrationEvent(confirmationEmailEventId, {
        status: "failed",
        lastError: message,
      });
      emailErrors.push(
        { operation: "help_team_notification", message },
        { operation: "help_customer_confirmation", message },
      );
      logEvent({
        level: "error",
        event: "help_missing_email_env",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        provider: "resend",
        operation: "help_email_send",
      });
    } else {
      const resend = new Resend(resendApiKey);

      try {
        const renderedEmail = await renderHelpTeamNotificationEmail({
          name,
          email,
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
          throw new Error(emailResult.error.message || "Resend failed to send help team email.");
        }

        teamEmailId = emailResult.data?.id || null;
        await updateIntegrationEvent(teamEmailEventId, {
          status: "succeeded",
          providerObjectId: teamEmailId,
          metadata: {
            source: "help",
            templateName: renderedEmail.templateName,
            templateVersion: renderedEmail.templateVersion,
          },
        });
      } catch (error) {
        const message = getErrorMessage(error);
        await updateIntegrationEvent(teamEmailEventId, {
          status: "failed",
          lastError: message,
        });
        emailErrors.push({ operation: "help_team_notification", message });
      }

      try {
        const renderedEmail = await renderHelpConfirmationEmail({
          name,
          phone: normalizedPhone,
          notes,
          footerAddress: getEmailFooterAddress(),
        });
        const emailResult = await resend.emails.send(
          {
            from: fromEmail,
            to: email,
            replyTo: helpEmail,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          },
          { idempotencyKey: `resend:help:customer:${leadSubmissionId}` },
        );

        if (emailResult.error) {
          throw new Error(emailResult.error.message || "Resend failed to send help confirmation email.");
        }

        confirmationEmailId = emailResult.data?.id || null;
        await updateIntegrationEvent(confirmationEmailEventId, {
          status: "succeeded",
          providerObjectId: confirmationEmailId,
          metadata: {
            source: "help",
            templateName: renderedEmail.templateName,
            templateVersion: renderedEmail.templateVersion,
          },
        });
      } catch (error) {
        const message = getErrorMessage(error);
        await updateIntegrationEvent(confirmationEmailEventId, {
          status: "failed",
          lastError: message,
        });
        emailErrors.push({ operation: "help_customer_confirmation", message });
      }
    }

    const hasHubSpotFailure = hubspotContactStatus !== "hubspot_synced" || hubspotDealStatus !== "hubspot_synced";
    const hasEmailFailure = emailErrors.length > 0;
    const hubspotStatus = hasHubSpotFailure ? "hubspot_failed" : "hubspot_synced";

    await safeUpdateLeadSubmissionStatus(leadSubmissionId, {
      status: hasHubSpotFailure || hasEmailFailure ? "partial_failure" : "completed",
      resendStatus: hasEmailFailure ? "email_failed" : "email_sent",
      resendEmailId: teamEmailId,
      resendConfirmationEmailId: confirmationEmailId,
      hubspotStatus,
      hubspotContactId,
      hubspotDealId,
      errorLog: hasHubSpotFailure || hasEmailFailure
        ? {
            hubspot: {
              contact: hubspotContactError,
              deal: hubspotDealError,
            },
            resend: emailErrors,
          }
        : null,
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
