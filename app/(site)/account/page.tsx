import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { requireUser } from '@/lib/dal';
import { signOutAction } from '@/app/auth-actions';

export const metadata: Metadata = { title: 'Your account', robots: { index: false, follow: false } };

async function Account() {
  const user = await requireUser('/account');
  return (
    <div className="flex flex-col gap-6 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-extrabold uppercase tracking-wider text-ink-3">Signed in as</dt>
          <dd className="font-bold">{user.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-extrabold uppercase tracking-wider text-ink-3">Account type</dt>
          <dd className="font-bold capitalize">{user.role}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-3">
        {user.hasHostProfile ? (
          <Link href="/host/dashboard" className="flex h-12 items-center rounded-full bg-teal px-6 font-extrabold text-white">
            Host dashboard
          </Link>
        ) : (
          <Link href="/host" className="flex h-12 items-center rounded-full bg-teal px-6 font-extrabold text-white">
            List your homestay or tour
          </Link>
        )}
        {user.isAdmin && (
          <Link href="/admin" className="flex h-12 items-center rounded-full bg-amber px-6 font-extrabold text-white">
            Admin
          </Link>
        )}
        <form action={signOutAction}>
          <button type="submit" className="h-12 rounded-full border border-line bg-card px-6 font-bold">
            Sign out
          </button>
        </form>
      </div>
      <p className="text-sm text-ink-3">Booking history will appear here when online booking opens.</p>
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="container-site flex max-w-3xl flex-col gap-8 py-12 md:py-16">
      <h1 className="text-[clamp(36px,6vw,56px)] font-extrabold leading-none tracking-[-0.03em]">
        Your <span className="accent">account</span>
      </h1>
      <Suspense fallback={<div className="h-48 rounded-[28px] border border-line-soft bg-card" />}>
        <Account />
      </Suspense>
    </div>
  );
}
