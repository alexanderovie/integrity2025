import { NextRequest, NextResponse } from "next/server";

import { verifyInternalRequest } from "@/lib/security/internal-api";
import {
  listStaleCheckoutSessions,
  reconcileStaleCheckoutSessions,
} from "@/lib/stripe/checkout-reconciliation";

export const runtime = "nodejs";

type ReconciliationRequestBody = {
  dryRun?: unknown;
  limit?: unknown;
};

function toPositiveInteger(value: unknown, fallback: number, max: number): number {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(Math.floor(parsed), max);
}

async function parseBody(request: NextRequest): Promise<ReconciliationRequestBody> {
  try {
    return (await request.json()) as ReconciliationRequestBody;
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const auth = verifyInternalRequest(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const body = await parseBody(request);
  const limit = toPositiveInteger(body.limit, 10, 50);
  const dryRun = body.dryRun === true;

  if (dryRun) {
    const candidates = await listStaleCheckoutSessions(limit);
    return NextResponse.json({
      ok: true,
      dryRun: true,
      count: candidates.length,
      candidates,
    });
  }

  const results = await reconcileStaleCheckoutSessions({ limit });

  return NextResponse.json({
    ok: true,
    dryRun: false,
    updated: results.filter((result) => result.updated).length,
    paid: results.filter((result) => result.appStatus === "paid").length,
    expired: results.filter((result) => result.appStatus === "expired").length,
    unchanged: results.filter((result) => result.appStatus === "unchanged").length,
    results,
  });
}
