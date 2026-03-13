import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * API Route para revalidación manual de cache
 * 
 * Uso (desde CLI o webhook):
 * curl -X POST "https://integritycleansolutions.com/api/revalidate" \
 *   -H "Authorization: Bearer $REVALIDATE_SECRET" \
 *   -H "Content-Type: application/json" \
 *   -d '{"path": "/blog"}'
 * 
 * O con tags:
 * curl -X POST "https://integritycleansolutions.com/api/revalidate" \
 *   -H "Authorization: Bearer $REVALIDATE_SECRET" \
 *   -H "Content-Type: application/json" \
 *   -d '{"tag": "posts"}'
 */

export async function POST(request: NextRequest) {
  try {
    // Validar autenticación
    const authHeader = request.headers.get("authorization");
    const secret = process.env.REVALIDATE_SECRET;
    
    if (!secret) {
      return NextResponse.json(
        { error: "REVALIDATE_SECRET not configured" },
        { status: 500 }
      );
    }
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    
    if (token !== secret) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }
    
    // Parsear body
    const body = await request.json();
    const { path, tag } = body;
    
    if (!path && !tag) {
      return NextResponse.json(
        { error: "Must provide 'path' or 'tag'" },
        { status: 400 }
      );
    }
    
    // Revalidar por path
    if (path) {
      revalidatePath(path);
      console.log(`✅ Revalidated path: ${path}`);
      
      // Si es /blog, también revalidar la página individual
      if (path === "/blog") {
        revalidatePath("/blog/[slug]");
      }
      
      return NextResponse.json({
        revalidated: true,
        path,
        timestamp: new Date().toISOString(),
      });
    }
    
    // Revalidar por tag
    if (tag) {
      revalidateTag(tag, 'page');
      console.log(`✅ Revalidated tag: ${tag}`);
      
      return NextResponse.json({
        revalidated: true,
        tag,
        timestamp: new Date().toISOString(),
      });
    }
    
  } catch (error) {
    console.error("Revalidation error:", error);
    return NextResponse.json(
      { error: "Error revalidating", message: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Revalidation endpoint is active. Use POST with Bearer token.",
    documentation: "https://nextjs.org/docs/app/api-reference/functions/revalidatePath",
  });
}
