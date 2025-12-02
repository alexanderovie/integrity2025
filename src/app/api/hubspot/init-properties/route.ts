/**
 * API Route para inicializar las custom properties en HubSpot
 * Ejecutar una vez para crear todas las propiedades necesarias
 */

import { NextResponse } from "next/server";
import { ensureEliteProProperties } from "@/lib/hubspot/properties";

export async function POST() {
  try {
    console.log("🚀 Inicializando custom properties en HubSpot...");
    await ensureEliteProProperties();
    console.log("✅ Custom properties inicializadas correctamente");

    return NextResponse.json({
      success: true,
      message: "Custom properties creadas correctamente",
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error inicializando custom properties:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
