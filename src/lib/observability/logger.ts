import "server-only";

import { randomUUID } from "crypto";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogInput = {
  level: LogLevel;
  event: string;
  requestId?: string | null;
  traceId?: string | null;
  route?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  leadSubmissionId?: string | null;
  integrationEventId?: string | null;
  provider?: string;
  operation?: string;
  providerEventId?: string | null;
  providerObjectId?: string | null;
  error?: unknown;
  metadata?: Record<string, unknown>;
};

type ErrorLike = Error & {
  code?: string;
  status?: number;
  statusCode?: number;
};

export function getRequestId(request: Request): string {
  return (
    request.headers.get("x-request-id") ||
    request.headers.get("x-vercel-id") ||
    randomUUID()
  );
}

function sanitizeError(error: unknown): Record<string, unknown> | undefined {
  if (!error) return undefined;

  if (error instanceof Error) {
    const errorLike = error as ErrorLike;
    return {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: errorLike.code,
      errorStatus: errorLike.status ?? errorLike.statusCode,
    };
  }

  return {
    errorMessage: String(error),
  };
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function logEvent(input: LogInput): void {
  const payload = {
    timestamp: new Date().toISOString(),
    level: input.level,
    event: input.event,
    requestId: input.requestId,
    traceId: input.traceId,
    route: input.route,
    method: input.method,
    statusCode: input.statusCode,
    durationMs: input.durationMs,
    leadSubmissionId: input.leadSubmissionId,
    integrationEventId: input.integrationEventId,
    provider: input.provider,
    operation: input.operation,
    providerEventId: input.providerEventId,
    providerObjectId: input.providerObjectId,
    ...sanitizeError(input.error),
    metadata: input.metadata,
  };

  const line = JSON.stringify(payload);

  if (input.level === "error") {
    console.error(line);
    return;
  }

  if (input.level === "warn") {
    console.warn(line);
    return;
  }

  if (input.level === "debug") {
    console.debug(line);
    return;
  }

  console.info(line);
}
