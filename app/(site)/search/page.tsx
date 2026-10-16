import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { search, SEARCH_KINDS } from '@/lib/search-index';
import { SectionHeading } from '@/components/ui/Section';

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search Mistrail state guides, places, tour packages and festivals.',
  robots: { index: false, follow: true },
};

async function Results({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.slice(0, 100) ?? '';
  const hits = search(q, 100);

  return (
    <>
      <form action="/search" role="search" className="flex max-w-2xl gap-2">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Try ‘Tawang’, ‘root bridge’ or ‘Hornbill’"
          className="h-13 min-w-0 flex-1 rounded-full border border-line bg-card px-5"
        />
        <button type="submit" className="h-13 rounded-full bg-teal px-6 font-extrabold text-white">
          Search
        </button>
      </form>

      {q && (
        <p role="status" className="font-bold text-ink-3">
          {hits.length} {hits.length === 1 ? 'result' : 'results'} for “{q}”
        </p>
      )}

      {SEARCH_KINDS.map((kind) => {
        const group = hits.filter((h) => h.kind === kind);
        if (!group.length) return null;
        return (
          <section key={kind} aria-labelledby={`g-${kind}`} className="flex flex-col gap-3">
            <h2 id={`g-${kind}`} className="text-xl font-extrabold">
              {kind === 'Attraction' ? 'Places' : `${kind}s`}
            </h2>
            <ul className="grid gap-3 md:grid-cols-2">
              {group.map((h) => (
                <li key={`${h.href}-${h.title}`}>
                  <Link href={h.href} className="flex flex-col rounded-[20px] border border-line-soft bg-card p-5 hover:border-sage">
                    <span className="font-extrabold">{h.title}</span>
                    <span className="text-sm text-ink-3">{h.subtitle}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <div className="container-site flex flex-col gap-8 py-12 md:py-16">
      <SectionHeading as="h1" eyebrow="Search" title="Find your" accent="trail" />
      <Suspense fallback={<p className="text-ink-3">Searching…</p>}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
