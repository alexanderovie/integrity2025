import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db/neon";
import { reconcileCheckoutSessionFromStripe } from "@/lib/stripe/checkout-reconciliation";
import Stripe from "stripe";

const getStripe = (): Stripe => {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(apiKey);
};

interface CheckoutSession {
  id: string;
  stripe_session_id: string;
  status: string;
  amount_total: number;
  currency: string;
  customer_email: string;
  service_id: string;
  created_at: Date;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
): Promise<NextResponse> {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
  }

  try {
    // === 1) LEER DE LA DB (primario) ===
    const session = await queryOne<CheckoutSession>(
      `SELECT id, stripe_session_id, status, amount_total, currency, customer_email, service_id, created_at
       FROM checkout_sessions
       WHERE stripe_session_id = $1`,
      [sessionId],
    );

    if (session) {
      let url: string | null = null;
      let reconciledStatus: string | null = null;

      try {
        const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId);
        url = stripeSession?.url || null;

        if (
          session.status !== "paid" &&
          (stripeSession.payment_status === "paid" || stripeSession.status === "expired")
        ) {
          const reconciliation = await reconcileCheckoutSessionFromStripe(sessionId);
          if (reconciliation.appStatus === "paid" || reconciliation.appStatus === "expired") {
            reconciledStatus = reconciliation.appStatus;
          }
        }
      } catch (stripeError) {
        const errorMessage = stripeError instanceof Error ? stripeError.message : "Unknown error";
        console.warn("Stripe session fetch failed:", errorMessage);
      }

      return NextResponse.json({
        id: session.id,
        status: reconciledStatus || session.status,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
        serviceId: session.service_id,
        createdAt: session.created_at,
        source: reconciledStatus ? "database_reconciled_from_stripe" : "database",
        url,
      });
    }

    // === 2) FALLBACK A STRIPE (si no está en DB) ===
    console.warn("⚠️ Sesión no encontrada en DB, consultando Stripe...");
    const stripeSession = await getStripe().checkout.sessions.retrieve(sessionId);

    if (!stripeSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    return NextResponse.json({
      id: stripeSession.id,
      status: stripeSession.payment_status === "paid" ? "paid" : "unknown",
      amount: stripeSession.amount_total,
      currency: stripeSession.currency,
      customerEmail: stripeSession.customer_email,
      source: "stripe",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error retrieving checkout session:", errorMessage);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
