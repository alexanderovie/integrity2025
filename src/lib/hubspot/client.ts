/**
 * Cliente HubSpot para interactuar con la API
 * Usa el access token de la app instalada
 */

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = "https://api.hubapi.com";

if (!HUBSPOT_ACCESS_TOKEN) {
  console.warn("⚠️ HUBSPOT_ACCESS_TOKEN no está configurado");
}

interface HubSpotError {
  status: string;
  message: string;
  errorType?: string;
  correlationId?: string;
}

interface RateLimitHeaders {
  "X-HubSpot-RateLimit-Daily-Remaining"?: string;
  "X-HubSpot-RateLimit-Remaining"?: string;
}

/**
 * Realiza una petición a la API de HubSpot con manejo de errores y rate limits
 */
async function hubspotRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    throw new Error("HUBSPOT_ACCESS_TOKEN no está configurado");
  }

  const url = `${HUBSPOT_API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    // Manejo de rate limits (429)
    if (response.status === 429) {
      const error = data as HubSpotError;
      const retryAfter = response.headers.get("Retry-After") || "10";
      console.error("⚠️ Rate limit alcanzado:", error.message);
      throw new Error(
        `Rate limit alcanzado. Intenta de nuevo en ${retryAfter} segundos.`
      );
    }

    // Manejo de otros errores
    if (!response.ok) {
      const error = data as HubSpotError;
      console.error("❌ Error de HubSpot:", error);
      throw new Error(error.message || `Error ${response.status}`);
    }

    // Log de rate limits (para monitoreo)
    const rateLimitHeaders = response.headers as unknown as RateLimitHeaders;
    if (rateLimitHeaders["X-HubSpot-RateLimit-Daily-Remaining"]) {
      const remaining = rateLimitHeaders["X-HubSpot-RateLimit-Daily-Remaining"];
      if (parseInt(remaining) < 1000) {
        console.warn(
          `⚠️ Quedan ${remaining} requests diarias en HubSpot`
        );
      }
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error desconocido al conectar con HubSpot");
  }
}

export { hubspotRequest, HUBSPOT_ACCESS_TOKEN };
