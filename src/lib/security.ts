import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================================================
// ENTERPRISE PATTERN: Graceful Degradation
// Si Redis falla, el sistema sigue funcionando sin rate limiting
// NUNCA bloqueamos requests por errores de infraestructura
// ============================================================================

interface RateLimiterConfig {
  limiter: Ratelimit | null;
  enabled: boolean;
}

// Inicializar Redis y Rate Limiters con manejo de errores robusto
let redis: Redis | null = null;
const ratelimiters: {
  strict: RateLimiterConfig;
  standard: RateLimiterConfig;
  permissive: RateLimiterConfig;
} = {
  strict: { limiter: null, enabled: false },
  standard: { limiter: null, enabled: false },
  permissive: { limiter: null, enabled: false },
};

// Intentar inicializar Redis (pero no bloquear si falla)
function initializeRedis(): void {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

    if (!redisUrl || !redisToken) {
      console.warn(
        "[SECURITY] Redis credentials not found, rate limiting disabled"
      );
      return;
    }

    // Validar que la URL es válida
    if (!redisUrl.startsWith("https://")) {
      console.error("[SECURITY] Invalid Redis URL format");
      return;
    }

    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

    // Rate limiter estricto para endpoints críticos (5 requests por minuto)
    ratelimiters.strict = {
      limiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit-strict",
      }),
      enabled: true,
    };

    // Rate limiter estándar para formularios (10 requests por minuto)
    ratelimiters.standard = {
      limiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit-standard",
      }),
      enabled: true,
    };

    // Rate limiter permisivo para lectura (100 requests por minuto)
    ratelimiters.permissive = {
      limiter: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, "1 m"),
        analytics: true,
        prefix: "@upstash/ratelimit-permissive",
      }),
      enabled: true,
    };

    console.log("[SECURITY] Redis rate limiting initialized successfully");
  } catch (error) {
    console.error("[SECURITY] Failed to initialize Redis:", error);
    // Graceful degradation: continuamos sin rate limiting
  }
}

// Inicializar al cargar el módulo
initializeRedis();

// Lista de bots conocidos
const BLOCKED_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /node-fetch/i,
  /axios/i,
  /postman/i,
];

// Lista de bots permitidos (Google, Bing, etc)
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /slurp/i,
  /duckduckbot/i,
  /baiduspider/i,
];

/**
 * Extrae IP del request (considera proxies)
 */
function getIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "127.0.0.1";
}

/**
 * Valida si el User-Agent está bloqueado
 */
function isBlockedUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return true;

  // Permitir bots legítimos de motores de búsqueda
  if (ALLOWED_BOTS.some((bot) => bot.test(userAgent))) {
    return false;
  }

  // Bloquear bots maliciosos
  return BLOCKED_USER_AGENTS.some((bot) => bot.test(userAgent));
}

/**
 * Valida Content-Type para requests POST/PUT/PATCH
 */
