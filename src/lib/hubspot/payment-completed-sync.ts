import "server-only";

import type Stripe from "stripe";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { createDeal } from "@/lib/hubspot/deals";
import { enrichContact, enrichDeal } from "@/lib/hubspot/enrichment";
import { DEAL_STAGES } from "@/lib/hubspot/pipeline";

type QuoteData = Record<string, unknown>;

function parseQuoteData(session: Stripe.Checkout.Session): QuoteData {
  const rawQuoteData = session.metadata?.quoteData;
  if (!rawQuoteData) return {};

  try {
    const parsed = JSON.parse(rawQuoteData);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getString(data: QuoteData, key: string): string {
  const value = data[key];
  return typeof value === "string" ? value : "";
}

function getFirstString(data: QuoteData, keys: string[]): string {
  for (const key of keys) {
    const value = getString(data, key);
    if (value) return value;
  }

  return "";
}

function getNumber(data: QuoteData, key: string): number | undefined {
  const value = data[key];
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getServicesRequested(data: QuoteData): string | undefined {
  const services = data.services;
  if (Array.isArray(services)) {
    return services.map((service) => String(service).trim()).filter(Boolean).join(", ") || undefined;
  }

  return typeof services === "string" && services.trim() ? services : undefined;
}

function getServiceCount(data: QuoteData): number | undefined {
  const services = data.services;
  if (Array.isArray(services)) return services.length;
  if (typeof services === "string" && services.trim()) {
    return services.split(",").map((service) => service.trim()).filter(Boolean).length;
  }

  return undefined;
}

export async function syncHubSpotPaymentCompleted(session: Stripe.Checkout.Session): Promise<string> {
  const quoteData = parseQuoteData(session);
  const customerEmail = session.customer_email || session.customer_details?.email || "";

  if (!customerEmail) {
    throw new Error(`Stripe session ${session.id} does not include a customer email.`);
  }

  const customerName = session.metadata?.customerName || session.customer_details?.name || "Cliente";
  const nameParts = customerName.split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const servicesRequested = getServicesRequested(quoteData);
  const propertySize = getNumber(quoteData, "propertySize");
  const bedrooms = getNumber(quoteData, "bedrooms");
  const bathrooms = getNumber(quoteData, "bathrooms");
  const serviceFrequency = getString(quoteData, "frequency") || undefined;
  const zip = getFirstString(quoteData, ["zipCode", "zip"]);
  const address = getString(quoteData, "address");
  const phone = getString(quoteData, "phone") || session.customer_details?.phone || "";
  const dealAmount = ((session.amount_total || 0) / 100).toString();
  const dealDescription = [
    "Servicio de limpieza pagado por Stripe.",
    `Propiedad: ${getString(quoteData, "propertySize") || "N/A"} sq ft, ${getString(quoteData, "bedrooms") || "N/A"} habitaciones, ${getString(quoteData, "bathrooms") || "N/A"} banos.`,
    `Frecuencia: ${serviceFrequency || "One-time"}.`,
    servicesRequested ? `Servicios solicitados: ${servicesRequested}.` : undefined,
    address ? `Direccion: ${address}.` : undefined,
    zip ? `ZIP: ${zip}.` : undefined,
  ].filter(Boolean).join("\n");

  await createOrUpdateContact({
    email: customerEmail,
    firstname: firstName,
    lastname: lastName,
    phone,
    zip,
    address,
    hs_lead_status: "OPEN_DEAL",
    lifecyclestage: "customer",
    message: dealDescription,
  });

  await enrichContact(customerEmail, {
    propertySize,
    bedrooms,
    bathrooms,
    serviceCount: getServiceCount(quoteData),
    serviceFrequency,
    hasQuoteForm: true,
    hasPayment: true,
    hasPaymentCompleted: true,
    zip: zip || undefined,
  });

  const deal = await createDeal(
    {
      dealname: `Cleaning Service - ${customerName} - $${dealAmount}`,
      amount: dealAmount,
      dealstage: DEAL_STAGES.PAYMENT_COMPLETED,
      description: dealDescription,
      dealtype: "newbusiness",
    },
    customerEmail,
  );

  await enrichDeal(deal.id, {
    propertySize,
    bedrooms,
    bathrooms,
    servicesRequested,
  });

  return deal.id;
}
