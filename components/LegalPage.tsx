import Link from 'next/link';
import type { LegalDoc } from '@/content/legal';
import { LEGAL } from '@/content/legal';
import { formatDate } from '@/lib/format';

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_260px]">
      <article className="flex max-w-3xl flex-col gap-6">
        <span className="eyebrow text-terracotta">Legal</span>
        <h1 className="text-[clamp(36px,6vw,60px)] font-extrabold leading-none tracking-[-0.03em]">{doc.title}</h1>
        <p className="text-lg text-ink-2">{doc.summary}</p>
        <p className="text-sm text-ink-3">Last updated {formatDate(doc.lastUpdated)}</p>
        {doc.draft && (
          <p role="note" className="rounded-2xl border border-amber-line bg-amber-bg p-4 text-sm font-semibold text-amber-ink">
            Draft — this text has not yet been approved by Mistrail and may change. Items in [square brackets] are still to be confirmed.
          </p>
        )}
        {doc.sections.map((s) => (
          <section key={s.heading} className="flex flex-col gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight">{s.heading}</h2>
            {s.body.map((p) => (
              <p key={p} className="leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
      <nav aria-label="Legal pages" className="flex h-fit flex-col gap-1 rounded-[20px] border border-line-soft bg-card p-4 lg:sticky lg:top-28">
        {LEGAL.map((d) => (
          <Link
            key={d.slug}
            href={`/${d.slug}`}
            aria-current={d.slug === doc.slug ? 'page' : undefined}
            className={`rounded-xl px-3 py-2 text-sm font-bold ${d.slug === doc.slug ? 'bg-teal-soft text-teal' : 'text-ink-2 hover:bg-teal-soft'}`}
          >
            {d.title}
          </Link>
        ))}
        <Link href="/contact" className="rounded-xl px-3 py-2 text-sm font-bold text-ink-2 hover:bg-teal-soft">
          Contact us
        </Link>
      </nav>
    </div>
  );
}
