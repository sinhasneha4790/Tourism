import { describe, expect, it } from 'vitest';
import { mailtoHref, normaliseWhatsApp, telHref, whatsappHref } from '@/lib/contact';
import { LEGAL } from '@/content/legal';

describe('contact links', () => {
  it('builds wa.me links from any number format, with an encoded message', () => {
    expect(normaliseWhatsApp('+91 98000-00000')).toBe('919800000000');
    expect(whatsappHref('Hi “Tawang” & more', '+91 98000 00000')).toBe('https://wa.me/919800000000?text=Hi%20%E2%80%9CTawang%E2%80%9D%20%26%20more');
    expect(whatsappHref(undefined, '919800000000')).toBe('https://wa.me/919800000000');
  });

  it('returns null when nothing usable is configured', () => {
    expect(whatsappHref('hi', '')).toBeNull();
    expect(telHref('')).toBeNull();
    expect(mailtoHref('not-an-email')).toBeNull();
    expect(mailtoHref('hello@mistrail.in')).toBe('mailto:hello@mistrail.in');
    expect(telHref('+91 361 000 0000')).toBe('tel:+913610000000');
  });
});

describe('legal pages', () => {
  it('has terms, privacy and cancellation, each with content', () => {
    expect(LEGAL.map((d) => d.slug).sort()).toEqual(['cancellation', 'privacy', 'terms']);
    for (const d of LEGAL) expect(d.sections.length).toBeGreaterThan(2);
  });
});
