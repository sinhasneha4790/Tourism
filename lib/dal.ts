import 'server-only';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import { auth, authConfigured } from '@/auth';
import { db } from '@/lib/db';
import { hostProfiles, users } from '@/lib/db/schema';
import { effectiveRole, type Role } from '@/lib/permissions';

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isHost: boolean;
  isAdmin: boolean;
  hasHostProfile: boolean;
}

/**
 * The signed-in user, with their role re-read from the database on every request
 * (so becoming a host or an admin takes effect without signing out). Reads cookies:
 * call it only inside a <Suspense> boundary or a Server Action.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!authConfigured || !db) return null;
  // Opt into request-time rendering before Auth.js touches crypto (Cache Components rule).
  await connection();
  const session = await auth();
  const uid = session?.user?.id;
  if (!uid) return null;
  const [row] = await db
    .select({ user: users, profileId: hostProfiles.userId })
    .from(users)
    .leftJoin(hostProfiles, eq(hostProfiles.userId, users.id))
    .where(eq(users.id, uid));
  if (!row?.user.email) return null;
  const role = effectiveRole(row.user.role, row.user.email, process.env.ADMIN_EMAILS);
  return {
    id: row.user.id,
    email: row.user.email,
    name: row.user.name,
    role,
    isHost: role === 'host' || role === 'admin',
    isAdmin: role === 'admin',
    hasHostProfile: Boolean(row.profileId),
  };
}

export async function requireUser(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireHost(next: string): Promise<CurrentUser> {
  const user = await requireUser(next);
  if (!user.hasHostProfile && !user.isAdmin) redirect('/host');
  return user;
}

/** Non-admins get a 404 so the admin area isn't advertised. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser('/admin');
  if (!user.isAdmin) notFound();
  return user;
}
