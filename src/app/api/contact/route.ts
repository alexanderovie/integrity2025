import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { normalizePhone } from "@/lib/validation/phone";
import { sanitizeInput, isValidEmail, containsSQLInjection, containsHeaderInjection } from "@/lib/security";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { parseName } from "@/lib/hubspot/utils";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
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
  renderContactConfirmationEmail,
  renderContactTeamNotificationEmail,
} from "@/lib/email";

export const runtime = "nodejs";

const BLOCKED_USER_AGENT_PATTERNS = [
  /curl/i,
  /python-requests/i,
  /wget/i,
];

function isBlockedAutomationUserAgent(request: NextRequest): boolean {
  const userAgent = request.headers.get("user-agent") || "";
  if (!userAgent.trim()) {
    return true;
  }

  return BLOCKED_USER_AGENT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

const getPayloadString = (payload: Record<string, unknown>, key: string): string => {
  const value = payload[key];
  return typeof value === "string" ? value : "";
};

const getBoolean = (payload: Record<string, unknown>, keys: string[]): boolean => {
  return keys.some((key) => payload[key] === true || payload[key] === "true");
};

const getReferrerAttribution = (request: NextRequest) => {
  const referrer = request.headers.get("referer") || "";

  if (!referrer) {
    return {
      pagePath: "",
      referrer,
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
    };
  }

  try {
    const url = new URL(referrer);
    return {
      pagePath: url.pathname,
      referrer,
      utmSource: url.searchParams.get("utm_source") || "",
      utmMedium: url.searchParams.get("utm_medium") || "",
      utmCampaign: url.searchParams.get("utm_campaign") || "",
      utmContent: url.searchParams.get("utm_content") || "",
      utmTerm: url.searchParams.get("utm_term") || "",
    };
  } catch {
    return {
      pagePath: "",
      referrer,
      utmSource: "",
      utmMedium: "",
      utmCampaign: "",
      utmContent: "",
      utmTerm: "",
    };
  }
};

async function safeUpdateLeadSubmissionStatus(
  leadSubmissionId: string,
  update: LeadSubmissionStatusUpdate,
): Promise<void> {
  try {
    await updateLeadSubmissionStatus(leadSubmissionId, update);
  } catch (error) {
    console.error("[contact] lead status update failed", error);
  }
}

/**
 * POST /api/contact
 * Enterprise-ready contact form endpoint with security hardening
 * Replaces hardcoded FormSubmit.co calls
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const rateLimit = rateLimitMiddleware(request, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many contact attempts. Please try again later." },
      { status: 429, headers: rateLimit.headers },
    );
  }

  if (isBlockedAutomationUserAgent(request)) {
    return NextResponse.json(
      { error: "Automated contact submissions are not accepted." },
      { status: 403, headers: rateLimit.headers },
    );
  }

  try {
    // Validar tamaño del payload
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload too large" },
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
    let name = getPayloadString(payload, "name");
    let email = getPayloadString(payload, "email");
    const phone = getPayloadString(payload, "phone");
    let message = getPayloadString(payload, "message");
    const service = getPayloadString(payload, "service");
    const source = getPayloadString(payload, "source") || "contact_form";
    const propertyType = getPayloadString(payload, "propertyType");
    const zip = getPayloadString(payload, "zip") || getPayloadString(payload, "zipCode");
    const frequency = getPayloadString(payload, "frequency");
    const preferredDate = getPayloadString(payload, "preferredDate");
    const smsConsent = getBoolean(payload, ["smsConsent", "hasSmsConsent"]);
    const smsConsentText = getPayloadString(payload, "smsConsentText");
    const smsConsentTimestamp = getPayloadString(payload, "smsConsentTimestamp");

    // Basic validation before security helpers that expect strings.
    if (!name.trim() || !email.trim() || !message.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (!phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    // Security: Validar y sanitizar inputs
    if (containsSQLInjection(name) || containsSQLInjection(email) || containsSQLInjection(message)) {
      console.warn("[SECURITY] SQL injection attempt detected in contact form");
      return NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (containsHeaderInjection(email) || containsHeaderInjection(name)) {
      console.warn("[SECURITY] Header injection attempt detected");
      return NextResponse.json(
        { error: "Invalid input detected" },
        { status: 400, headers: rateLimit.headers },
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

    const phoneResult = normalizePhone(phone, { required: true });
    if (!phoneResult.isValid) {
      return NextResponse.json(
        { error: phoneResult.error || "Please provide a valid phone number." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const normalizedPhone = phoneResult.e164 || phone;

    const attribution = getReferrerAttribution(request);
    const idempotencyKey = makeLeadIdempotencyKey("contact", [
      source,
      name,
      email,
      normalizedPhone,
      service,
      message,
    ]);

    let leadSubmissionId = "";
    try {
      leadSubmissionId = await createLeadSubmission({
        name,
        email,
        phone: normalizedPhone,
        service,
        propertyType,
        zip,
        frequency,
        preferredDate,
        message,
        source,
        pagePath: attribution.pagePath,
        referrer: attribution.referrer,
        utmSource: attribution.utmSource,
        utmMedium: attribution.utmMedium,
        utmCampaign: attribution.utmCampaign,
        utmContent: attribution.utmContent,
        utmTerm: attribution.utmTerm,
        smsConsent,
        smsConsentText,
        smsConsentTimestamp,
        idempotencyKey,
        rawPayload: payload,
      });
    } catch (error) {
      console.error("[contact] lead persistence failed", error);
      return NextResponse.json(
        { error: "Contact service is unavailable. Please try again later." },
        { status: 503, headers: rateLimit.headers },
      );
    }

    const hubspotEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "contact_form_contact_sync",
      status: "processing",
      idempotencyKey: `hubspot:contact:${leadSubmissionId}`,
      metadata: { source },
    });

    // Send to HubSpot with confirmation
    let hubspotResult: { success: boolean; status: "created" | "updated" | "failed" | "queued"; contactId?: string; error?: string } = { success: false, status: "failed", error: "Not configured" };
    
    if (email && process.env.HUBSPOT_ACCESS_TOKEN) {
      try {
        const { firstname, lastname } = parseName(name);
        const contact = await createOrUpdateContact({
          email,
          firstname,
          lastname,
          phone: normalizedPhone,
          zip,
        });
        hubspotResult = {
          success: true,
          status: "updated",
          contactId: contact.id,
        };
        await updateIntegrationEvent(hubspotEventId, {
          status: "succeeded",
          providerObjectId: contact.id,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "HubSpot sync failed.";
        console.error("⚠️ Error enviando a HubSpot:", error);
        hubspotResult = { success: false, status: "failed", error: errorMessage };
        await updateIntegrationEvent(hubspotEventId, {
          status: "failed",
          lastError: getErrorMessage(error),
        });
        logEvent({
          level: "error",
          event: "contact_hubspot_sync_failed",
          requestId,
          route: request.nextUrl.pathname,
          leadSubmissionId,
          integrationEventId: hubspotEventId,
          provider: "hubspot",
          operation: "contact_form_contact_sync",
          error,
        });
      }
    } else {
      await updateIntegrationEvent(hubspotEventId, {
        status: "failed",
        lastError: "HUBSPOT_ACCESS_TOKEN is not configured.",
      });
    }

    const teamEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "contact_form_team_notification",
      status: "processing",
      idempotencyKey: `resend:contact:team:${leadSubmissionId}`,
      metadata: { source },
    });

    const confirmationEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "contact_form_customer_confirmation",
      status: "processing",
      idempotencyKey: `resend:contact:customer:${leadSubmissionId}`,
      metadata: { source },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const contactEmail = process.env.CONTACT_EMAIL || process.env.TO_EMAIL;
    let teamEmailId: string | null = null;
    let confirmationEmailId: string | null = null;
    const emailErrors: Array<{ operation: string; message: string }> = [];

    if (!resendApiKey || !fromEmail || !contactEmail) {
      const message = "Missing contact email environment variables.";
      console.error("[contact] missing environment variables");
      await updateIntegrationEvent(teamEmailEventId, {
        status: "failed",
        lastError: message,
      });
      await updateIntegrationEvent(confirmationEmailEventId, {
        status: "failed",
        lastError: message,
      });
      emailErrors.push(
        { operation: "contact_form_team_notification", message },
        { operation: "contact_form_customer_confirmation", message },
      );
    } else {
      const resend = new Resend(resendApiKey);

      try {
        const renderedEmail = await renderContactTeamNotificationEmail({
          name,
          email,
          phone: normalizedPhone,
          service,
          message,
          footerAddress: getEmailFooterAddress(),
        });
        const emailResult = await resend.emails.send(
          {
            from: fromEmail,
            to: contactEmail,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          },
          { idempotencyKey: `resend:contact:team:${leadSubmissionId}` },
        );

        if ("error" in emailResult && emailResult.error) {
          throw new Error(emailResult.error.message || "Resend failed to send team email.");
        }

        teamEmailId = "data" in emailResult ? emailResult.data?.id || null : null;
        await updateIntegrationEvent(teamEmailEventId, {
          status: "succeeded",
          providerObjectId: teamEmailId,
          metadata: {
            source,
            templateName: renderedEmail.templateName,
            templateVersion: renderedEmail.templateVersion,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unable to send contact team email.";
        await updateIntegrationEvent(teamEmailEventId, {
          status: "failed",
          lastError: getErrorMessage(error),
        });
        emailErrors.push({
          operation: "contact_form_team_notification",
          message: errorMessage,
        });
      }

      try {
        const renderedEmail = await renderContactConfirmationEmail({
          name,
          phone: normalizedPhone,
          footerAddress: getEmailFooterAddress(),
        });
        const emailResult = await resend.emails.send(
          {
            from: fromEmail,
            to: email,
            subject: renderedEmail.subject,
            html: renderedEmail.html,
            text: renderedEmail.text,
          },
          { idempotencyKey: `resend:contact:customer:${leadSubmissionId}` },
        );

        if ("error" in emailResult && emailResult.error) {
          throw new Error(emailResult.error.message || "Resend failed to send confirmation email.");
        }

        confirmationEmailId = "data" in emailResult ? emailResult.data?.id || null : null;
        await updateIntegrationEvent(confirmationEmailEventId, {
          status: "succeeded",
          providerObjectId: confirmationEmailId,
          metadata: {
            source,
            templateName: renderedEmail.templateName,
            templateVersion: renderedEmail.templateVersion,
          },
        });
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : "Unable to send contact confirmation email.";
        await updateIntegrationEvent(confirmationEmailEventId, {
          status: "failed",
          lastError: getErrorMessage(error),
        });
        emailErrors.push({
          operation: "contact_form_customer_confirmation",
          message: errorMessage,
        });
      }
    }

    const hubspotStatus = hubspotResult.success
      ? "hubspot_synced"
      : hubspotResult.status === "queued"
        ? "hubspot_queued"
        : "hubspot_failed";
    const hasProviderFailure = !hubspotResult.success && hubspotResult.status !== "queued";
    const hasEmailFailure = emailErrors.length > 0;

    await safeUpdateLeadSubmissionStatus(leadSubmissionId, {
      status: hasProviderFailure || hasEmailFailure ? "partial_failure" : "completed",
      resendStatus: hasEmailFailure ? "email_failed" : "email_sent",
      resendEmailId: teamEmailId,
      resendConfirmationEmailId: confirmationEmailId,
      hubspotStatus,
      hubspotContactId: hubspotResult.contactId,
      errorLog: hasProviderFailure || hasEmailFailure
        ? {
            hubspot: hasProviderFailure
              ? {
                  provider: "hubspot",
                  operation: "upsert_contact",
                  message: hubspotResult.error || "HubSpot sync did not complete.",
                }
              : null,
            resend: emailErrors,
          }
        : null,
    });

    return NextResponse.json(
      {
        success: true,
        leadSubmissionId,
      },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    console.error("[contact] submission error", error);
    return NextResponse.json(
      { error: "Unable to process your message right now. Please try again later." },
      { status: 500, headers: rateLimit.headers }
    );
  }
}
