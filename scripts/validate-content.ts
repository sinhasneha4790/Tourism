/**
 * Zod-validates every content file. Runs in CI (npm run validate:content).
 * Also cross-checks references between files (package states, festival states, permits).
 */
import { z } from 'zod';
import { STATES } from '../content/states';
import { PACKAGES } from '../content/packages';
import { FESTIVALS } from '../content/festivals';
import { PERMITS } from '../content/permits';
import { festivalSchema, packageSchema, permitSchema, stateGuideSchema } from '../lib/validators';

let errors = 0;

function check<T>(label: string, schema: z.ZodType<T>, items: unknown[], key: (i: never) => string) {
  items.forEach((item) => {
    const r = schema.safeParse(item);
    if (!r.success) {
      errors++;
      console.error(`✗ ${label} "${key(item as never)}":\n${z.prettifyError(r.error)}`);
    }
  });
  console.log(`✓ ${label}: ${items.length} checked`);
}

function unique(label: string, slugs: string[]) {
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) {
    errors++;
    console.error(`✗ duplicate ${label} slugs: ${dupes.join(', ')}`);
  }
}

check('state', stateGuideSchema, STATES, (s: { slug: string }) => s.slug);
check('package', packageSchema, PACKAGES, (p: { slug: string }) => p.slug);
check('festival', festivalSchema, FESTIVALS, (f: { slug: string }) => f.slug);
check(
  'permit',
  permitSchema,
  PERMITS,
  (p: { state: string; nationality: string; area?: string }) => `${p.state}/${p.nationality}${p.area ? `/${p.area}` : ''}`,
);

unique(
  'state',
  STATES.map((s) => s.slug),
);
unique(
  'package',
  PACKAGES.map((p) => p.slug),
);
unique(
  'festival',
  FESTIVALS.map((f) => f.slug),
);

if (STATES.length !== 8) {
  errors++;
  console.error(`✗ expected 8 states, found ${STATES.length}`);
}

const headline = new Set(PERMITS.filter((p) => !p.area).map((p) => `${p.state}/${p.nationality}`));
for (const s of STATES) {
  for (const n of ['indian', 'foreign', 'oci']) {
    if (!headline.has(`${s.slug}/${n}`)) {
      errors++;
      console.error(`✗ missing permit record for ${s.slug}/${n}`);
    }
  }
}

const unverified = PERMITS.filter((p) => !p.verified).length;
if (unverified) console.warn(`! ${unverified} permit records are unverified (shown with an "Unverified" notice on the site).`);

if (errors) {
  console.error(`\n${errors} content error(s).`);
  process.exit(1);
}
console.log('\nAll content valid.');
