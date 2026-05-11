import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { normalizePhone } from "@/lib/validation/phone";
import { sanitizeInput, isValidEmail, containsSQLInjection, containsHeaderInjection } from "@/lib/security";
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
  renderContactTeamNotificationEmail,
} from "@/lib/email";

export const runtime = "nodejs";

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

  try {
    // Validar tamaño del payload
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 },
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 },
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
        { status: 400 },
      );
    }

    if (!phone.trim()) {
      return NextResponse.json(
        { error: "Phone number is required." },
        { status: 400 },
      );
    }

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
        { status: 503 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const contactEmail = process.env.CONTACT_EMAIL || process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !contactEmail) {
      console.error("[contact] missing environment variables");
      await safeUpdateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        errorLog: {
          provider: "resend",
          operation: "send_internal_email",
          message: "Missing contact email environment variables.",
        },
      });
      return NextResponse.json(
        { error: "Contact service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendApiKey);

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

    const resendEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "contact_form_team_notification",
      status: "processing",
      idempotencyKey: `resend:contact:team:${leadSubmissionId}`,
      metadata: { source },
    });

    // Send notification email to team
    let resendEmailId: string | null = null;
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
        throw new Error(emailResult.error.message || "Resend failed to send email.");
      }

      resendEmailId = "data" in emailResult ? emailResult.data?.id || null : null;
      await updateIntegrationEvent(resendEventId, {
        status: "succeeded",
        providerObjectId: resendEmailId,
        metadata: {
          source,
          templateName: renderedEmail.templateName,
          templateVersion: renderedEmail.templateVersion,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unable to send contact email.";
      await updateIntegrationEvent(resendEventId, {
        status: "failed",
        lastError: getErrorMessage(error),
      });
      await safeUpdateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        hubspotStatus: hubspotResult.success
          ? "hubspot_synced"
          : hubspotResult.status === "queued"
            ? "hubspot_queued"
            : "hubspot_failed",
        hubspotContactId: hubspotResult.contactId,
        errorLog: {
          provider: "resend",
          operation: "send_internal_email",
          message: errorMessage,
        },
      });

      return NextResponse.json(
        { error: "Unable to process your message right now. Please try again later." },
        { status: 502 },
      );
    }

    await safeUpdateLeadSubmissionStatus(leadSubmissionId, {
      status: hubspotResult.success || hubspotResult.status === "queued" ? "completed" : "partial_failure",
      resendStatus: "email_sent",
      resendEmailId,
      hubspotStatus: hubspotResult.success
        ? "hubspot_synced"
        : hubspotResult.status === "queued"
          ? "hubspot_queued"
          : "hubspot_failed",
      hubspotContactId: hubspotResult.contactId,
      errorLog: hubspotResult.success
        ? null
        : {
            provider: "hubspot",
            operation: "upsert_contact",
            message: hubspotResult.error || "HubSpot sync did not complete.",
          },
    });

    return NextResponse.json({
      success: true,
      leadSubmissionId,
      hubspot: {
        status: hubspotResult.status,
        contactId: hubspotResult.contactId,
        error: hubspotResult.error,
      },
    });
  } catch (error) {
    console.error("[contact] submission error", error);
    return NextResponse.json(
      { error: "Unable to process your message right now. Please try again later." },
      { status: 500 }
    );
  }
}
