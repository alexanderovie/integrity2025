import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware para proteger rutas que requieren autenticación
 *
 * Patrón Next.js 16: Edge Runtime compatible
 * Verifica sesión de Supabase en servidor antes de servir la página
 */
export async function middleware(request: NextRequest) {
  // Redirect 301 server-side para URLs con parámetros /quote?service=... → /quote/[service]
  // Best practice 2025-2026: Server-side redirects para evitar indexación de URLs con parámetros
  if (request.nextUrl.pathname === "/quote") {
    const serviceParam = request.nextUrl.searchParams.get("service") || request.nextUrl.searchParams.get("services");

    if (serviceParam) {
      // Mapeo de slugs legacy a friendly
      const serviceSlugMap: Record<string, string> = {
        "regular-cleaning": "regular-cleaning",
        "deep-cleaning": "deep-cleaning",
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
        "commercial-cleaning": "commercial-cleaning",
        "carpet": "carpet-cleaning",
        "carpet-cleaning": "carpet-cleaning",
      };

      const normalizedSlug = serviceParam.toLowerCase().trim();
      const friendlySlug = serviceSlugMap[normalizedSlug] || normalizedSlug;

      // Construir URL friendly con parámetros adicionales si existen
      const friendlyUrl = new URL(`/quote/${friendlySlug}`, request.url);

      // Preservar parámetros adicionales (name, email, phone, zipCode) si existen
      const additionalParams = ["name", "email", "phone", "zipCode"];
      additionalParams.forEach((param) => {
        const value = request.nextUrl.searchParams.get(param);
        if (value) {
          friendlyUrl.searchParams.set(param, value);
        }
      });

      // Redirect 301 permanente (SEO best practice)
      return NextResponse.redirect(friendlyUrl, { status: 301 });
    }
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Rutas que requieren autenticación
  const protectedRoutes = ["/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Si no es una ruta protegida, continuar sin verificar
  if (!isProtectedRoute) {
    return response;
  }

  // Crear cliente de Supabase para middleware (Edge Runtime)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Verificar sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Si no hay sesión, redirigir a sign-in
  if (!session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Si hay sesión, continuar
  return response;
}

/**
 * Configuración de matcher para optimizar performance
 * Solo ejecuta middleware en rutas específicas
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
