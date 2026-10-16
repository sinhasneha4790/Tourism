import { SITE } from '@/content/site';

/** Digits only, e.g. "+91 98000 00000" → "919800000000". */
export function normaliseWhatsApp(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** wa.me deep link with an optional pre-filled message, or null when no number is configured. */
export function whatsappHref(message?: string, number: string = SITE.whatsapp): string | null {
  const digits = normaliseWhatsApp(number);
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

export function telHref(phone: string = SITE.phone): string | null {
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.length >= 8 ? `tel:${cleaned}` : null;
}

export function mailtoHref(email: string = SITE.email): string | null {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) ? `mailto:${email}` : null;
}
