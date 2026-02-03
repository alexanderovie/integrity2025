import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export const getNeonPool = (): Pool => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
};

export const query = async <T = unknown>(text: string, params?: unknown[]): Promise<T[]> => {
  const pool = getNeonPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
};

export const queryOne = async <T = unknown>(text: string, params?: unknown[]): Promise<T | null> => {
  const rows = await query<T>(text, params);
  return rows[0] || null;
};

export const queryRaw = async <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  const pool = getNeonPool();
  return pool.query<T>(text, params);
};
