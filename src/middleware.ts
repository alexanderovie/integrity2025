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
  // Aplicar middleware de seguridad
  return securityMiddleware(request);
}
