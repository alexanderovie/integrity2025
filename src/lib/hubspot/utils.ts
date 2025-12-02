/**
 * Utilidades para integrar HubSpot en formularios del cliente
 */

/**
 * Envía un contacto a HubSpot desde un formulario
 * Esta función se puede llamar desde el cliente (browser)
 */
export async function sendContactToHubSpot(data: {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  zip?: string;
  address?: string;
  city?: string;
  state?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/hubspot/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Error enviando contacto a HubSpot:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error enviando contacto a HubSpot:", errorMessage);
    // No fallar silenciosamente, pero no bloquear el flujo del usuario
    return { success: false, error: errorMessage };
  }
}

/**
 * Parsea un nombre completo en firstname y lastname
 */
export function parseName(fullName: string): {
  firstname: string;
  lastname: string;
} {
  const parts = fullName.trim().split(/\s+/);
  const firstname = parts[0] || "";
  const lastname = parts.slice(1).join(" ") || "";
  return { firstname, lastname };
}
