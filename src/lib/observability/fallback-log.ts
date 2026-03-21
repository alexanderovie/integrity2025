import "server-only";

type FallbackLogInput = {
  area: string;
  source: string;
  reason: string;
  detail?: unknown;
};

export function logFallbackEvent({ area, source, reason, detail }: FallbackLogInput): void {
  console.error(
    JSON.stringify({
      level: "error",
      event: "fallback_activated",
      area,
      source,
      reason,
      detail: detail instanceof Error ? detail.message : detail,
      timestamp: new Date().toISOString(),
    }),
  );
}
