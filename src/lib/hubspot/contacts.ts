/**
 * Funciones para gestionar contactos en HubSpot
 */

import { HUBSPOT_PATHS, hubspotRequest } from "./client";

export interface HubSpotContact {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  zip?: string;
  address?: string;
  city?: string;
  state?: string;
  hs_lead_status?: string;
  lifecyclestage?: string;
  message?: string;
  [key: string]: string | undefined;
}

export interface HubSpotContactResponse {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface HubSpotBatchUpsertResponse {
  status: string;
  results?: Array<HubSpotContactResponse & { new?: boolean }>;
  errors?: Array<{
    message?: string;
    category?: string;
  }>;
}

function compactProperties(properties: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => Boolean(value?.trim())),
  ) as Record<string, string>;
}

/**
 * Crea o actualiza un contacto en HubSpot
 * Si el contacto ya existe (por email), lo actualiza
 */
export async function createOrUpdateContact(
  contact: HubSpotContact
): Promise<HubSpotContactResponse> {
  const response = await hubspotRequest<HubSpotBatchUpsertResponse>(
    HUBSPOT_PATHS.objectBatchUpsert("contacts"),
    {
      method: "POST",
      body: JSON.stringify({
        inputs: [
          {
            id: contact.email,
            idProperty: "email",
            objectWriteTraceId: `contact:${contact.email}`,
            properties: compactProperties({
              email: contact.email,
              firstname: contact.firstname,
              lastname: contact.lastname,
              phone: contact.phone,
              zip: contact.zip,
              address: contact.address,
              city: contact.city,
              state: contact.state,
              hs_lead_status: contact.hs_lead_status,
              lifecyclestage: contact.lifecyclestage,
              message: contact.message,
            }),
          },
        ],
      }),
    },
  );

  const result = response.results?.[0];
  if (result) {
    return result;
  }

  const errorMessage = response.errors?.map((error) => error.message).filter(Boolean).join("; ");
  throw new Error(errorMessage || "HubSpot contact upsert did not return a contact.");
}

/**
 * Actualiza un contacto existente por email
 */
export async function updateContactByEmail(
  email: string,
  updates: Partial<HubSpotContact>
): Promise<HubSpotContactResponse> {
  const contactId = await getContactIdByEmail(email);

  if (!contactId) {
    throw new Error(`Contacto con email ${email} no encontrado`);
  }

  // Actualizar el contacto
  return hubspotRequest<HubSpotContactResponse>(
    HUBSPOT_PATHS.objectById("contacts", contactId),
    {
      method: "PATCH",
      body: JSON.stringify({
        properties: compactProperties({
          firstname: updates.firstname,
          lastname: updates.lastname,
          phone: updates.phone,
          zip: updates.zip,
          address: updates.address,
          city: updates.city,
          state: updates.state,
          hs_lead_status: updates.hs_lead_status,
          lifecyclestage: updates.lifecyclestage,
          message: updates.message,
        }),
      }),
    }
  );
}

export async function getContactIdByEmail(email: string): Promise<string | null> {
  const searchResponse = await hubspotRequest<{
    results: Array<{ id: string }>;
  }>(
    HUBSPOT_PATHS.objectSearch("contacts"),
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
    return null;
  }

  return searchResponse.results[0].id;
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
      HUBSPOT_PATHS.objectSearch("contacts"),
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
