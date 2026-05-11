import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createIntegrationEvent, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import {
  createLeadSubmission,
  makeLeadIdempotencyKey,
  updateLeadSubmissionStatus,
} from "@/lib/leads/lead-submissions";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";

type Payload = {
  email?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
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

  let leadSubmissionId: string | null = null;

  try {
    const body = (await request.json()) as Payload;
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    leadSubmissionId = await createLeadSubmission({
      email,
      source: "newsletter",
      pagePath: request.nextUrl.pathname,
      idempotencyKey: makeLeadIdempotencyKey("newsletter", [email]),
      rawPayload: {
        email,
        source: "newsletter",
      },
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL;
    const notifyEmail = process.env.TO_EMAIL;

    if (!resendApiKey || !fromEmail || !notifyEmail) {
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        errorLog: {
          provider: "resend",
          message: "Newsletter email environment is not configured.",
        },
      });

      logEvent({
        level: "error",
        event: "newsletter_missing_email_env",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        provider: "resend",
        operation: "newsletter_email_send",
      });

      return NextResponse.json(
        { error: "Newsletter service is unavailable. Please try again later." },
        { status: 500 },
      );
    }

    const hubspotEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "newsletter_contact_sync",
      status: "processing",
      idempotencyKey: `hubspot:newsletter:${leadSubmissionId}`,
      metadata: { source: "newsletter" },
    });

    let hubspotStatus = "hubspot_synced";
    let hubspotContactId: string | null = null;
    try {
      const contact = await createOrUpdateContact({
        email,
      });
      hubspotContactId = contact.id;
      await updateIntegrationEvent(hubspotEventId, {
        status: "succeeded",
        providerObjectId: contact.id,
      });
    } catch (hubspotError) {
      hubspotStatus = "hubspot_failed";
      await updateIntegrationEvent(hubspotEventId, {
        status: "failed",
        lastError: getErrorMessage(hubspotError),
      });
      logEvent({
        level: "error",
        event: "newsletter_hubspot_sync_failed",
        requestId,
        route: request.nextUrl.pathname,
        leadSubmissionId,
        integrationEventId: hubspotEventId,
        provider: "hubspot",
        operation: "newsletter_contact_sync",
        error: hubspotError,
      });
    }

    const resend = new Resend(resendApiKey);
    const welcomeEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "newsletter_welcome_email",
      status: "processing",
      idempotencyKey: `resend:newsletter:welcome:${leadSubmissionId}`,
      metadata: { source: "newsletter" },
    });

    const welcomeEmail = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to Integrity Clean Solutions",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2 style="margin-bottom: 12px;">Thanks for subscribing!</h2>
          <p style="margin: 0 0 16px;">You'll now receive cleaning tips, seasonal offers, and important updates from Integrity Clean Solutions.</p>
          <p style="margin: 0 0 16px;">We're excited to help you keep your spaces spotless.</p>
          <p style="margin: 0;">Integrity Clean Solutions Team</p>
        </div>
      `,
    });

    if (welcomeEmail.error) {
      await updateIntegrationEvent(welcomeEmailEventId, {
        status: "failed",
        lastError: getErrorMessage(welcomeEmail.error),
      });
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        hubspotStatus,
        hubspotContactId,
        errorLog: {
          provider: "resend",
          message: getErrorMessage(welcomeEmail.error),
        },
      });

      return NextResponse.json(
        { error: "Unable to process subscription right now." },
        { status: 502, headers: rateLimit.headers },
      );
    }

    await updateIntegrationEvent(welcomeEmailEventId, {
      status: "succeeded",
      providerObjectId: welcomeEmail.data?.id,
    });

    const notifyEmailEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "resend",
      operation: "newsletter_team_notification",
      status: "processing",
      idempotencyKey: `resend:newsletter:team:${leadSubmissionId}`,
      metadata: { source: "newsletter" },
    });

    const notificationEmail = await resend.emails.send({
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

    if (notificationEmail.error) {
      await updateIntegrationEvent(notifyEmailEventId, {
        status: "failed",
        lastError: getErrorMessage(notificationEmail.error),
      });
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        resendStatus: "email_failed",
        resendEmailId: welcomeEmail.data?.id,
        hubspotStatus,
        hubspotContactId,
        errorLog: {
          provider: "resend",
          message: getErrorMessage(notificationEmail.error),
        },
      });

      return NextResponse.json(
        { error: "Unable to process subscription right now." },
        { status: 502, headers: rateLimit.headers },
      );
    }

    await updateIntegrationEvent(notifyEmailEventId, {
      status: "succeeded",
      providerObjectId: notificationEmail.data?.id,
    });

    await updateLeadSubmissionStatus(leadSubmissionId, {
      status: hubspotStatus === "hubspot_synced" ? "completed" : "partial_failure",
      resendStatus: "email_sent",
      resendEmailId: welcomeEmail.data?.id,
      resendConfirmationEmailId: notificationEmail.data?.id,
      hubspotStatus,
      hubspotContactId,
    });

    return NextResponse.json(
      { success: true, leadSubmissionId },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    logEvent({
      level: "error",
      event: "newsletter_subscription_error",
      requestId,
      route: request.nextUrl.pathname,
      leadSubmissionId,
      error,
    });
    return NextResponse.json(
      { error: "Unable to process subscription right now." },
      {
        status: 500,
        headers: rateLimit.headers,
      },
    );
  }
}
