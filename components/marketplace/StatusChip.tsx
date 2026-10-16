const STYLES = {
  draft: ['Draft', 'bg-line-soft text-ink-2'],
  pending: ['In review', 'bg-amber-bg text-amber-ink'],
  approved: ['Live', 'bg-forest text-white'],
  rejected: ['Changes needed', 'bg-terracotta text-white'],
} as const;

export function StatusChip({ status }: { status: keyof typeof STYLES }) {
  const [label, cls] = STYLES[status];
  return <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-extrabold ${cls}`}>{label}</span>;
}