function validateContentType(request: NextRequest): boolean {
  const method = request.method;

  if (["POST", "PUT", "PATCH"].includes(method)) {
    const contentType = request.headers.get("content-type");

    // Requerir Content-Type: application/json para APIs
    if (request.nextUrl.pathname.startsWith("/api/")) {
      if (!contentType?.includes("application/json")) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Obtiene el rate limiter apropiado según el endpoint
 */
function getRatelimitForPath(path: string): RateLimiterConfig {
  if (path.includes("/api/webhooks/stripe")) {
    return { limiter: null, enabled: false };
  }

  if (path.includes("/api/checkout")) {
    return ratelimiters.strict;
  }

  if (
    path.includes("/api/contact") ||
    path.includes("/api/newsletter") ||
    path.includes("/api/help") ||
    path.includes("/api/join-our-team")
  ) {
    return ratelimiters.standard;
  }

  return ratelimiters.permissive;
}

/**
 * Middleware principal de seguridad
 * Aplica rate limiting, validación de user-agent, content-type
 * ENTERPRISE: Nunca bloquea por errores de infraestructura
 */
export async function securityMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const path = request.nextUrl.pathname;
    const ip = getIP(request);
    const userAgent = request.headers.get("user-agent");

    // 1. Validar User-Agent (bloquear bots)
    if (isBlockedUserAgent(userAgent)) {
      console.warn(
        `[SECURITY] Blocked request from bot: ${ip}, UA: ${userAgent}`
      );
      return NextResponse.json(
        { error: "Access denied. Please use a standard web browser." },
        { status: 403 }
      );
    }

    // 2. Validar Content-Type
    if (!validateContentType(request)) {
      console.warn(`[SECURITY] Invalid content-type from: ${ip}`);
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected application/json" },
        { status: 400 }
      );
    }

    // 3. Aplicar Rate Limiting (solo para rutas API)
    if (path.startsWith("/api/")) {
      const rateLimiterConfig = getRatelimitForPath(path);

      // ENTERPRISE: Si el rate limiter no está disponible, continuamos
      if (!rateLimiterConfig.enabled || !rateLimiterConfig.limiter) {
        console.warn(`[SECURITY] Rate limiting disabled for: ${path}`);
        return NextResponse.next();
      }

      try {
        const { success, limit, remaining, reset } =
          await rateLimiterConfig.limiter.limit(`${ip}:${path}`);

        if (!success) {
          console.warn(
            `[SECURITY] Rate limit exceeded for: ${ip}, path: ${path}`
          );

          const response = NextResponse.json(
            {
              error: "Too many requests. Please try again later.",
              retryAfter: Math.ceil((reset - Date.now()) / 1000),
            },
            { status: 429 }
          );

          response.headers.set("X-RateLimit-Limit", limit.toString());
          response.headers.set("X-RateLimit-Remaining", "0");
          response.headers.set("X-RateLimit-Reset", reset.toString());
          response.headers.set(
            "Retry-After",
            Math.ceil((reset - Date.now()) / 1000).toString()
          );

          return response;
        }

        // Agregar headers de rate limit a la respuesta
        const response = NextResponse.next();
        response.headers.set("X-RateLimit-Limit", limit.toString());
        response.headers.set("X-RateLimit-Remaining", remaining.toString());
        response.headers.set("X-RateLimit-Reset", reset.toString());

        return response;
      } catch (rateLimitError) {
        // ENTERPRISE: Si el rate limiting falla, no bloqueamos el request
        console.error("[SECURITY] Rate limiting error:", rateLimitError);
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    // ENTERPRISE: Cualquier error en el middleware no bloquea el request
    console.error("[SECURITY] Middleware error:", error);
    return NextResponse.next();
  }
}

/**
 * Wrapper para API routes que aplica validaciones adicionales
 * ENTERPRISE: Nunca bloquea por errores de infraestructura
 */
export function withSecurity(
  handler: (request: NextRequest, context?: unknown) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context?: unknown
  ): Promise<NextResponse> => {
    try {
      // Validar tamaño del payload
      const contentLength = request.headers.get("content-length");
      if (contentLength) {
        const size = parseInt(contentLength, 10);
        const MAX_SIZE = 1024 * 1024; // 1MB

        if (size > MAX_SIZE) {
          return NextResponse.json(
            { error: "Payload too large. Maximum size is 1MB." },
            { status: 413 }
          );
        }
      }

      return await handler(request, context);
    } catch (error) {
      console.error("[SECURITY] Error in handler:", error);

      // No exponer detalles del error al cliente
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * Sanitiza input para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de teléfono (USA)
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10;
}

/**
 * Detecta si el input contiene SQL injection
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPattern =
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|--|;|\*|'|"|\)|\()\b)/i;
  return sqlPattern.test(input);
}

/**
 * Detecta si el input contiene intento de header injection
 */
export function containsHeaderInjection(input: string): boolean {
  return /[\r\n]/.test(input);
}
