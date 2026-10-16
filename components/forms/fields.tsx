export const inputCls = 'h-12 w-full rounded-xl border border-line bg-card px-3.5 text-[15px] aria-[invalid=true]:border-terracotta';
export const textareaCls = 'w-full rounded-xl border border-line bg-card px-3.5 py-3 text-[15px] aria-[invalid=true]:border-terracotta';

/** Label + control + error message, wired with matching ids for screen readers. */
export function Field({
  id,
  label,
  hint,
  error,
  className = '',
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-bold text-ink-2">
        {label}
      </label>
      {children}
      {hint && !error && (
        <span id={`${id}-hint`} className="text-xs text-ink-3">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-err`} className="text-sm font-semibold text-terracotta">
          {error}
        </span>
      )}
    </div>
  );
}

export function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-err` : hint ? `${id}-hint` : undefined;
}

export function FormMessage({ ok, message }: { ok: boolean; message: string }) {
  return (
    <p role="status" aria-live="polite" className={`min-h-5 text-sm font-semibold ${ok ? 'text-forest' : 'text-terracotta'}`}>
      {message}
    </p>
  );
}
