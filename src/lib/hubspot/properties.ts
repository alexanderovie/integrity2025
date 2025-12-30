/**
 * Funciones para gestionar custom properties en HubSpot
 * Permite crear y actualizar propiedades personalizadas en contactos y deals
 */

import { hubspotRequest } from "./client";

export interface HubSpotProperty {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "enumeration" | "bool";
  description?: string;
  options?: Array<{ label: string; value: string }>; // Para enumerations
  groupName?: string;
}

export interface HubSpotPropertyResponse {
  name: string;
  label: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Crea una custom property para contactos
 */
interface HubSpotPropertyCreateRequest {
  name: string;
  label: string;
  type: string;
  description: string;
  groupName: string;
  options?: Array<{ label: string; value: string }>;
}

export async function createContactProperty(
  property: HubSpotProperty
): Promise<HubSpotPropertyResponse> {
  const propertyData: HubSpotPropertyCreateRequest = {
    name: property.name,
    label: property.label,
    type: property.type,
    description: property.description || "",
    groupName: property.groupName || "contactinformation",
  };

  if (property.type === "enumeration" && property.options) {
    propertyData.options = property.options;
  }

  return hubspotRequest<HubSpotPropertyResponse>(
    "/crm/v3/properties/contacts",
    {
      method: "POST",
      body: JSON.stringify(propertyData),
    }
  );
}

/**
 * Crea una custom property para deals
 */
export async function createDealProperty(
  property: HubSpotProperty
): Promise<HubSpotPropertyResponse> {
  const propertyData: HubSpotPropertyCreateRequest = {
    name: property.name,
    label: property.label,
    type: property.type,
    description: property.description || "",
    groupName: property.groupName || "dealinformation",
  };

  if (property.type === "enumeration" && property.options) {
    propertyData.options = property.options;
  }

  return hubspotRequest<HubSpotPropertyResponse>(
    "/crm/v3/properties/deals",
    {
      method: "POST",
      body: JSON.stringify(propertyData),
    }
  );
}

/**
 * Obtiene todas las propiedades de contactos
 */
export async function getContactProperties(): Promise<HubSpotPropertyResponse[]> {
  const response = await hubspotRequest<{
    results: HubSpotPropertyResponse[];
  }>("/crm/v3/properties/contacts");
  return response.results || [];
}

/**
 * Obtiene todas las propiedades de deals
 */
export async function getDealProperties(): Promise<HubSpotPropertyResponse[]> {
  const response = await hubspotRequest<{
    results: HubSpotPropertyResponse[];
  }>("/crm/v3/properties/deals");
  return response.results || [];
}

/**
 * Verifica si una propiedad existe
 */
export async function propertyExists(
  objectType: "contacts" | "deals",
  propertyName: string
): Promise<boolean> {
  try {
    await hubspotRequest(`/crm/v3/properties/${objectType}/${propertyName}`);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Crea las propiedades necesarias para el sistema Elite Pro
 * Solo crea las que no existen (idempotente)
 */
export async function ensureEliteProProperties(): Promise<void> {
  const contactProperties: HubSpotProperty[] = [
    {
      name: "lead_score",
      label: "Lead Score",
      type: "number",
      description: "Puntuación del lead basada en comportamiento e interacciones",
      groupName: "contactinformation",
    },
    {
      name: "estimated_deal_value",
      label: "Estimated Deal Value",
      type: "number",
      description: "Valor estimado del deal basado en property size y servicios",
      groupName: "contactinformation",
    },
    {
      name: "property_type",
      label: "Property Type",
      type: "enumeration",
      description: "Tipo de propiedad (residencial o comercial)",
      options: [
        { label: "Residential", value: "residential" },
        { label: "Commercial", value: "commercial" },
      ],
      groupName: "contactinformation",
    },
    {
      name: "preferred_service_type",
      label: "Preferred Service Type",
      type: "string",
      description: "Tipo de servicio preferido por el contacto",
      groupName: "contactinformation",
    },
    {
      name: "service_frequency",
      label: "Service Frequency",
      type: "enumeration",
      description: "Frecuencia de servicio preferida",
      options: [
        { label: "One-time", value: "one-time" },
        { label: "Weekly", value: "weekly" },
        { label: "Bi-weekly", value: "bi-weekly" },
        { label: "Monthly", value: "monthly" },
      ],
      groupName: "contactinformation",
    },
    {
      name: "last_quote_date",
      label: "Last Quote Date",
      type: "date",
      description: "Fecha de la última cotización solicitada",
      groupName: "contactinformation",
    },
    {
      name: "quote_count",
      label: "Quote Count",
      type: "number",
      description: "Número de cotizaciones solicitadas",
      groupName: "contactinformation",
    },
    {
      name: "total_deal_value",
      label: "Total Deal Value",
      type: "number",
      description: "Valor total de todos los deals del contacto",
      groupName: "contactinformation",
    },
    {
      name: "customer_lifetime_value",
      label: "Customer Lifetime Value",
      type: "number",
      description: "Valor de vida del cliente",
      groupName: "contactinformation",
    },
  ];

  const dealProperties: HubSpotProperty[] = [
    {
      name: "property_size",
      label: "Property Size (sq ft)",
      type: "number",
      description: "Tamaño de la propiedad en pies cuadrados",
      groupName: "dealinformation",
    },
    {
      name: "bedrooms",
      label: "Bedrooms",
      type: "number",
      description: "Número de habitaciones",
      groupName: "dealinformation",
    },
    {
      name: "bathrooms",
      label: "Bathrooms",
      type: "number",
      description: "Número de baños",
      groupName: "dealinformation",
    },
    {
      name: "services_requested",
      label: "Services Requested",
      type: "string",
      description: "Servicios solicitados (comma-separated)",
      groupName: "dealinformation",
    },
  ];

  // Crear propiedades de contactos
  let contactPropertiesCreated = 0;
  let contactPropertiesSkipped = 0;
  let contactPropertiesErrors = 0;

  for (const prop of contactProperties) {
    try {
      const exists = await propertyExists("contacts", prop.name);
      if (!exists) {
        await createContactProperty(prop);
        console.log(`✅ Propiedad de contacto creada: ${prop.name}`);
        contactPropertiesCreated++;
      } else {
        console.log(`ℹ️ Propiedad de contacto ya existe: ${prop.name}`);
        contactPropertiesSkipped++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Si es error de scopes, dar mensaje más claro
      if (errorMessage.includes("MISSING_SCOPES") || errorMessage.includes("scopes")) {
        console.warn(`⚠️ Propiedad ${prop.name} no se pudo crear: Falta scope 'crm.schemas.properties.write' en la app de HubSpot`);
        console.warn(`   Para crear propiedades, necesitas agregar este scope en tu app de HubSpot`);
      } else {
        console.error(`❌ Error creando propiedad de contacto ${prop.name}:`, errorMessage);
      }
      contactPropertiesErrors++;
      // Continuar con las demás propiedades
    }
  }

  // Crear propiedades de deals
  let dealPropertiesCreated = 0;
  let dealPropertiesSkipped = 0;
  let dealPropertiesErrors = 0;

  for (const prop of dealProperties) {
    try {
      const exists = await propertyExists("deals", prop.name);
      if (!exists) {
        await createDealProperty(prop);
        console.log(`✅ Propiedad de deal creada: ${prop.name}`);
        dealPropertiesCreated++;
      } else {
        console.log(`ℹ️ Propiedad de deal ya existe: ${prop.name}`);
        dealPropertiesSkipped++;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Si es error de scopes, dar mensaje más claro
      if (errorMessage.includes("MISSING_SCOPES") || errorMessage.includes("scopes")) {
        console.warn(`⚠️ Propiedad ${prop.name} no se pudo crear: Falta scope 'crm.schemas.properties.write' en la app de HubSpot`);
        console.warn(`   Para crear propiedades, necesitas agregar este scope en tu app de HubSpot`);
      } else {
        console.error(`❌ Error creando propiedad de deal ${prop.name}:`, errorMessage);
      }
      dealPropertiesErrors++;
      // Continuar con las demás propiedades
    }
  }

  // Resumen
  console.log("\n📊 Resumen de inicialización de propiedades:");
  console.log(`   Contactos: ${contactPropertiesCreated} creadas, ${contactPropertiesSkipped} ya existían, ${contactPropertiesErrors} errores`);
  console.log(`   Deals: ${dealPropertiesCreated} creadas, ${dealPropertiesSkipped} ya existían, ${dealPropertiesErrors} errores`);

  if (contactPropertiesErrors > 0 || dealPropertiesErrors > 0) {
    console.warn("\n⚠️ Algunas propiedades no se pudieron crear debido a falta de scopes.");
    console.warn("   El sistema funcionará sin ellas, pero el enriquecimiento de datos no se guardará en HubSpot.");
    console.warn("   Para habilitar custom properties, agrega el scope 'crm.schemas.properties.write' a tu app de HubSpot.");
  }
}
