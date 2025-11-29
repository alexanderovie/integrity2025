import { NextRequest, NextResponse } from "next/server";
import { createOrUpdateContact } from "@/lib/hubspot/contacts";

/**
 * Endpoint para crear o actualizar contactos en HubSpot
 * Se llama desde los formularios del sitio
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { email, firstname, lastname, phone, zip, address, city, state } =
      body;

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      );
    }

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error creando contacto en HubSpot:", errorMessage);

    // No fallar silenciosamente, pero no bloquear el flujo del usuario
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
