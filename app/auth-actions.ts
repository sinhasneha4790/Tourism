'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/auth';
import { safeNext } from '@/lib/safe-next';

export async function signInWithEmail(formData: FormData) {
  const next = safeNext(formData.get('next'));
  try {
    await signIn('resend', { email: String(formData.get('email') ?? ''), redirectTo: next });
  } catch (err) {
    if (err instanceof AuthError) redirect(`/signin?error=${err.type}&next=${encodeURIComponent(next)}`);
    throw err; // redirects are thrown and must propagate
  }
}

export async function signInWithGoogle(formData: FormData) {
  await signIn('google', { redirectTo: safeNext(formData.get('next')) });
}

export async function signInForTesting(formData: FormData) {
  const next = safeNext(formData.get('next'));
  try {
    await signIn('test-login', { email: String(formData.get('email') ?? ''), redirectTo: next });
  } catch (err) {
    if (err instanceof AuthError) redirect(`/signin?error=${err.type}&next=${encodeURIComponent(next)}`);
    throw err;
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' });
}
