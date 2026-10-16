/**
 * Applies SQL migrations from /drizzle. Runs before every Vercel build (npm run vercel-build).
 * Skips cleanly when DATABASE_URL isn't configured yet, so the site still deploys.
 */
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

async function main() {
  if (!url) {
    console.log('[migrate] DATABASE_URL not set — skipping migrations.');
    return;
  }
  const client = postgres(url, { max: 1, prepare: false });
  await migrate(drizzle(client), { migrationsFolder: './drizzle' });
  await client.end();
  console.log('[migrate] database is up to date.');
}

main().catch((err) => {
  console.error('[migrate] failed:', err);
  process.exit(1);
});
