import 'server-only';
import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { mistrailDb?: Db };

function create(): Db | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  // prepare: false keeps us compatible with pooled (pgbouncer) connection strings such as Neon's.
  const client = postgres(url, { prepare: false, max: 5 });
  return drizzle(client, { schema });
}

/** Null until DATABASE_URL is configured; marketplace pages then show an "opening soon" state. */
export const db: Db | null = globalForDb.mistrailDb ?? create();
if (db && process.env.NODE_ENV !== 'production') globalForDb.mistrailDb = db;

export function requireDb(): Db {
  if (!db) throw new Error('DATABASE_URL is not set — the marketplace database is not configured.');
  return db;
}

export { schema };
