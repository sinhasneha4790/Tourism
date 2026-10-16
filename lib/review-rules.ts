/** Pure review rules, shared by the server and unit tests. */

export const REVIEW_MIN_CHARS = 20;
export const REVIEW_MAX_CHARS = 2000;
/** Travellers can review for this many days after their stay ends. */
export const REVIEW_WINDOW_DAYS = 60;

/** A traveller can review a confirmed booking once it has ended, within the review window. */
export function canReview(b: { status: string; endDate: string }, today: string): boolean {
  if (b.status !== 'confirmed' || b.endDate > today) return false;
  const daysSince = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${b.endDate}T00:00:00Z`)) / 86_400_000);
  return daysSince <= REVIEW_WINDOW_DAYS;
}

/** Average of published ratings, to one decimal place. */
export function averageRating(ratings: number[]): number | null {
  if (!ratings.length) return null;
  return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
}

/** "Asha Traveller" → "Asha T." — reviews show a first name and initial only. */
export function publicName(full: string): string {
  const [first, ...rest] = full.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0].toUpperCase()}.` : (first ?? 'Guest');
}
