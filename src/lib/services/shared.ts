import "server-only";

import { logFallbackEvent } from "@/lib/observability/fallback-log";

export const SERVICES_QUERY_TIMEOUT_MS = 4000;

export const withServicesTimeout = async <T,>(
  promise: Promise<T>,
  timeoutMs = SERVICES_QUERY_TIMEOUT_MS,
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Query timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

export const logServicesFallback = (area: string, source: string, error: unknown): void => {
  logFallbackEvent({
    area,
    source,
    reason: "services_db_fallback",
    detail: error,
  });
};
