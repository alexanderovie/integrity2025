/**
 * Funciones para gestionar deals (oportunidades) en HubSpot
 */

import { hubspotRequest } from "./client";

export interface HubSpotDeal {
  dealname: string;
  amount?: string;
  dealstage?: string;
  pipeline?: string;
  closedate?: string;
  description?: string;
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
export async function createDeal(
  deal: HubSpotDeal,
  contactEmail?: string
): Promise<HubSpotDealResponse> {
  const dealData: any = {
    properties: {
      dealname: deal.dealname,
      amount: deal.amount || "0",
      dealstage: deal.dealstage || "appointmentscheduled",
      pipeline: deal.pipeline || "default",
      closedate: deal.closedate || new Date().toISOString(),
      description: deal.description || "",
    },
  };

  // Si hay un contacto asociado, agregarlo a las asociaciones
  if (contactEmail) {
    dealData.associations = [
      {
        to: {
          id: contactEmail, // Se buscará por email
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

  return hubspotRequest<HubSpotDealResponse>("/crm/v3/objects/deals", {
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
    `/crm/v3/objects/deals/${dealId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          dealname: updates.dealname,
          amount: updates.amount,
          dealstage: updates.dealstage,
          description: updates.description,
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
    dealstage: "closedwon",
  });
}
