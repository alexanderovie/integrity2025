import { NextRequest, NextResponse } from "next/server";
import { queryOne } from "@/lib/db/neon";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
      return NextResponse.json({
        id: session.id,
        status: session.status,
        amount: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_email,
        serviceId: session.service_id,
        createdAt: session.created_at,
        source: "database",
      });
    }

    // === 2) FALLBACK A STRIPE (si no está en DB) ===
    console.warn("⚠️ Sesión no encontrada en DB, consultando Stripe...");
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

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
