'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV } from '@/content/site';

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={`rounded-full px-3.5 py-2.5 text-[15px] font-semibold transition-colors ${
              active ? 'bg-teal-soft text-teal' : 'text-ink-2 hover:bg-teal-soft'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
