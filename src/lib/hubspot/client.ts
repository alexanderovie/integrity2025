/**
 * Cliente HubSpot para interactuar con la API
 * Usa el access token de la app instalada
 * Incluye retry automático con exponential backoff
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

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatuses?: number[];
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 segundo inicial
  retryableStatuses: [429, 500, 502, 503, 504], // Rate limits y errores de servidor
};

/**
 * Espera un tiempo determinado (para retry delays)
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Realiza una petición a la API de HubSpot con manejo de errores, rate limits y retry automático
 */
async function hubspotRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  if (!HUBSPOT_ACCESS_TOKEN) {
    throw new Error("HUBSPOT_ACCESS_TOKEN no está configurado");
  }

  const retryConfig = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  const url = `${HUBSPOT_API_BASE}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  let lastError: Error | null = null;

  // Intentar hasta maxRetries veces
  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      // Manejo de rate limits (429) - siempre retry
      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        const waitTime = retryAfter
          ? (parseInt(retryAfter) + 1) * 1000
          : retryConfig.retryDelay * Math.pow(2, attempt);

        if (attempt < retryConfig.maxRetries) {
          console.warn(
            `⚠️ Rate limit alcanzado (intento ${attempt + 1}/${retryConfig.maxRetries + 1}). Esperando ${waitTime}ms...`
          );
          await sleep(waitTime);
          continue; // Reintentar
        } else {
          throw new Error(
            `Rate limit alcanzado después de ${retryConfig.maxRetries + 1} intentos.`
          );
        }
      }

      // Manejo de errores de servidor (500, 502, 503, 504) - retry si está configurado
      if (
        !response.ok &&
        retryConfig.retryableStatuses.includes(response.status) &&
        attempt < retryConfig.maxRetries
      ) {
        const waitTime = retryConfig.retryDelay * Math.pow(2, attempt);
        console.warn(
          `⚠️ Error ${response.status} (intento ${attempt + 1}/${retryConfig.maxRetries + 1}). Reintentando en ${waitTime}ms...`
        );
        await sleep(waitTime);
        continue; // Reintentar
      }

      // Manejo de otros errores (no retry)
      if (!response.ok) {
        const error = data as HubSpotError;
        console.error("❌ Error de HubSpot:", error);
        throw new Error(error.message || `Error ${response.status}`);
      }

      // Log de rate limits (para monitoreo)
      const rateLimitHeaders = response.headers as unknown as RateLimitHeaders;
      if (rateLimitHeaders["X-HubSpot-RateLimit-Daily-Remaining"]) {
        const remaining =
          rateLimitHeaders["X-HubSpot-RateLimit-Daily-Remaining"];
        if (parseInt(remaining) < 1000) {
          console.warn(
            `⚠️ Quedan ${remaining} requests diarias en HubSpot`
          );
        }
      }

      return data as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Si es un error de red y aún tenemos intentos, retry
      if (
        error instanceof TypeError &&
        error.message.includes("fetch") &&
        attempt < retryConfig.maxRetries
      ) {
        const waitTime = retryConfig.retryDelay * Math.pow(2, attempt);
        console.warn(
          `⚠️ Error de red (intento ${attempt + 1}/${retryConfig.maxRetries + 1}). Reintentando en ${waitTime}ms...`
        );
        await sleep(waitTime);
        continue; // Reintentar
      }

      // Si no es retryable o se agotaron los intentos, lanzar error
      if (attempt === retryConfig.maxRetries) {
        throw lastError;
      }
    }
  }

  // Fallback (no debería llegar aquí)
  throw lastError || new Error("Error desconocido al conectar con HubSpot");
}

export { hubspotRequest, HUBSPOT_ACCESS_TOKEN, type RetryOptions };
