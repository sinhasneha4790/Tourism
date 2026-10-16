import { STATES } from '@/content/states';
import { MONTHS } from '@/lib/format';

const LEVEL = {
  b: { cls: 'bg-forest', label: 'Best' },
  g: { cls: 'bg-mint', label: 'Good' },
  m: { cls: 'bg-blush', label: 'Monsoon / avoid' },
} as const;

/** Month × state heat map. Rendered as a real table so screen readers get every cell. */
export function SeasonGrid() {
  return (
    <div className="relative overflow-x-auto rounded-[24px] border border-line-soft bg-card p-5">
      <table className="w-full min-w-[840px] table-fixed border-separate border-spacing-1 text-[13px] font-extrabold">
        <caption className="sr-only">Best months to visit each state</caption>
        <thead>
          <tr>
            <th scope="col" className="w-[150px] text-left">
              <span className="sr-only">State</span>
            </th>
            {MONTHS.map((m) => (
              <th key={m} scope="col" className="pb-1.5 text-center text-ink-3">
                <abbr title={m} className="no-underline">
                  {m[0]}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {STATES.map((s) => (
            <tr key={s.slug}>
              <th scope="row" className="py-2.5 text-left font-extrabold">
                {s.shortName}
              </th>
              {s.season.split('').map((k, i) => {
                const lv = LEVEL[k as keyof typeof LEVEL];
                return (
                  <td key={i} className={`h-9 rounded-md ${lv.cls}`}>
                    <span className="sr-only">
                      {MONTHS[i]}: {lv.label}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex flex-wrap gap-4 text-[13px] font-bold text-ink-2">
        {Object.values(LEVEL).map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`h-3.5 w-3.5 rounded ${l.cls}`} aria-hidden="true" />
            {l.label}
          </span>
        ))}
        <span className="text-ink-4">Indicative — verify per route.</span>
      </div>
    </div>
  );
}
