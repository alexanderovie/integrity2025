import "server-only";

import crypto from "crypto";

export type InternalAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; message: string };

function getConfiguredSecret(): string | null {
  return process.env.INTERNAL_API_SECRET || process.env.REVALIDATE_SECRET || null;
}

function timingSafeEqualString(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyInternalRequest(request: Request): InternalAuthResult {
  const configuredSecret = getConfiguredSecret();

  if (!configuredSecret) {
    return {
      ok: false,
      status: 503,
      message: "Internal API secret is not configured.",
    };
  }

  const authorization = request.headers.get("authorization") || "";
  const bearerToken = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const headerToken = request.headers.get("x-internal-secret") || "";
  const providedSecret = bearerToken || headerToken;

  if (!providedSecret || !timingSafeEqualString(providedSecret, configuredSecret)) {
    return {
      ok: false,
      status: 401,
      message: "Unauthorized.",
    };
  }

  return { ok: true };
}
