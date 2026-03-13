import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Inicializar Redis y Rate Limiter (singleton para hot reloading)
const redis = Redis.fromEnv();

// Rate limiter estricto para endpoints críticos (5 requests por minuto)
const strictRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-strict",
});

// Rate limiter estándar para formularios (10 requests por minuto)
const standardRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-standard",
});

// Rate limiter permisivo para lectura (100 requests por minuto)
const permissiveRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit-permissive",
});

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
  /slurp/i, // Yahoo
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
  if (!userAgent) return true; // Bloquear si no hay user-agent
  
  // Permitir bots legítimos de motores de búsqueda
  if (ALLOWED_BOTS.some(bot => bot.test(userAgent))) {
    return false;
  }
  
  // Bloquear bots maliciosos
  return BLOCKED_USER_AGENTS.some(bot => bot.test(userAgent));
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
function getRatelimitForPath(path: string): Ratelimit {
  // Endpoints críticos de pago
  if (path.includes("/api/checkout") || path.includes("/api/webhooks/stripe")) {
    return strictRatelimit;
  }
  
  // Endpoints de formularios (contact, newsletter, etc)
  if (
    path.includes("/api/contact") ||
    path.includes("/api/newsletter") ||
    path.includes("/api/help") ||
    path.includes("/api/join-our-team")
  ) {
    return standardRatelimit;
  }
  
  // Todo lo demás
  return permissiveRatelimit;
}

/**
 * Middleware principal de seguridad
 * Aplica rate limiting, validación de user-agent, content-type
 */
export async function securityMiddleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = getIP(request);
  const userAgent = request.headers.get("user-agent");
  
  // 1. Validar User-Agent (bloquear bots)
  if (isBlockedUserAgent(userAgent)) {
    console.warn(`[SECURITY] Blocked request from bot: ${ip}, UA: ${userAgent}`);
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
    const ratelimit = getRatelimitForPath(path);
    const { success, limit, remaining, reset } = await ratelimit.limit(
      `${ip}:${path}`
    );
    
    if (!success) {
      console.warn(`[SECURITY] Rate limit exceeded for: ${ip}, path: ${path}`);
      
      const response = NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        },
        { status: 429 }
      );
      
      response.headers.set("X-RateLimit-Limit", limit.toString());
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set("X-RateLimit-Reset", reset.toString());
      response.headers.set("Retry-After", Math.ceil((reset - Date.now()) / 1000).toString());
      
      return response;
    }
    
    // Agregar headers de rate limit a la respuesta
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    
    return response;
  }
  
  return NextResponse.next();
}

/**
 * Wrapper para API routes que aplica validaciones adicionales
 */
export function withSecurity(handler: Function) {
  return async (request: NextRequest, context?: any) => {
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
    
    try {
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
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, "");
  // Debe tener 10 dígitos
  return cleaned.length === 10;
}

/**
 * Detecta si el input contiene SQL injection
 */
export function containsSQLInjection(input: string): boolean {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|--|;|\*|'|"|\)|\()\b)/i;
  return sqlPattern.test(input);
}

/**
 * Detecta si el input contiene intento de header injection
 */
export function containsHeaderInjection(input: string): boolean {
  return /[\r\n]/.test(input);
}
