/**
 * Funciones para gestionar contactos en HubSpot
 */

import { hubspotRequest } from "./client";

export interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  zip?: string;
  address?: string;
  city?: string;
  state?: string;
  [key: string]: string | undefined;
}

export interface HubSpotContactResponse {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea o actualiza un contacto en HubSpot
 * Si el contacto ya existe (por email), lo actualiza
 */
export async function createOrUpdateContact(
  contact: HubSpotContact
): Promise<HubSpotContactResponse> {
  try {
    // Intentar crear el contacto
    const response = await hubspotRequest<HubSpotContactResponse>(
      "/crm/v3/objects/contacts",
      {
        method: "POST",
        body: JSON.stringify({
          properties: {
            email: contact.email,
            firstname: contact.firstname || "",
            lastname: contact.lastname || "",
            phone: contact.phone || "",
            zip: contact.zip || "",
            address: contact.address || "",
            city: contact.city || "",
            state: contact.state || "",
          },
        }),
      }
    );

    return response;
  } catch (error) {
    // Si el error es que el contacto ya existe, intentar actualizarlo
    if (
      error instanceof Error &&
      error.message.includes("CONTACT_EXISTS")
    ) {
      return updateContactByEmail(contact.email, contact);
    }
    throw error;
  }
}

/**
 * Actualiza un contacto existente por email
 */
export async function updateContactByEmail(
  email: string,
  updates: Partial<HubSpotContact>
): Promise<HubSpotContactResponse> {
  // Primero buscar el contacto por email
  const searchResponse = await hubspotRequest<{
    results: Array<{ id: string }>;
  }>(
    `/crm/v3/objects/contacts/search`,
    {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: email,
              },
            ],
          },
        ],
        limit: 1,
      }),
    }
  );

  if (!searchResponse.results || searchResponse.results.length === 0) {
    throw new Error(`Contacto con email ${email} no encontrado`);
  }

  const contactId = searchResponse.results[0].id;

  // Actualizar el contacto
  return hubspotRequest<HubSpotContactResponse>(
    `/crm/v3/objects/contacts/${contactId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          firstname: updates.firstname,
          lastname: updates.lastname,
          phone: updates.phone,
          zip: updates.zip,
          address: updates.address,
          city: updates.city,
          state: updates.state,
        },
      }),
    }
  );
}

/**
 * Obtiene un contacto por email
 */
export async function getContactByEmail(
  email: string
): Promise<HubSpotContactResponse | null> {
  try {
    const response = await hubspotRequest<{
      results: HubSpotContactResponse[];
    }>(
      `/crm/v3/objects/contacts/search`,
      {
        method: "POST",
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ",
                  value: email,
                },
              ],
            },
          ],
          limit: 1,
        }),
      }
    );

    return response.results?.[0] || null;
  } catch (error) {
    console.error("Error obteniendo contacto:", error);
    return null;
  }
}

/**
 * Elimina un contacto de HubSpot por email
 */
export async function deleteContactByEmail(
  email: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Primero buscar el contacto por email
    const contact = await getContactByEmail(email);

    if (!contact) {
      return {
        success: false,
        message: `Contacto con email ${email} no encontrado`,
      };
    }

    // Eliminar el contacto
    await hubspotRequest(
      `/crm/v3/objects/contacts/${contact.id}`,
      {
        method: "DELETE",
      }
    );

    return {
      success: true,
      message: `Contacto ${email} (ID: ${contact.id}) eliminado exitosamente`,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Error desconocido";
    console.error(`Error eliminando contacto ${email}:`, errorMessage);
    return {
      success: false,
      message: `Error eliminando contacto: ${errorMessage}`,
    };
  }
}
