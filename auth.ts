import NextAuth, { type NextAuthConfig } from 'next-auth';
import type { Provider } from 'next-auth/providers';
import Resend from 'next-auth/providers/resend';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { accounts, sessions, users, verificationTokens } from '@/lib/db/schema';

/**
 * Test-only sign-in (email, no password). Enabled only when AUTH_TEST_LOGIN=1 and the
 * app is NOT running on Vercel, so it can never be switched on in production or previews.
 */
export const testLoginEnabled = process.env.AUTH_TEST_LOGIN === '1' && !process.env.VERCEL;

export const authProviders = {
  email: Boolean(db && process.env.RESEND_API_KEY && process.env.CONTACT_FROM_EMAIL),
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  test: testLoginEnabled && Boolean(db),
};

/** Auth needs a secret and a database; without them sign-in pages explain what's missing. */
export const authConfigured = Boolean(process.env.AUTH_SECRET && db);

const providers: Provider[] = [];
if (authProviders.email) {
  providers.push(Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.CONTACT_FROM_EMAIL }));
}
if (authProviders.google) providers.push(Google);
if (authProviders.test && db) {
  const database = db;
  providers.push(
    Credentials({
      id: 'test-login',
      name: 'Test login',
      credentials: { email: { label: 'Email', type: 'email' } },
      async authorize(raw) {
        const email = String(raw?.email ?? '')
          .trim()
          .toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return null;
        const [existing] = await database.select().from(users).where(eq(users.email, email));
        if (existing) return existing;
        const [created] = await database
          .insert(users)
          .values({ email, name: email.split('@')[0], emailVerified: new Date() })
          .returning();
        return created;
      },
    }),
  );
}

const config: NextAuthConfig = {
  adapter: db
    ? DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens })
    : undefined,
  // JWT sessions keep sign-in working with the credentials provider; roles are always re-read from the database.
  session: { strategy: 'jwt' },
  providers,
  trustHost: true,
  pages: { signIn: '/signin', verifyRequest: '/signin?check=1', error: '/signin' },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid && session.user) session.user.id = String(token.uid);
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
