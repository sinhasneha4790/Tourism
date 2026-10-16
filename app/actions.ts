'use server';

import { headers } from 'next/headers';
import { enquirySchema, newsletterSchema } from '@/lib/validators';
import { rateLimit } from '@/lib/rate-limit';
import { canEmailTravellers, sendEmail } from '@/lib/email';

export interface FormState {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
}

async function clientKey(scope: string) {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown';
  return `${scope}:${ip}`;
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? 'form');
    out[k] ??= i.message;
  }
  return out;
}

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  // Honeypot: real people never fill this hidden field.
  if (formData.get('company')) return { ok: true, message: 'Thanks — we’ll be in touch.' };

  if (!rateLimit(await clientKey('enquiry'), 5, 60_000)) {
    return {
      ok: false,
      message: 'Too many requests. Please wait a minute and try again.',
    };
  }

  const parsed = enquirySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      message: 'Please fix the highlighted fields.',
      errors: fieldErrors(parsed.error.issues),
    };
  }

  const e = parsed.data;
  const lines = [
    `Kind: ${e.kind}`,
    e.ref ? `About: ${e.ref}` : '',
    `Name: ${e.name}`,
    `Email: ${e.email}`,
    e.phone ? `Phone: ${e.phone}` : '',
    e.startDate ? `Start date: ${e.startDate}` : '',
    `Travellers: ${e.travellers}`,
    e.message ? `\n${e.message}` : '',
  ].filter(Boolean);

  const sent = await sendEmail({
    subject: `New ${e.kind} enquiry${e.ref ? ` — ${e.ref}` : ''}`,
    text: lines.join('\n'),
    replyTo: e.email,
  });
  if (!sent) {
    return {
      ok: false,
      message: 'We couldn’t send your enquiry just now. Please try again shortly.',
    };
  }
  // Best-effort confirmation to the traveller; only once a verified sender domain is configured.
  if (canEmailTravellers()) {
    await sendEmail({
      to: e.email,
      subject: 'We’ve received your enquiry — Mistrail',
      text: [
        `Hi ${e.name.split(' ')[0]},`,
        '',
        'Thanks for getting in touch with Mistrail. We’ve received your enquiry and will reply within one working day.',
        '',
        'What you sent us:',
        ...lines.slice(1),
        '',
        '— Mistrail, Into the Northeast',
      ].join('\n'),
    });
  }
  return {
    ok: true,
    message: `Thanks, ${e.name.split(' ')[0]} — we’ve got your enquiry and will reply within one working day.`,
  };
}

export async function subscribeNewsletter(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!rateLimit(await clientKey('newsletter'), 5, 60_000)) {
    return { ok: false, message: 'Too many requests. Please wait a minute.' };
  }
  const parsed = newsletterSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success)
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? 'Invalid email',
    };

  const sent = await sendEmail({
    subject: 'Newsletter sign-up',
    text: `Please add ${parsed.data.email} to trail notes.`,
  });
  if (!sent)
    return {
      ok: false,
      message: 'Sign-up isn’t available just now. Please try again later.',
    };
  return { ok: true, message: 'You’re on the list. See you next month.' };
}
