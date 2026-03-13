import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityMiddleware } from "@/lib/security";

// Configuración del matcher para aplicar middleware solo a rutas API
export const config = {
  matcher: [
    "/api/:path*",
  ],
};

export async function proxy(request: NextRequest) {
  console.log(`[PROXY] Request: ${request.method} ${request.nextUrl.pathname}`);
  console.log(`[PROXY] User-Agent: ${request.headers.get("user-agent")}`);

  try {
    // Aplicar middleware de seguridad
    const response = await securityMiddleware(request);
    console.log(`[PROXY] Response status: ${response.status}`);
    return response;
  } catch (error) {
    console.error(`[PROXY] Error:`, error);
    // Si hay error en el proxy, permitir el request (graceful degradation)
    return NextResponse.next();
  }
}
