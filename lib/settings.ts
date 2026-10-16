import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { settings } from '@/lib/db/schema';
import type { PricingSettings } from '@/lib/pricing';

/**
 * Placeholder defaults until the owner sets real values in /admin.
 * Taxes default to 0% on purpose: GST on stays depends on tariff and registration —
 * the owner's accountant should confirm the right rate.
 */
export const DEFAULT_PRICING: PricingSettings = {
  commissionPct: { stay: 12, experience: 15 },
  serviceFeePct: 0,
  taxPct: 0,
};

const KEY = 'pricing';

export async function getPricingSettings(): Promise<PricingSettings> {
  if (!db) return DEFAULT_PRICING;
  const [row] = await db.select().from(settings).where(eq(settings.key, KEY));
  return row ? { ...DEFAULT_PRICING, ...(row.value as Partial<PricingSettings>) } : DEFAULT_PRICING;
}

export async function savePricingSettings(value: PricingSettings): Promise<void> {
  if (!db) throw new Error('Database not configured');
  await db
    .insert(settings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
}
