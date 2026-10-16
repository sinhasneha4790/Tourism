import 'server-only';

interface Mail {
  subject: string;
  text: string;
  replyTo?: string;
}

/**
 * Sends a notification to CONTACT_TO_EMAIL through Resend's HTTP API.
 * Returns false when email isn't configured or the send fails, so callers
 * never tell a visitor their message arrived when it didn't.
 */
export async function sendEmail(mail: Mail): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || 'Mistrail <onboarding@resend.dev>';
  if (!key || !to) {
    console.warn('[email] RESEND_API_KEY or CONTACT_TO_EMAIL not set — message not sent:', mail.subject);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: mail.subject,
        text: mail.text,
        reply_to: mail.replyTo,
      }),
    });
    if (!res.ok) console.error('[email] Resend responded', res.status);
    return res.ok;
  } catch (err) {
    console.error('[email] send failed', err);
    return false;
  }
}
