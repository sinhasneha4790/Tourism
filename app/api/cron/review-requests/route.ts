import { and, eq, gte, isNull, lt, notExists } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bookings, listings, reviews } from '@/lib/db/schema';
import { bookingUrl } from '@/lib/bookings';
import { canEmailTravellers, sendEmail } from '@/lib/email';
import { addDays, todayIst } from '@/lib/pricing';

/**
 * Daily (vercel.json → crons): emails travellers whose stay ended in the last week,
 * asking for a review. Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) return new Response('unauthorized', { status: 401 });
  if (!db || !canEmailTravellers()) return Response.json({ sent: 0, skipped: 'email or database not configured' });

  const today = todayIst();
  const due = await db
    .select({ b: bookings, title: listings.title })
    .from(bookings)
    .innerJoin(listings, eq(listings.id, bookings.listingId))
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        lt(bookings.endDate, today),
        gte(bookings.endDate, addDays(today, -7)),
        isNull(bookings.reviewRequestedAt),
        notExists(db.select({ id: reviews.id }).from(reviews).where(eq(reviews.bookingId, bookings.id))),
      ),
    )
    .limit(100);

  let sent = 0;
  for (const { b, title } of due) {
    const ok = await sendEmail({
      to: b.guestEmail,
      subject: `How was ${title}?`,
      text: `Hi ${b.guestName.split(' ')[0]},\n\nWe hope you had a wonderful time. Would you share a quick review to help other travellers and your host?\n\n${bookingUrl(b)}#review\n\n— Mistrail`,
    });
    if (ok) {
      sent++;
      await db.update(bookings).set({ reviewRequestedAt: new Date() }).where(eq(bookings.id, b.id));
    }
  }
  return Response.json({ sent });
}
