import { CLEANING_SERVICES, stripe } from "@/lib/stripe";
import { rateLimitMiddleware } from "@/lib/security/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CUSTOM_PRICE_MIN = 25;
const CUSTOM_PRICE_MAX = 5000;

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

    const service = CLEANING_SERVICES.find((s) => s.id === serviceId);
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

    if (
      hasCustomPrice &&
      ((parsedCustomPrice as number) < CUSTOM_PRICE_MIN ||
        (parsedCustomPrice as number) > CUSTOM_PRICE_MAX)
    ) {
      return NextResponse.json(
        { error: `Custom price must be between ${CUSTOM_PRICE_MIN} and ${CUSTOM_PRICE_MAX}.` },
        { status: 400, headers: rateLimit.headers },
      );
    }

    const finalPrice = hasCustomPrice
      ? Math.round((parsedCustomPrice as number) * 100)
      : service.price;
    const serviceName = hasCustomPrice ? `Custom Quote - ${service.name}` : service.name;
    const serviceDescription = hasCustomPrice
      ? "Personalized cleaning service quote based on your property details"
      : service.description;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: serviceName,
              description: serviceDescription,
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/quote`,
      customer_email: normalizedEmail,
      metadata: {
        serviceId,
        customerName: normalizedName,
        customPrice: hasCustomPrice ? parsedCustomPrice?.toString() || "" : "",
        quoteData: JSON.stringify(quoteData || {}),
      },
    });

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
