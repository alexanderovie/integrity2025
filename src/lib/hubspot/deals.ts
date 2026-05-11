/**
 * Funciones para gestionar deals (oportunidades) en HubSpot
 */

import { HUBSPOT_PATHS, hubspotRequest } from "./client";
import { getContactIdByEmail } from "./contacts";
import { DEAL_STAGES, DEFAULT_PIPELINE, type DealStage, resolveHubspotStage } from "./pipeline";

export interface HubSpotDeal {
  dealname: string;
  amount?: string;
  dealstage?: DealStage | string;
  pipeline?: string;
  closedate?: string;
  description?: string;
  dealtype?: string;
  [key: string]: string | undefined;
}

export interface HubSpotDealResponse {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea un deal en HubSpot asociado a un contacto
 */
interface HubSpotDealCreateRequest {
  properties: {
    dealname: string;
    amount: string;
    dealstage: string;
    pipeline: string;
    closedate: string;
    description: string;
    dealtype?: string;
  };
  associations?: Array<{
    to: { id: string };
    types: Array<{
      associationCategory: string;
      associationTypeId: number;
    }>;
  }>;
}

export async function createDeal(
  deal: HubSpotDeal,
  contactEmail?: string
): Promise<HubSpotDealResponse> {
  const dealData: HubSpotDealCreateRequest = {
    properties: {
      dealname: deal.dealname,
      amount: deal.amount || "0",
      dealstage: resolveHubspotStage(deal.dealstage || DEAL_STAGES.LEAD_CAPTURED),
      pipeline: deal.pipeline || DEFAULT_PIPELINE,
      closedate: deal.closedate || new Date().toISOString(),
      description: deal.description || "",
      ...(deal.dealtype && { dealtype: deal.dealtype }),
    },
  };

  // Si hay un contacto asociado, agregarlo a las asociaciones
  if (contactEmail) {
    const contactId = await getContactIdByEmail(contactEmail);
    if (contactId) {
      dealData.associations = [
        {
          to: {
            id: contactId,
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 3, // Contact to Deal
            },
          ],
        },
      ];
    }
  }

  return hubspotRequest<HubSpotDealResponse>(HUBSPOT_PATHS.object("deals"), {
    method: "POST",
    body: JSON.stringify(dealData),
  });
}

/**
 * Actualiza un deal existente
 */
export async function updateDeal(
  dealId: string,
  updates: Partial<HubSpotDeal>
): Promise<HubSpotDealResponse> {
  return hubspotRequest<HubSpotDealResponse>(
    HUBSPOT_PATHS.objectById("deals", dealId),
    {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          dealname: updates.dealname,
          amount: updates.amount,
          dealstage: updates.dealstage,
          description: updates.description,
          dealtype: updates.dealtype,
        },
      }),
    }
  );
}

/**
 * Marca un deal como "Won" (ganado)
 */
export async function markDealAsWon(dealId: string): Promise<HubSpotDealResponse> {
  return updateDeal(dealId, {
    dealstage: DEAL_STAGES.CLOSED_WON,
  });
}

/**
 * Busca un deal por email del contacto asociado
 */
export async function findDealByContactEmail(
  contactEmail: string
): Promise<HubSpotDealResponse | null> {
  try {
    // Primero buscar el contacto
    const contactResponse = await hubspotRequest<{
      results: Array<{ id: string }>;
    }>(HUBSPOT_PATHS.objectSearch("contacts"), {
      method: "POST",
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: "email",
                operator: "EQ",
                value: contactEmail,
              },
            ],
          },
        ],
        limit: 1,
      }),
    });

    if (!contactResponse.results || contactResponse.results.length === 0) {
      return null;
    }

    // Buscar deals asociados al contacto
    // Nota: La API de HubSpot requiere una búsqueda más específica
    // Por ahora, retornamos null y manejamos la búsqueda en el código que llama
    return null;
  } catch (error) {
    console.error("Error buscando deal por contacto:", error);
    return null;
  }
}

/**
 * Avanza un deal al siguiente stage del pipeline
 */
export async function advanceDealToNextStage(
  dealId: string
): Promise<HubSpotDealResponse | null> {
  try {
    // Obtener el deal actual
    const currentDeal = await hubspotRequest<HubSpotDealResponse>(
      HUBSPOT_PATHS.objectById("deals", dealId)
    );

    const currentStage = currentDeal.properties.dealstage as DealStage;

    // Importar función helper
    const { getNextStage } = await import("./pipeline");
    const nextStage = getNextStage(currentStage);

    if (!nextStage) {
      console.log(`ℹ️ Deal ${dealId} ya está en el stage final`);
      return currentDeal;
    }

    // Actualizar al siguiente stage
    return updateDeal(dealId, {
      dealstage: nextStage,
    });
  } catch (error) {
    console.error("Error avanzando deal al siguiente stage:", error);
    return null;
  }
}
