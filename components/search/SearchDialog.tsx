'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { Search, X, CornerDownLeft } from 'lucide-react';
import { search } from '@/lib/search-index';

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const results = search(query, 8);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      inputRef.current?.focus();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open]);

  function go(href: string) {
    setOpen(false);
    setQuery('');
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const picked = results[active];
      // Enter on a highlighted result opens it; otherwise show the full results page.
      if (picked) go(picked.href);
      else if (query.trim()) go(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search (Ctrl+K)"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card hover:border-sage"
      >
        <Search size={18} aria-hidden="true" />
      </button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === dialogRef.current && setOpen(false)}
        aria-label="Search Mistrail"
        className="mx-auto mt-[10vh] w-[min(92vw,640px)] rounded-3xl border border-line bg-card p-0 text-ink shadow-2xl backdrop:bg-night/50"
      >
        <div className="flex items-center gap-3 border-b border-line-soft px-5">
          <Search size={18} aria-hidden="true" className="text-ink-3" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search states, places, packages, festivals…"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
            className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-ink-4"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close search"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-teal-soft"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <ul id={listId} role="listbox" aria-label="Results" className="max-h-[50vh] overflow-y-auto p-2">
          {query.trim() && results.length === 0 && <li className="px-4 py-6 text-sm text-ink-3">No matches for “{query}”.</li>}
          {results.map((r, i) => (
            <li
              key={`${r.kind}-${r.href}-${r.title}`}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.href)}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 ${i === active ? 'bg-teal-soft' : ''}`}
            >
              <span className="w-20 shrink-0 text-xs font-extrabold uppercase tracking-wider text-terracotta">{r.kind}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold">{r.title}</span>
                <span className="block truncate text-sm text-ink-3">{r.subtitle}</span>
              </span>
              {i === active && <CornerDownLeft size={16} aria-hidden="true" className="text-ink-3" />}
            </li>
          ))}
        </ul>
        <p className="border-t border-line-soft px-5 py-3 text-xs text-ink-3">
          ↑ ↓ to move · Enter to open · Esc to close · Enter without a selection shows all matches
        </p>
      </dialog>
    </>
  );
}
