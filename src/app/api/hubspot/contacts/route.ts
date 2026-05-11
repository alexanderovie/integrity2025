import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createIntegrationEvent, updateIntegrationEvent } from "@/lib/observability/integration-events";
import { getErrorMessage, getRequestId, logEvent } from "@/lib/observability/logger";
import { createLeadSubmission, makeLeadIdempotencyKey, updateLeadSubmissionStatus } from "@/lib/leads/lead-submissions";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Endpoint para crear o actualizar contactos en HubSpot
 * Se llama desde los formularios del sitio
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = getRequestId(request);
  const rateLimit = rateLimitMiddleware(request, 5, 15 * 60 * 1000);

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
    const body = await request.json();
    const { email, firstname, lastname, phone, zip, address, city, state } =
      body;

    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const name = [firstname, lastname].filter(Boolean).join(" ").trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    leadSubmissionId = await createLeadSubmission({
      name: name || null,
      email: normalizedEmail,
      phone,
      zip,
      source: "hubspot_contact_proxy",
      pagePath: request.nextUrl.pathname,
      idempotencyKey: makeLeadIdempotencyKey("hubspot_contact_proxy", [normalizedEmail, phone, zip]),
      rawPayload: {
        email: normalizedEmail,
        firstname,
        lastname,
        phone,
        zip,
        address,
        city,
        state,
        source: "hubspot_contact_proxy",
      },
    });

    const integrationEventId = await createIntegrationEvent({
      requestId,
      leadSubmissionId,
      provider: "hubspot",
      operation: "contact_proxy_sync",
      status: "processing",
      idempotencyKey: `hubspot:contact_proxy:${leadSubmissionId}`,
      metadata: { source: "hubspot_contact_proxy" },
    });

    const contact = await createOrUpdateContact({
      email: normalizedEmail,
      firstname: firstname || "",
      lastname: lastname || "",
      phone: phone || "",
      zip: zip || "",
      address: address || "",
      city: city || "",
      state: state || "",
    });

    await updateIntegrationEvent(integrationEventId, {
      status: "succeeded",
      providerObjectId: contact.id,
    });

    await updateLeadSubmissionStatus(leadSubmissionId, {
      status: "completed",
      hubspotStatus: "hubspot_synced",
      hubspotContactId: contact.id,
    });

    console.log("✅ Contacto creado/actualizado en HubSpot:", contact.id);

    return NextResponse.json({
      success: true,
      contactId: contact.id,
      leadSubmissionId,
    }, { headers: rateLimit.headers });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error creando contacto en HubSpot:", errorMessage);

    if (leadSubmissionId) {
      await updateLeadSubmissionStatus(leadSubmissionId, {
        status: "partial_failure",
        hubspotStatus: "hubspot_failed",
        errorLog: {
          provider: "hubspot",
          operation: "contact_proxy_sync",
          message: errorMessage,
        },
      });
    }

    logEvent({
      level: "error",
      event: "hubspot_contact_proxy_failed",
      requestId,
      route: request.nextUrl.pathname,
      leadSubmissionId,
      provider: "hubspot",
      operation: "contact_proxy_sync",
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
