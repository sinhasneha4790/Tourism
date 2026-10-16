import Link from 'next/link';

export function LogoMark({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="#E6EEF0" />
      <path d="M22 44 Q40 34 58 44 T96 44" fill="none" stroke="#6E8C93" strokeWidth="7" strokeLinecap="round" />
      <path d="M18 62 Q38 52 58 62 T100 62" fill="none" stroke="#6E8C93" strokeWidth="7" strokeLinecap="round" />
      <path d="M60 104 C40 92 80 84 58 74" fill="none" stroke="#B5462E" strokeWidth="7" strokeLinecap="round" strokeDasharray="2 10" />
      <circle cx="58" cy="74" r="8" fill="#B5462E" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" aria-label="Mistrail — Into the Northeast, home" className="flex shrink-0 items-center gap-2.5 text-teal no-underline">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold tracking-[-0.02em]">mistrail</span>
        <span className="mt-1 text-[9px] font-extrabold tracking-[0.26em] text-terracotta">INTO THE NORTHEAST</span>
      </span>
    </Link>
  );
}
