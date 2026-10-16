'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import type { Nationality, PermitRule, StateSlug } from '@/types/content';
import { STATES, STATE_SLUGS, stateName } from '@/content/states';
import { NATIONALITY_LABELS, permitsFor } from '@/content/permits';

const NATIONALITIES: Nationality[] = ['indian', 'foreign', 'oci'];
const DEFAULT_STATES: StateSlug[] = ['meghalaya', 'arunachal-pradesh'];

export function parsePermitQuery(params: { get(k: string): string | null }) {
  const n = params.get('nationality') as Nationality | null;
  const nationality: Nationality = n && NATIONALITIES.includes(n) ? n : 'indian';
  const raw = params.get('state');
  const picked = raw ? (raw.split(',').filter((s) => STATE_SLUGS.includes(s as StateSlug)) as StateSlug[]) : DEFAULT_STATES;
  return { nationality, picked };
}

function badge(rule: PermitRule) {
  if (!rule.required) return { text: 'NONE', cls: 'bg-forest' };
  if (rule.permitType === 'Protected Area') return { text: 'AREA', cls: 'bg-amber' };
  return { text: rule.permitType, cls: 'bg-terracotta' };
}

/** Interactive checker; state lives in the URL (?nationality=&state=a,b) so results are shareable. */
export function PermitChecker() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { nationality, picked } = parsePermitQuery(params);

  function sync(next: { nationality?: Nationality; picked?: StateSlug[] }) {
    const q = new URLSearchParams();
    q.set('nationality', next.nationality ?? nationality);
    q.set('state', (next.picked ?? picked).join(','));
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  }

  return (
    <PermitCheckerView
      nationality={nationality}
      picked={picked}
      onNationality={(n) => sync({ nationality: n })}
      onToggle={(s) =>
        sync({
          picked: picked.includes(s) ? picked.filter((x) => x !== s) : STATE_SLUGS.filter((x) => x === s || picked.includes(x)),
        })
      }
    />
  );
}

/** Prerendered default (Indian citizen · Meghalaya + Arunachal) shown until the URL is read. */
export function PermitCheckerFallback() {
  return <PermitCheckerView nationality="indian" picked={DEFAULT_STATES} />;
}

function PermitCheckerView({
  nationality,
  picked,
  onNationality,
  onToggle,
}: {
  nationality: Nationality;
  picked: StateSlug[];
  onNationality?: (n: Nationality) => void;
  onToggle?: (s: StateSlug) => void;
}) {
  const sync = (n: { nationality: Nationality }) => onNationality?.(n.nationality);
  const toggle = (s: StateSlug) => onToggle?.(s);
  const results = picked.flatMap((s) => permitsFor(s, nationality));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
        <h2 className="text-[28px] font-extrabold tracking-[-0.02em] md:text-[32px]">Do I need a permit?</h2>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[13px] font-extrabold tracking-[0.12em] text-ink-3">1 · I AM</legend>
          <div className="flex flex-wrap gap-2">
            {NATIONALITIES.map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={nationality === n}
                onClick={() => sync({ nationality: n })}
                className={`h-12 rounded-full px-5 text-[15px] font-extrabold ${nationality === n ? 'bg-ink text-white' : 'border border-line bg-card text-ink hover:border-sage'}`}
              >
                {NATIONALITY_LABELS[n]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-[13px] font-extrabold tracking-[0.12em] text-ink-3">2 · I WANT TO VISIT</legend>
          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => {
              const on = picked.includes(s.slug);
              return (
                <button
                  key={s.slug}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.slug)}
                  className={`h-11 rounded-full px-4 text-sm font-bold ${on ? 'border-[1.5px] border-teal bg-teal-soft text-teal' : 'border border-line bg-card text-ink-2 hover:border-sage'}`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <div className="print-plain flex flex-col gap-4 rounded-[28px] bg-teal p-6 text-white md:p-8" aria-live="polite">
        <span className="eyebrow text-peach-soft">Your permits</span>
        {results.length === 0 && <p className="text-night-soft">Pick at least one state to see what you need.</p>}
        {results.map((r) => {
          const b = badge(r);
          return (
            <details key={`${r.state}-${r.area ?? ''}`} className="group rounded-2xl bg-white/[0.08] p-4" open={results.length <= 2}>
              <summary className="flex cursor-pointer list-none gap-3.5">
                <span className={`h-fit shrink-0 rounded-[10px] px-2.5 py-1.5 text-xs font-extrabold ${b.cls}`}>{b.text}</span>
                <span className="flex flex-col gap-1">
                  <strong className="text-[17px]">
                    {stateName(r.state)}
                    {r.area && <span className="font-semibold text-night-soft"> · {r.area}</span>}
                  </strong>
                  <span className="text-sm leading-normal text-night-soft">{r.notes ?? (r.required ? `${r.permitType} required.` : 'No permit needed.')}</span>
                  {!r.verified && <span className="w-fit rounded-full bg-amber-bg px-2 py-0.5 text-xs font-bold text-amber-ink">Unverified</span>}
                </span>
              </summary>
              {r.required && (
                <dl className="mt-4 grid gap-x-4 gap-y-2 border-t border-white/15 pt-4 text-sm sm:grid-cols-2">
                  <Row k="Permit" v={r.permitType} />
                  <Row k="Issued by" v={r.issuedBy} />
                  <Row k="Typical fee" v={r.feeText} />
                  <Row k="Validity" v={r.validity} />
                  <Row k="Processing" v={r.processing} />
                  <Row k="Documents" v={r.documents.join('; ')} />
                </dl>
              )}
              {r.applyUrl && r.required && (
                <a
                  href={r.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-extrabold text-peach-soft underline underline-offset-2"
                >
                  Official {stateName(r.state)} portal <ExternalLink size={14} aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
            </details>
          );
        })}
        <Link href="/packages" className="mt-2 flex h-13 items-center justify-center rounded-full bg-white font-extrabold text-ink">
          Book a trip — we handle permits
        </Link>
        <p className="text-xs text-night-soft">
          Rules change often. None of these records has been verified by Mistrail yet — always confirm on the official state portal before travel.
        </p>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wider text-peach-soft">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}
