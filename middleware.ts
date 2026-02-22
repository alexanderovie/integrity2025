import { NextResponse, type NextRequest } from "next/server";

const CSP_MODE = process.env.CSP_MODE === "enforce" ? "enforce" : "report-only";
const CSP_REPORT_URI = process.env.CSP_REPORT_URI?.trim();

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.facebook.com https://www.google-analytics.com",
  "font-src 'self' data:",
  "connect-src 'self' https://api.hubapi.com https://graph.facebook.com https://www.google-analytics.com",
  "frame-src https://js.stripe.com",
  ...(CSP_REPORT_URI ? [`report-uri ${CSP_REPORT_URI}`] : []),
].join("; ");

const applySecurityHeaders = (response: NextResponse): NextResponse => {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  if (CSP_MODE === "enforce") {
    response.headers.set("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    response.headers.delete("Content-Security-Policy-Report-Only");
  } else {
    response.headers.set("Content-Security-Policy-Report-Only", CONTENT_SECURITY_POLICY);
    response.headers.delete("Content-Security-Policy");
  }

  return response;
};

/**
 * Middleware temporal sin Supabase
 * TODO: Migrar a JWT/Neon para autenticación
 */
export async function middleware(request: NextRequest) {
  const validSlugs = new Set([
    "regular-cleaning",
    "deep-cleaning",
    "move-in-out-cleaning",
    "post-construction-cleaning",
    "carpet-cleaning",
    "commercial-cleaning",
    "airbnb-cleaning",
  ]);

  const legacyMap: Record<string, string> = {
    "move-in-out": "move-in-out-cleaning",
    "move-in-clean": "move-in-out-cleaning",
    "move-out-clean": "move-in-out-cleaning",
    "movein-moveout": "move-in-out-cleaning",
    "post-construction": "post-construction-cleaning",
    "removal-storage": "post-construction-cleaning",
    "eco-friendly": "carpet-cleaning",
    "eco-friendly-cleaning": "carpet-cleaning",
    "post-renovation": "post-construction-cleaning",
    "post-renovation-cleaning": "post-construction-cleaning",
    "commercial": "commercial-cleaning",
    "carpet": "carpet-cleaning",
    "airbnb": "airbnb-cleaning",
    "vacation-rental": "airbnb-cleaning",
    "vrbo": "airbnb-cleaning",
  };

  // Guardrail for invalid /quote/:slug routes
  if (request.nextUrl.pathname.startsWith("/quote/")) {
    const slug = request.nextUrl.pathname.split("/")[2] || "";
    const normalized = slug.toLowerCase().trim();

    const resolved = legacyMap[normalized] || normalized;

    if (legacyMap[normalized] && validSlugs.has(resolved)) {
      return applySecurityHeaders(
        NextResponse.redirect(new URL(`/quote/${resolved}`, request.url), { status: 301 }),
      );
    }
  }

  // Redirect 301 server-side para URLs con parámetros /quote?service=...
  if (request.nextUrl.pathname === "/quote") {
    const serviceParam = request.nextUrl.searchParams.get("service") || request.nextUrl.searchParams.get("services");

    if (serviceParam) {
      const normalizedSlug = serviceParam.toLowerCase().trim();
      const resolvedSlug = legacyMap[normalizedSlug] || normalizedSlug;

      if (!resolvedSlug || !validSlugs.has(resolvedSlug)) {
        return applySecurityHeaders(
          NextResponse.redirect(new URL("/quote", request.url), { status: 307 }),
        );
      }

      const friendlyUrl = new URL(`/quote/${resolvedSlug}`, request.url);

      const additionalParams = ["name", "email", "phone", "zipCode"];
      additionalParams.forEach((param) => {
        const value = request.nextUrl.searchParams.get(param);
        if (value) {
          friendlyUrl.searchParams.set(param, value);
        }
      });

      return applySecurityHeaders(NextResponse.redirect(friendlyUrl, { status: 301 }));
    }
  }

  // TODO: Proteger rutas /profile cuando implementemos autenticación
  // Por ahora, permitir acceso sin auth

  return applySecurityHeaders(
    NextResponse.next({
      request: {
        headers: request.headers,
      },
    }),
  );
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
