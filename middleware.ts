import { NextResponse, type NextRequest } from "next/server";

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

    if (!resolved || !validSlugs.has(resolved)) {
      return NextResponse.redirect(new URL("/quote/regular-cleaning", request.url), { status: 307 });
    }
  }

  // Redirect 301 server-side para URLs con parámetros /quote?service=...
  if (request.nextUrl.pathname === "/quote") {
    const serviceParam = request.nextUrl.searchParams.get("service") || request.nextUrl.searchParams.get("services");

    if (serviceParam) {
      const normalizedSlug = serviceParam.toLowerCase().trim();
      const resolvedSlug = legacyMap[normalizedSlug] || normalizedSlug;

      if (!resolvedSlug || !validSlugs.has(resolvedSlug)) {
        return NextResponse.redirect(new URL("/quote/regular-cleaning", request.url), { status: 307 });
      }

      const friendlyUrl = new URL(`/quote/${resolvedSlug}`, request.url);

      const additionalParams = ["name", "email", "phone", "zipCode"];
      additionalParams.forEach((param) => {
        const value = request.nextUrl.searchParams.get(param);
        if (value) {
          friendlyUrl.searchParams.set(param, value);
        }
      });

      return NextResponse.redirect(friendlyUrl, { status: 301 });
    }
  }

  // TODO: Proteger rutas /profile cuando implementemos autenticación
  // Por ahora, permitir acceso sin auth

  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
