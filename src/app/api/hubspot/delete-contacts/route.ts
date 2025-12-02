import { NextRequest, NextResponse } from "next/server";
import { deleteContactByEmail } from "@/lib/hubspot/contacts";

/**
 * DELETE /api/hubspot/delete-contacts
 * Elimina contactos de prueba de HubSpot
 *
 * Body: { emails: string[] }
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { emails } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "emails array is required" },
        { status: 400 }
      );
    }

    const results = [];

    for (const email of emails) {
      const result = await deleteContactByEmail(email);
      results.push({ email, ...result });
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      summary: {
        total: emails.length,
        deleted: successful,
        failed,
      },
      results,
    });
  } catch (error) {
    console.error("Error eliminando contactos:", error);
    return NextResponse.json(
      {
        error: "Error procesando la solicitud",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
