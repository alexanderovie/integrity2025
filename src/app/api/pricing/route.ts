import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleClient } from "@/lib/db/supabase-admin";

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

const resolveTenantId = async (request: NextRequest, supabase: SupabaseClient): Promise<string | null> => {
  const headerTenant = request.headers.get("x-tenant-id");
  if (headerTenant) {
    return headerTenant;
  }

  const host = request.headers.get("host");
  const subdomain = resolveSubdomainFromHost(host);
  if (!subdomain) {
    return null;
  }

  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("subdomain", subdomain)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
};

const setTenantContext = async (supabase: SupabaseClient, tenantId: string): Promise<void> => {
  const { error } = await supabase.rpc("set_app_current_tenant", { tenant_uuid: tenantId });
  if (error) {
    throw error;
  }
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = getSupabaseServiceRoleClient();

  try {
    const tenantId = await resolveTenantId(request, supabase);
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant no identificado" },
        { status: 400 },
      );
    }

    await setTenantContext(supabase, tenantId);

    const { data, error } = await supabase.rpc("pricing_catalog");
    if (error) {
      console.error("pricing_catalog RPC failed:", error.message);
      return NextResponse.json(
        { error: "No se pudo cargar el catálogo" },
        { status: 502 },
      );
    }

    if (!data?.[0]?.pricing_catalog) {
      return NextResponse.json(
        { error: "Catálogo vacío" },
        { status: 404 },
      );
    }

    return NextResponse.json(data[0].pricing_catalog, {
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
