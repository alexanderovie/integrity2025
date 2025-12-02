import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";
import { contactSchema, validatePayloadSize } from "@/lib/validations/schemas";
import { createErrorResponse, formatValidationError } from "@/lib/utils/errors";

/**
 * Endpoint para crear o actualizar contactos en HubSpot
 * Se llama desde los formularios del sitio
 */
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
    const validationResult = contactSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          message: formatValidationError(validationResult.error),
        },
        { status: 400 },
      );
    }

    const { email, firstname, lastname, phone, zip, address, city, state } =
      validationResult.data;

    // Crear o actualizar contacto en HubSpot
    const contact = await createOrUpdateContact({
      email,
      firstname: firstname || "",
      lastname: lastname || "",
      phone: phone || "",
      zip: zip || "",
      address: address || "",
      city: city || "",
      state: state || "",
    });

    console.log("✅ Contacto creado/actualizado en HubSpot:", contact.id);

    return NextResponse.json({
      success: true,
      contactId: contact.id,
    });
  } catch (error) {
    console.error("Error creando contacto en HubSpot:", error);

    // No fallar silenciosamente, pero no bloquear el flujo del usuario
    return NextResponse.json(
      {
        success: false,
        error: "Error procesando la solicitud. Por favor, intenta de nuevo.",
      },
      { status: 500 }
    );
  }
}
