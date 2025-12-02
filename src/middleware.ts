import { NextRequest, NextResponse } from "next/server";

/**
 * Rate limiting simple usando Map en memoria
 * En producción, considera usar Redis o Upstash para distribución
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/newsletter": { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests/minuto
  "/api/hubspot/contacts": { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests/minuto
  "/api/checkout": { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests/minuto
  "/api/meta/pixel": { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests/minuto (más permisivo para tracking)
};

/**
 * Limpia entradas expiradas del mapa de rate limiting
 */
function cleanExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Verifica si una IP ha excedido el límite de rate limiting
 */
function checkRateLimit(ip: string, path: string): { allowed: boolean; resetTime?: number } {
  const config = RATE_LIMITS[path];
  if (!config) {
    return { allowed: true }; // Sin límite para esta ruta
  }

  cleanExpiredEntries();

  const key = `${ip}:${path}`;
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || record.resetTime < now) {
    // Nueva ventana de tiempo
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true };
  }

  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      resetTime: record.resetTime,
    };
  }

  // Incrementar contador
  record.count++;
  return { allowed: true };
}

/**
 * Obtiene la IP real del cliente
 *
 * En Next.js 15.5.6, NextRequest no expone la propiedad 'ip' directamente.
 * La IP debe obtenerse de los headers HTTP estándar.
 *
 * Orden de prioridad:
 * 1. x-forwarded-for (primera IP en la cadena)
 * 2. x-real-ip
 * 3. "unknown" como fallback
 */
function getClientIp(request: NextRequest): string {
  // x-forwarded-for puede contener múltiples IPs separadas por comas
  // La primera es generalmente la IP original del cliente
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  // x-real-ip es usado por algunos proxies (nginx, etc.)
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // Fallback: no podemos determinar la IP
  return "unknown";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aplicar rate limiting solo a rutas API específicas configuradas
  const matchedPath = Object.keys(RATE_LIMITS).find((path) =>
    pathname.startsWith(path)
  );

  if (matchedPath) {
    const clientIp = getClientIp(request);
    const rateLimit = checkRateLimit(clientIp, matchedPath);

    if (!rateLimit.allowed) {
      const resetTime = rateLimit.resetTime
        ? new Date(rateLimit.resetTime).toISOString()
        : undefined;

      return NextResponse.json(
        {
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
          resetTime,
        },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Limit": RATE_LIMITS[pathname]?.maxRequests.toString() || "0",
            ...(resetTime && { "X-RateLimit-Reset": resetTime }),
          },
        }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/newsletter/:path*",
    "/api/hubspot/contacts/:path*",
    "/api/checkout/:path*",
    "/api/meta/pixel/:path*",
  ],
};
