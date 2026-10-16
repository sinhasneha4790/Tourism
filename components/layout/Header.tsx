import Link from 'next/link';
import { Suspense } from 'react';
import { ShieldCheck, Calculator, Menu } from 'lucide-react';
import { NAV } from '@/content/site';
import { Logo } from './Logo';
import { NavLinks } from './NavLinks';
import { MobileMenu } from './MobileMenu';
import { AccountLink, AccountLinkFallback } from './AccountLink';
import { SearchDialog } from '@/components/search/SearchDialog';

function StaticNav() {
  return (
    <>
      {NAV.map((item) => (
        <Link key={item.href} href={item.href} className="rounded-full px-3 py-2.5 text-[15px] font-semibold text-ink-2 hover:bg-teal-soft">
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function Header() {
  return (
    <header className="glass no-print sticky top-0 z-30 border-b border-line">
      <div className="container-site flex items-center gap-4 py-3 lg:gap-7 lg:py-4">
        <Logo />
        <nav aria-label="Main" className="hidden flex-1 flex-wrap gap-0.5 xl:flex">
          <Suspense fallback={<StaticNav />}>
            <NavLinks />
          </Suspense>
        </nav>
        <div className="ml-auto flex items-center gap-2 xl:ml-0">
          <SearchDialog />
          <Link
            href="/permits"
            className="hidden h-11 items-center gap-2 rounded-full bg-amber px-4 text-sm font-bold text-white hover:brightness-110 sm:flex xl:hidden 2xl:flex"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            Permit check
          </Link>
          <Link href="/plan" className="hidden h-11 items-center gap-2 rounded-full bg-teal px-4 text-sm font-bold text-white hover:brightness-125 xl:flex">
            <Calculator size={16} aria-hidden="true" />
            Plan my trip
          </Link>
          <Suspense fallback={<AccountLinkFallback />}>
            <AccountLink />
          </Suspense>
          <Suspense
            fallback={
              <button
                type="button"
                disabled
                aria-label="Open menu"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-card xl:hidden"
              >
                <Menu size={20} aria-hidden="true" />
              </button>
            }
          >
            <MobileMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
