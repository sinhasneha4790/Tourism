/** Only allow same-site relative paths as post-sign-in destinations (blocks open redirects). */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback = '/account'): string {
  const v = typeof value === 'string' ? value : '';
  return v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') ? v : fallback;
}
