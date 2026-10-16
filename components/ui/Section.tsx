import Link from 'next/link';

export function SectionHeading({
  eyebrow,
  title,
  accent,
  intro,
  action,
  as: Tag = 'h2',
  id,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  intro?: string;
  action?: { href: string; label: string };
  as?: 'h1' | 'h2';
  id?: string;
}) {
  const size = Tag === 'h1' ? 'text-[clamp(40px,7vw,76px)] leading-none tracking-[-0.035em]' : 'text-[clamp(30px,4.5vw,44px)] leading-tight tracking-[-0.03em]';
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-3xl flex-col gap-3">
        {eyebrow && <span className="eyebrow text-terracotta">{eyebrow}</span>}
        <Tag id={id} className={`m-0 font-extrabold ${size}`}>
          {title}
          {accent && (
            <>
              {' '}
              <span className="accent">{accent}</span>
            </>
          )}
        </Tag>
        {intro && <p className="m-0 text-[17px] leading-relaxed text-ink-2 md:text-[19px]">{intro}</p>}
      </div>
      {action && (
        <Link href={action.href} className="font-extrabold text-teal underline-offset-4 hover:underline">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

export function Chip({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'terracotta' | 'amber' | 'forest' | 'light' }) {
  const tones = {
    teal: 'bg-teal-soft text-teal',
    terracotta: 'bg-terracotta text-white',
    amber: 'bg-amber text-white',
    forest: 'bg-forest text-white',
    light: 'bg-white/90 text-ink',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${tones[tone]}`}>{children}</span>;
}

export function LastVerified({ date, verified }: { date?: string; verified: boolean }) {
  return (
    <p className="text-xs leading-relaxed text-ink-4">
      {verified && date ? `Last verified: ${date}.` : 'Unverified — this information has not yet been checked by Mistrail.'} Always confirm on the official
      portal before travel.
    </p>
  );
}
