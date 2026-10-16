import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Mail } from 'lucide-react';
import { authConfigured, authProviders } from '@/auth';
import { signInForTesting, signInWithEmail, signInWithGoogle } from '@/app/auth-actions';
import { safeNext } from '@/lib/safe-next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Mistrail to manage your homestay or tour listings and enquiries.',
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  Verification: 'That sign-in link has expired or was already used. Request a new one.',
  AccessDenied: 'Sign-in was cancelled.',
  CredentialsSignin: 'Couldn’t sign you in with that email.',
};

const input = 'h-12 w-full rounded-xl border border-line bg-card px-3.5 text-[15px]';

async function SignInPanel({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k][0] : sp[k]);
  const next = safeNext(one('next'));
  const error = one('error');
  const check = one('check');

  if (check) {
    return (
      <div role="status" className="flex flex-col gap-3 rounded-[28px] bg-teal-soft p-8">
        <Mail className="text-teal" aria-hidden="true" />
        <h2 className="text-2xl font-extrabold">Check your email</h2>
        <p className="text-ink-2">We’ve sent you a sign-in link. It works once and expires in 24 hours.</p>
      </div>
    );
  }

  if (!authConfigured) {
    return (
      <p className="rounded-[20px] border border-amber-line bg-amber-bg p-6 text-amber-ink">
        Sign-in isn’t switched on yet. The site owner needs to connect the database and set <code>AUTH_SECRET</code>.
      </p>
    );
  }

  const none = !authProviders.email && !authProviders.google && !authProviders.test;

  return (
    <div className="flex flex-col gap-5 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
      {error && (
        <p role="alert" className="rounded-xl bg-amber-bg p-3 text-sm font-semibold text-amber-ink">
          {ERRORS[error] ?? 'Something went wrong signing you in. Please try again.'}
        </p>
      )}
      {authProviders.email && (
        <form action={signInWithEmail} className="flex flex-col gap-3">
          <input type="hidden" name="next" value={next} />
          <label htmlFor="signin-email" className="text-sm font-bold text-ink-2">
            Email address
          </label>
          <input id="signin-email" name="email" type="email" required autoComplete="email" className={input} />
          <button type="submit" className="h-12 rounded-full bg-teal font-extrabold text-white">
            Email me a sign-in link
          </button>
        </form>
      )}
      {authProviders.google && (
        <form action={signInWithGoogle}>
          <input type="hidden" name="next" value={next} />
          <button type="submit" className="h-12 w-full rounded-full border border-line bg-card font-bold hover:border-sage">
            Continue with Google
          </button>
        </form>
      )}
      {authProviders.test && (
        <form action={signInForTesting} className="flex flex-col gap-3 rounded-2xl border border-dashed border-amber-line p-4">
          <input type="hidden" name="next" value={next} />
          <p className="text-xs font-bold uppercase tracking-wider text-amber-ink">Test login — local development only</p>
          <label htmlFor="test-email" className="text-sm font-bold text-ink-2">
            Email
          </label>
          <input id="test-email" name="email" type="email" required className={input} />
          <button type="submit" className="h-12 rounded-full bg-amber font-extrabold text-white">
            Sign in for testing
          </button>
        </form>
      )}
      {none && <p className="text-ink-2">No sign-in method is configured yet. Email sign-in needs RESEND_API_KEY and CONTACT_FROM_EMAIL.</p>}
      <p className="text-xs text-ink-3">By signing in you agree to our terms and privacy policy.</p>
    </div>
  );
}

export default function SignInPage({ searchParams }: PageProps<'/signin'>) {
  return (
    <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_440px] lg:items-start">
      <div className="flex max-w-xl flex-col gap-4">
        <span className="eyebrow text-terracotta">Your account</span>
        <h1 className="text-[clamp(38px,6vw,64px)] font-extrabold leading-none tracking-[-0.035em]">
          Welcome <span className="accent">back.</span>
        </h1>
        <p className="text-lg text-ink-2">Sign in to list your homestay or experience, follow enquiries, and — soon — manage bookings.</p>
      </div>
      <Suspense fallback={<div className="h-64 rounded-[28px] border border-line-soft bg-card" />}>
        <SignInPanel searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
