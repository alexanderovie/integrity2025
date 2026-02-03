import { NextRequest, NextResponse } from "next/server";
import { queryOne, getNeonPool } from "@/lib/db/neon";

const CACHE_CONTROL_HEADER = "s-maxage=60, stale-while-revalidate=300";

const resolveSubdomainFromHost = (host?: string | null): string | null => {
  if (!host) {
    return null;
  }

  const normalizedHost = host.split(":")[0]; // remove port
  const segments = normalizedHost.split(".");
  if (segments.length < 3) {
    return null;
  }

  if (segments[0].toLowerCase() === "www") {
    return segments[1] || null;
  }

  return segments[0];
};

const resolveTenantId = async (request: NextRequest): Promise<string | null> => {
  const headerTenant = request.headers.get("x-tenant-id");
  if (headerTenant) {
    return headerTenant;
  }

  const host = request.headers.get("host");
  const subdomain = resolveSubdomainFromHost(host);
  if (!subdomain) {
    return null;
  }

  const tenant = await queryOne<{ id: string }>(
    `SELECT id FROM tenants WHERE subdomain = $1`,
    [subdomain]
  );

  return tenant?.id ?? null;
};

const setTenantContext = async (tenantId: string): Promise<void> => {
  const pool = getNeonPool();
  await pool.query(`SELECT set_config('app.current_tenant', $1, true)`, [tenantId]);
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const tenantId = await resolveTenantId(request);
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant no identificado" },
        { status: 400 },
      );
    }

    await setTenantContext(tenantId);

    const result = await queryOne<{ pricing_catalog: string }>(
      `SELECT pricing_catalog() AS pricing_catalog`
    );

    if (!result?.pricing_catalog) {
      return NextResponse.json(
        { error: "Catálogo vacío" },
        { status: 404 },
      );
    }

    const pricingCatalog = typeof result.pricing_catalog === 'string'
      ? JSON.parse(result.pricing_catalog)
      : result.pricing_catalog;

    return NextResponse.json(pricingCatalog, {
      headers: {
        "Cache-Control": CACHE_CONTROL_HEADER,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("GET /api/pricing failed:", errorMessage);
    return NextResponse.json(
      { error: "Error interno al cargar precios" },
      { status: 500 },
    );
  }
}
