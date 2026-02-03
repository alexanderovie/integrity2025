import { stripe } from "@/lib/stripe";
import { getStripeServicePrices } from "@/lib/stripe-prices";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { query, queryOne, queryRaw } from "@/lib/db/neon";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_CUSTOM_PRICE_MIN = 25;
const DEFAULT_CUSTOM_PRICE_MAX = 5000;

// Tenant demo hardcodeado para este proyecto independiente
const DEMO_TENANT_ID = "46af543c-d700-48d5-b9f2-abce07984cd0";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rateLimit = rateLimitMiddleware(request, 5, 15 * 60 * 1000);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please try again later." },
      {
        status: 429,
        headers: rateLimit.headers,
      },
    );
  }

  try {
    const body = await request.json();
    const { serviceId, customerEmail, customerName, customPrice, quoteData } = body;

    const normalizedEmail = typeof customerEmail === "string" ? customerEmail.trim().toLowerCase() : "";
    const normalizedName = typeof customerName === "string" ? customerName.trim() : "";

    if (!normalizedEmail || !normalizedName) {
      return NextResponse.json(
        { error: "Customer name and email are required." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const service = await queryOne<{
      id: string;
      slug: string;
      nombre: string;
      descripcion: string | null;
      precio_base: number;
    }>(
      `SELECT id, slug, nombre, descripcion, precio_base
       FROM public.services
       WHERE slug = $1 AND activo = true`,
      [serviceId],
    );

    if (!service) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const hasCustomPrice = customPrice !== undefined && customPrice !== null && customPrice !== "";
    const parsedCustomPrice = hasCustomPrice ? Number(customPrice) : null;

    if (hasCustomPrice && (!Number.isFinite(parsedCustomPrice))) {
      return NextResponse.json(
        { error: "Custom price must be a valid number." },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const settingsResult = await queryOne<{ valor: Record<string, unknown> }>(
      `SELECT valor FROM public.app_settings WHERE clave = 'pricing' LIMIT 1`
    );

    const settings = settingsResult?.valor || {};
    const customPriceMin = typeof settings.custom_price_min === "number"
      ? settings.custom_price_min
      : DEFAULT_CUSTOM_PRICE_MIN;
    const customPriceMax = typeof settings.custom_price_max === "number"
      ? settings.custom_price_max
      : DEFAULT_CUSTOM_PRICE_MAX;

    if (
      hasCustomPrice &&
      ((parsedCustomPrice as number) < customPriceMin || (parsedCustomPrice as number) > customPriceMax)
    ) {
      return NextResponse.json(
        { error: `Custom price must be between ${customPriceMin} and ${customPriceMax}.` },
        { status: 400, headers: rateLimit.headers },
      );
    }

    // Calcular precio final en centavos
    const finalPrice = hasCustomPrice
      ? Math.round((parsedCustomPrice as number) * 100)
      : service.precio_base;

    // === 1) INSERT en checkout_sessions ANTES de Stripe ===
    const insertResult = await queryRaw(
      `INSERT INTO checkout_sessions
        (tenant_id, service_id, customer_email, customer_name, amount_total, currency, status, metadata, quote)
       VALUES
        ($1, $2, $3, $4, $5, 'usd', 'created', $6, $7)
       RETURNING id`,
      [
        DEMO_TENANT_ID,
        serviceId,
        normalizedEmail,
        normalizedName,
        finalPrice,
        JSON.stringify({ serviceId, customPrice: parsedCustomPrice }),
        JSON.stringify(quoteData || {}),
      ],
    );

    const checkoutId = insertResult.rows[0].id;

    // Obtener precios de Stripe
    const stripePrices = await getStripeServicePrices();
    const stripePrice = stripePrices[serviceId];

    const serviceName = hasCustomPrice ? `Custom Quote - ${service.nombre}` : service.nombre;
    const serviceDescription = hasCustomPrice
      ? "Personalized cleaning service quote based on your property details"
      : service.descripcion || "Cleaning service";

    const lineItem = hasCustomPrice || !stripePrice?.priceId
      ? {
          price_data: {
            currency: "usd",
            product_data: {
              name: serviceName,
              description: serviceDescription,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        }
      : {
          price: stripePrice.priceId,
          quantity: 1,
        };

    // === 2) Crear Stripe Checkout Session ===
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [lineItem],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/quote`,
      customer_email: normalizedEmail,
      metadata: {
        checkout_id: checkoutId,
        serviceId,
        customerName: normalizedName,
        customPrice: hasCustomPrice ? parsedCustomPrice?.toString() || "" : "",
        quoteData: JSON.stringify(quoteData || {}),
      },
    });

    // === 3) UPDATE con stripe_session_id ===
    await query(
      `UPDATE checkout_sessions
       SET stripe_session_id = $1, status = 'redirected', updated_at = NOW()
       WHERE id = $2`,
      [session.id, checkoutId],
    );

    return NextResponse.json(
      { sessionId: session.id },
      { headers: rateLimit.headers },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating checkout session:", errorMessage);
    return NextResponse.json(
      { error: `Error interno del servidor: ${errorMessage}` },
      { status: 500, headers: rateLimit.headers },
    );
  }
}
