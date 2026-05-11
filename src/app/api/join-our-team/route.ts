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
  renderJobApplicationConfirmationEmail,
  renderJobApplicationTeamNotificationEmail,
} from "@/lib/email";

const SOURCE = "join_our_team";

async function safeUpdateLeadSubmissionStatus(
  leadSubmissionId: string,
  update: LeadSubmissionStatusUpdate,
): Promise<void> {
  try {
    await updateLeadSubmissionStatus(leadSubmissionId, update);
  } catch (error) {
    console.error("[join-our-team] lead status update failed", error);
  }
}

function getPayloadString(payload: Record<string, unknown>, key: string): string {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

function hasUnsafeInput(values: string[]): boolean {
  return values.some((value) => containsHeaderInjection(value) || containsSQLInjection(value));
}

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
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload too large." },
        { status: 413, headers: rateLimit.headers },
      );
    }

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
    let city = getPayloadString(payload, "city").trim();
    let role = getPayloadString(payload, "role").trim();
    let availability = getPayloadString(payload, "availability").trim();
    const startDate = getPayloadString(payload, "startDate").trim();
    const experienceYears = getPayloadString(payload, "experienceYears").trim();
    let workAuthorization = getPayloadString(payload, "workAuthorization").trim();
    let transportation = getPayloadString(payload, "transportation").trim();
    let references = getPayloadString(payload, "references").trim();
    let summary = getPayloadString(payload, "summary").trim();

    if (!name || !email || !phone || !city || !role || !availability || !workAuthorization || !transportation || !summary) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (
      hasUnsafeInput([
        name,
        email,
        city,
        role,
        availability,
        workAuthorization,
        transportation,
        references,
        summary,
      ])
    ) {
      return NextResponse.json(
        { error: "Invalid input detected." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    name = sanitizeInput(name);
    city = sanitizeInput(city);
    role = sanitizeInput(role);
    availability = sanitizeInput(availability);
    workAuthorization = sanitizeInput(workAuthorization);
    transportation = sanitizeInput(transportation);
    references = sanitizeInput(references);
    summary = sanitizeInput(summary);

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
        service: role,
        propertyType: city,
        preferredDate: startDate,
        message: summary,
        source: SOURCE,
        pagePath: request.nextUrl.pathname,
        idempotencyKey: makeLeadIdempotencyKey(SOURCE, [email, normalizedPhone, role]),
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
          source: SOURCE,
        },
      });
    } catch (error) {
      console.error("[join-our-team] lead persistence failed", error);
      return NextResponse.json(
        { error: "Application service is unavailable. Please try again later." },
        { status: 503, headers: rateLimit.headers },
      );
    }

    const hubspotContactEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "job_application_contact_sync",
      status: "processing",
      idempotencyKey: `hubspot:join_our_team:contact:${leadSubmissionId}`,
      metadata: { source: SOURCE },
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
          address: city,
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
          event: "join_hubspot_contact_sync_failed",
          requestId,
          route: request.nextUrl.pathname,
          leadSubmissionId,
          integrationEventId: hubspotContactEventId,
          provider: "hubspot",
          operation: "job_application_contact_sync",
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
      operation: "job_application_deal_sync",
      status: "processing",
      idempotencyKey: `hubspot:join_our_team:deal:${leadSubmissionId}`,
      metadata: { source: SOURCE },
    });

    let hubspotDealId: string | null = null;
    let hubspotDealStatus = "hubspot_failed";
    let hubspotDealError: string | null = null;

    if (process.env.HUBSPOT_ACCESS_TOKEN) {
      try {
        const dealName = `Job Application - ${name}`;
        const dealDescription = [
          `Email: ${email}`,
          `Phone: ${normalizedPhone}`,
          `Role: ${role}`,
          `Availability: ${availability}`,
          `City/ZIP: ${city}`,
          `Start date: ${startDate || "N/A"}`,
          `Experience: ${experienceYears || "N/A"}`,
          `Work authorization: ${workAuthorization}`,
          `Transportation: ${transportation}`,
          `References: ${references || "N/A"}`,
          "",
          "Summary:",
          summary,
        ].join("\n");

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
          event: "join_hubspot_deal_sync_failed",
          requestId,
          route: request.nextUrl.pathname,
          leadSubmissionId,
          integrationEventId: hubspotDealEventId,
          provider: "hubspot",
          operation: "job_application_deal_sync",
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
      operation: "job_application_team_notification",
      status: "processing",
      idempotencyKey: `resend:join_our_team:team:${leadSubmissionId}`,
      metadata: { source: SOURCE },
    });

    const applicantEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "job_application_confirmation",
      status: "processing",
      idempotencyKey: `resend:join_our_team:applicant:${leadSubmissionId}`,
      metadata: { source: SOURCE },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const toEmail = process.env.TO_EMAIL;
    let teamEmailId: string | null = null;
    let applicantEmailId: string | null = null;
    const emailErrors: Array<{ operation: string; message: string }> = [];

    if (!resendApiKey || !fromEmail || !toEmail) {
      const message = "Join our team email environment is not configured.";
      await updateIntegrationEvent(teamEmailEventId, {
        status: "failed",
        lastError: message,
      });
      await updateIntegrationEvent(applicantEmailEventId, {
        status: "failed",
        lastError: message,
      });
      emailErrors.push(
        { operation: "job_application_team_notification", message },
        { operation: "job_application_confirmation", message },
      );
      logEvent({
        level: "error",
        event: "join_missing_email_env",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        provider: "resend",
        operation: "job_application_email_send",
      });
    } else {
      const resend = new Resend(resendApiKey);

      try {
        const renderedEmail = await renderJobApplicationTeamNotificationEmail({
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
          footerAddress: getEmailFooterAddress(),
        });
        const emailResult = await resend.emails.send(
          {
            from: fromEmail,
            to: [toEmail],
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          },
          { idempotencyKey: `resend:join_our_team:team:${leadSubmissionId}` },
        );

        if (emailResult.error) {
          throw new Error(emailResult.error.message || "Resend failed to send job application team email.");
        }

        teamEmailId = emailResult.data?.id || null;
        await updateIntegrationEvent(teamEmailEventId, {
          status: "succeeded",
          providerObjectId: teamEmailId,
          metadata: {
            source: SOURCE,
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
        emailErrors.push({ operation: "job_application_team_notification", message });
      }

      try {
        const renderedEmail = await renderJobApplicationConfirmationEmail({
          name,
          email,
          phone: normalizedPhone,
          footerAddress: getEmailFooterAddress(),
        });
        const emailResult = await resend.emails.send(
          {
            from: fromEmail,
            to: [email],
            replyTo: toEmail,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          },
          { idempotencyKey: `resend:join_our_team:applicant:${leadSubmissionId}` },
        );

        if (emailResult.error) {
          throw new Error(emailResult.error.message || "Resend failed to send job application confirmation email.");
        }

        applicantEmailId = emailResult.data?.id || null;
        await updateIntegrationEvent(applicantEmailEventId, {
          status: "succeeded",
          providerObjectId: applicantEmailId,
          metadata: {
            source: SOURCE,
            templateName: renderedEmail.templateName,
            templateVersion: renderedEmail.templateVersion,
          },
        });
      } catch (error) {
        const message = getErrorMessage(error);
        await updateIntegrationEvent(applicantEmailEventId, {
          status: "failed",
          lastError: message,
        });
        emailErrors.push({ operation: "job_application_confirmation", message });
      }
    }

    const hasHubSpotFailure = hubspotContactStatus !== "hubspot_synced" || hubspotDealStatus !== "hubspot_synced";
    const hasEmailFailure = emailErrors.length > 0;
    const hubspotStatus = hasHubSpotFailure ? "hubspot_failed" : "hubspot_synced";

    await safeUpdateLeadSubmissionStatus(leadSubmissionId, {
      status: hasHubSpotFailure || hasEmailFailure ? "partial_failure" : "completed",
      resendStatus: hasEmailFailure ? "email_failed" : "email_sent",
      resendEmailId: teamEmailId,
      resendConfirmationEmailId: applicantEmailId,
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
      { success: true },
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
