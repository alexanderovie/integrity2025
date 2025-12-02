import { CLEANING_SERVICES, stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema, validatePayloadSize } from "@/lib/validations/schemas";
import { createErrorResponse, formatValidationError } from "@/lib/utils/errors";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Validar tamaño del payload
    const bodyText = await request.text();
    if (!validatePayloadSize(bodyText)) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 },
      );
    }

    // Parsear JSON
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format" },
        { status: 400 },
      );
    }

    // Validar con Zod
    const validationResult = checkoutSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: formatValidationError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { serviceId, customerEmail, customerName, customPrice, quoteData } =
      validationResult.data;

    const service = CLEANING_SERVICES.find((s) => s.id === serviceId);
    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 400 });
    }

    const finalPrice = customPrice ? Math.round(customPrice * 100) : service.price;
    const serviceName = customPrice ? `Custom Quote - ${service.name}` : service.name;
    const serviceDescription = customPrice
      ? "Personalized cleaning service quote based on your property details"
      : service.description;

    // Crear o actualizar contacto en HubSpot (no bloquea si falla)
    try {
      const nameParts = customerName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const quoteDataObj = quoteData || {};
      await createOrUpdateContact({
        email: customerEmail,
        firstname: firstName,
        lastname: lastName,
        phone: (quoteDataObj as any).phone || "",
        zip: (quoteDataObj as any).zipCode || (quoteDataObj as any).zip || "",
        address: (quoteDataObj as any).address || "",
        city: (quoteDataObj as any).city || "",
        state: (quoteDataObj as any).state || "",
      });
      console.log("✅ Contacto guardado en HubSpot al crear checkout:", customerEmail);
    } catch (hubspotError) {
      console.error("⚠️ Error guardando contacto en HubSpot (checkout):", hubspotError);
      // No fallar el checkout si HubSpot falla
    }

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
      customer_email: customerEmail,
      metadata: {
        serviceId,
        customerName,
        customPrice: customPrice?.toString() || "",
        quoteData: JSON.stringify(quoteData || {}),
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Error interno del servidor. Por favor, intenta de nuevo." },
      { status: 500 },
    );
  }
}
