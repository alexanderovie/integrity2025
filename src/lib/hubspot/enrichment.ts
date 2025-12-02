/**
 * Funciones para enriquecer datos de contactos y deals
 * Calcula valores derivados y actualiza propiedades en HubSpot
 */

import { createOrUpdateContact, updateContactByEmail } from "./contacts";
import { updateDeal } from "./deals";
import type { HubSpotContact } from "./contacts";
import type { HubSpotDeal } from "./deals";

/**
 * Calcula el lead score basado en interacciones y datos
 */
export function calculateLeadScore(data: {
  hasQuoteForm?: boolean;
  propertySize?: number;
  serviceFrequency?: string;
  serviceCount?: number;
  hasPayment?: boolean;
  hasPaymentCompleted?: boolean;
  hasContactForm?: boolean;
  isNewsletterOnly?: boolean;
}): number {
  let score = 0;

  // Quote form completado
  if (data.hasQuoteForm) {
    score += 10;
  }

  // Property size grande
  if (data.propertySize && data.propertySize > 2000) {
    score += 15;
  }

  // Frecuencia recurrente
  if (data.serviceFrequency === "weekly" || data.serviceFrequency === "bi-weekly") {
    score += 20;
  }

  // Múltiples servicios
  if (data.serviceCount && data.serviceCount > 1) {
    score += 25;
  }

  // Payment iniciado
  if (data.hasPayment) {
    score += 30;
  }

  // Payment completado
  if (data.hasPaymentCompleted) {
    score += 50;
  }

  // Contact form con mensaje
  if (data.hasContactForm) {
    score += 5;
  }

  // Solo newsletter (sin acción)
  if (data.isNewsletterOnly) {
    score -= 5;
    score = Math.max(0, score); // No permitir scores negativos
  }

  return score;
}

/**
 * Calcula el valor estimado del deal basado en property size y servicios
 */
export function calculateEstimatedDealValue(data: {
  propertySize?: number;
  bedrooms?: number;
  bathrooms?: number;
  serviceCount?: number;
  serviceFrequency?: string;
}): number {
  let baseValue = 0;

  // Valor base por tamaño de propiedad
  if (data.propertySize) {
    if (data.propertySize < 1000) {
      baseValue = 100;
    } else if (data.propertySize < 2000) {
      baseValue = 150;
    } else if (data.propertySize < 3000) {
      baseValue = 200;
    } else {
      baseValue = 250;
    }
  }

  // Ajuste por habitaciones y baños
  if (data.bedrooms) {
    baseValue += data.bedrooms * 10;
  }
  if (data.bathrooms) {
    baseValue += data.bathrooms * 15;
  }

  // Ajuste por número de servicios
  if (data.serviceCount && data.serviceCount > 1) {
    baseValue *= 1 + (data.serviceCount - 1) * 0.2; // +20% por cada servicio adicional
  }

  // Ajuste por frecuencia (recurrente vale más)
  if (data.serviceFrequency === "weekly") {
    baseValue *= 4; // Valor mensual
  } else if (data.serviceFrequency === "bi-weekly") {
    baseValue *= 2; // Valor mensual
  } else if (data.serviceFrequency === "monthly") {
    baseValue *= 1; // Valor mensual
  }

  return Math.round(baseValue);
}

/**
 * Detecta el tipo de propiedad basado en ZIP code
 * Por ahora retorna "residential" por defecto
 * En el futuro se puede integrar con una API de geolocalización
 */
export function detectPropertyType(zip?: string): "residential" | "commercial" {
  // Por ahora, asumimos residencial
  // En el futuro, se puede usar una API como Google Maps o similar
  // para detectar el tipo de propiedad basado en la dirección
  return "residential";
}

/**
 * Enriquece un contacto con datos calculados
 */
export async function enrichContact(
  email: string,
  data: {
    propertySize?: number;
    bedrooms?: number;
    bathrooms?: number;
    serviceCount?: number;
    serviceFrequency?: string;
    hasQuoteForm?: boolean;
    hasPayment?: boolean;
    hasPaymentCompleted?: boolean;
    hasContactForm?: boolean;
    isNewsletterOnly?: boolean;
    zip?: string;
  }
): Promise<void> {
  try {
    // Calcular valores
    const leadScore = calculateLeadScore({
      hasQuoteForm: data.hasQuoteForm,
      propertySize: data.propertySize,
      serviceFrequency: data.serviceFrequency,
      serviceCount: data.serviceCount,
      hasPayment: data.hasPayment,
      hasPaymentCompleted: data.hasPaymentCompleted,
      hasContactForm: data.hasContactForm,
      isNewsletterOnly: data.isNewsletterOnly,
    });

    const estimatedDealValue = calculateEstimatedDealValue({
      propertySize: data.propertySize,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      serviceCount: data.serviceCount,
      serviceFrequency: data.serviceFrequency,
    });

    const propertyType = detectPropertyType(data.zip);

    // Actualizar propiedades usando la API directamente
    // Solo actualizar si las propiedades existen (no fallar si no existen)
    const { getContactByEmail } = await import("./contacts");
    const contact = await getContactByEmail(email);

    if (contact) {
      const { hubspotRequest } = await import("./client");
      
      // Construir objeto de propiedades solo con las que queremos actualizar
      const propertiesToUpdate: Record<string, string> = {};
      
      // Intentar actualizar custom properties (solo si existen)
      // Si fallan, no romper el flujo
      try {
        // Verificar si las propiedades existen antes de actualizarlas
        // Por ahora, intentamos actualizar y si falla, continuamos
        propertiesToUpdate.lead_score = leadScore.toString();
        propertiesToUpdate.estimated_deal_value = estimatedDealValue.toString();
        propertiesToUpdate.property_type = propertyType;
        
        if (data.serviceFrequency) {
          propertiesToUpdate.service_frequency = data.serviceFrequency;
        }
        if (data.serviceCount) {
          propertiesToUpdate.preferred_service_type = `${data.serviceCount} services`;
        }

        await hubspotRequest(`/crm/v3/objects/contacts/${contact.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            properties: propertiesToUpdate,
          }),
        });

        console.log(`✅ Contacto enriquecido: ${email} (score: ${leadScore}, value: $${estimatedDealValue})`);
      } catch (error) {
        // Si las propiedades no existen o hay error de scopes, solo loguear
        // No romper el flujo principal
        console.warn(`⚠️ No se pudieron actualizar custom properties para ${email}. Esto es normal si las propiedades no están creadas o faltan scopes.`);
        console.warn(`   Calculado: score=${leadScore}, value=$${estimatedDealValue} (no guardado en HubSpot)`);
      }
    }
  } catch (error) {
    console.error(`❌ Error enriqueciendo contacto ${email}:`, error);
    // No lanzar error para no romper el flujo principal
  }
}

/**
 * Enriquece un deal con datos calculados
 */
export async function enrichDeal(
  dealId: string,
  data: {
    propertySize?: number;
    bedrooms?: number;
    bathrooms?: number;
    servicesRequested?: string;
  }
): Promise<void> {
  try {
    await updateDeal(dealId, {
      ...(data.propertySize && { property_size: data.propertySize.toString() }),
      ...(data.bedrooms && { bedrooms: data.bedrooms.toString() }),
      ...(data.bathrooms && { bathrooms: data.bathrooms.toString() }),
      ...(data.servicesRequested && { services_requested: data.servicesRequested }),
    });

    console.log(`✅ Deal enriquecido: ${dealId}`);
  } catch (error) {
    console.error(`❌ Error enriqueciendo deal ${dealId}:`, error);
    // No lanzar error para no romper el flujo principal
  }
}
