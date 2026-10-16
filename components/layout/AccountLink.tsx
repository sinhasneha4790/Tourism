import Link from 'next/link';
import { UserRound } from 'lucide-react';
import { getCurrentUser } from '@/lib/dal';

const cls = 'hidden h-11 items-center gap-2 rounded-full border border-line bg-card px-4 text-sm font-bold text-ink hover:border-sage md:flex';

/** Static fallback in the prerendered shell; the signed-in state streams in. */
export function AccountLinkFallback() {
  return (
    <Link href="/signin" className={cls}>
      Log in
    </Link>
  );
}

export async function AccountLink() {
  const user = await getCurrentUser();
  if (!user) return <AccountLinkFallback />;
  return (
    <Link href={user.isAdmin ? '/admin' : user.hasHostProfile ? '/host/dashboard' : '/account'} className={cls}>
      <UserRound size={16} aria-hidden="true" />
      {user.isAdmin ? 'Admin' : user.hasHostProfile ? 'Dashboard' : 'Account'}
    </Link>
  );
}
