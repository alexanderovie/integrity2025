import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityMiddleware } from "@/lib/security";

// Configuración del matcher para aplicar middleware solo a rutas API
export const config = {
  matcher: [
    "/api/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  console.log(`[MIDDLEWARE] Request: ${request.method} ${request.nextUrl.pathname}`);
  console.log(`[MIDDLEWARE] User-Agent: ${request.headers.get("user-agent")}`);
  
  try {
    // Aplicar middleware de seguridad
    const response = await securityMiddleware(request);
    console.log(`[MIDDLEWARE] Response status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`[MIDDLEWARE] Error:`, error);
    // Si hay error en el middleware, permitir el request (graceful degradation)
    return NextResponse.next();
  }
}
