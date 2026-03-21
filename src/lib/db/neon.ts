import "server-only";

import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

const SLOW_QUERY_THRESHOLD_MS = 1000;

type QueryOptions = {
  name?: string;
  context?: string;
};

type DatabaseErrorLike = Error & {
  code?: string;
  name?: string;
};

const logDatabaseEvent = ({
  level,
  event,
  queryName,
  context,
  durationMs,
  rowCount,
  error,
}: {
  level: "info" | "error";
  event: "db_query_slow" | "db_query_failed";
  queryName: string;
  context?: string;
  durationMs: number;
  rowCount?: number;
  error?: unknown;
}): void => {
  const payload = {
    level,
    event,
    queryName,
    context,
    durationMs,
      rowCount,
      error: error instanceof Error ? error.message : error,
      errorCode:
        error && typeof error === "object" && "code" in error
          ? (error as DatabaseErrorLike).code
          : undefined,
      errorName:
        error && typeof error === "object" && "name" in error
          ? (error as DatabaseErrorLike).name
          : undefined,
      timestamp: new Date().toISOString(),
  };

  if (level === "error") {
    console.error(JSON.stringify(payload));
    return;
  }

  console.info(JSON.stringify(payload));
};

async function timedPoolQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
  options?: QueryOptions,
): Promise<QueryResult<T>> {
  const pool = getNeonPool();
  const startedAt = performance.now();
  const queryName = options?.name ?? "unnamed_query";

  try {
    const result = await pool.query<T>(text, params);
    const durationMs = Math.round(performance.now() - startedAt);

    if (durationMs >= SLOW_QUERY_THRESHOLD_MS) {
      logDatabaseEvent({
        level: "info",
        event: "db_query_slow",
        queryName,
        context: options?.context,
        durationMs,
        rowCount: result.rowCount ?? undefined,
      });
    }

    return result;
  } catch (error) {
    logDatabaseEvent({
      level: "error",
      event: "db_query_failed",
      queryName,
      context: options?.context,
      durationMs: Math.round(performance.now() - startedAt),
      error,
    });
    throw error;
  }
}

export const getNeonPool = (): Pool => {
  if (!pool) {
    const startedAt = performance.now();
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });

    logDatabaseEvent({
      level: "info",
      event: "db_query_slow",
      queryName: "pool_initialization",
      context: "neon",
      durationMs: Math.round(performance.now() - startedAt),
    });
  }
  return pool;
};

export const query = async <T = unknown>(
  text: string,
  params?: unknown[],
  options?: QueryOptions,
): Promise<T[]> => {
  const result = await timedPoolQuery(text, params, options);
  return result.rows as T[];
};

export const queryOne = async <T = unknown>(
  text: string,
  params?: unknown[],
  options?: QueryOptions,
): Promise<T | null> => {
  const rows = await query<T>(text, params, options);
  return rows[0] || null;
};

export const queryRaw = async <T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
  options?: QueryOptions,
): Promise<QueryResult<T>> => {
  return timedPoolQuery<T>(text, params, options);
};
