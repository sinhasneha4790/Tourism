import { FESTIVALS } from '@/content/festivals';
import { PACKAGES } from '@/content/packages';
import { STATES, stateName } from '@/content/states';

export type SearchKind = 'State' | 'Attraction' | 'Package' | 'Festival';

export interface SearchEntry {
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  /** Lower-cased text the query is matched against. */
  haystack: string;
}

function entry(kind: SearchKind, title: string, subtitle: string, href: string, extra: string[] = []): SearchEntry {
  return {
    kind,
    title,
    subtitle,
    href,
    haystack: [title, subtitle, ...extra].join(' ').toLowerCase(),
  };
}

/** Built from content files at build time — no external search service. */
export const SEARCH_INDEX: SearchEntry[] = [
  ...STATES.map((s) => entry('State', s.name, s.tagline, `/states/${s.slug}`, [s.capital, s.description])),
  ...STATES.flatMap((s) => s.attractions.map((a) => entry('Attraction', a.name, `${a.location}, ${s.name}`, `/states/${s.slug}#places`, a.interests))),
  ...PACKAGES.map((p) =>
    entry('Package', p.title, `${p.days} days · from ${p.startHub}`, `/packages/${p.slug}`, [p.summary, ...p.interests, ...p.states.map(stateName)]),
  ),
  ...FESTIVALS.map((f) => entry('Festival', f.name, `${stateName(f.state)} · ${f.community}`, `/festivals?month=${f.month}`, [f.description])),
];

export const SEARCH_KINDS: SearchKind[] = ['State', 'Attraction', 'Package', 'Festival'];

/** Every word in the query must appear somewhere in the entry. Titles that match rank first. */
export function search(query: string, limit = 50): SearchEntry[] {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return SEARCH_INDEX.filter((e) => words.every((w) => e.haystack.includes(w)))
    .map((e) => ({
      e,
      score: words.filter((w) => e.title.toLowerCase().includes(w)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ e }) => e);
}
