'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV } from '@/content/site';

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])';

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close when the route changes (state survives navigation under <Activity>).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const toggle = toggleRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    document.body.style.overflow = 'hidden';

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      toggle?.focus();
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card"
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" tabIndex={-1} aria-hidden="true" className="absolute inset-0 bg-night/50" onClick={() => setOpen(false)} />
          <div
            id="mobile-menu"
            ref={panelRef}
            className="absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col gap-2 overflow-y-auto bg-paper p-5 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="eyebrow text-terracotta">Menu</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <Link href="/" className="rounded-2xl px-4 py-3 text-lg font-bold hover:bg-teal-soft" onClick={() => setOpen(false)}>
              Home
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-lg font-bold ${pathname.startsWith(item.href) ? 'bg-teal-soft text-teal' : 'hover:bg-teal-soft'}`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/permits" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-full bg-amber font-bold text-white">
                Permit check
              </Link>
              <Link href="/plan" onClick={() => setOpen(false)} className="flex h-12 items-center justify-center rounded-full bg-teal font-bold text-white">
                Plan my trip
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
