import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { eq } from 'drizzle-orm';
import { BadgeIndianRupee, CalendarCheck, ShieldCheck, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { hostProfiles } from '@/lib/db/schema';
import { authConfigured } from '@/auth';
import { HostProfileForm } from '@/components/marketplace/HostProfileForm';

export const metadata: Metadata = {
  title: 'List your homestay or tour',
  description: 'Host travellers from across India and abroad. List your homestay or local experience on Mistrail — free to list, reviewed by our team.',
  alternates: { canonical: '/host' },
};

const PERKS = [
  { icon: Users, title: 'Travellers who care', body: 'Our guests come for culture, food and landscapes — and respect village rules.' },
  { icon: ShieldCheck, title: 'Reviewed listings', body: 'Every listing is checked by our team before it goes live, so guests trust what they see.' },
  { icon: CalendarCheck, title: 'Enquiries to your inbox', body: 'Guests enquire through Mistrail; you see every enquiry in your dashboard.' },
  { icon: BadgeIndianRupee, title: 'Free to list', body: 'No sign-up fee. When online booking opens, a small commission applies per booking.' },
];

async function HostCta() {
  if (!authConfigured) {
    return <p className="rounded-[20px] bg-amber-bg p-6 text-amber-ink">Host sign-up opens soon. Meanwhile, message us from the contact page.</p>;
  }
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="flex flex-col gap-3 rounded-[28px] bg-night p-7 text-white">
        <h2 className="text-2xl font-extrabold">Start hosting</h2>
        <p className="text-night-soft">Sign in with your email, tell us about yourself, then add your first listing.</p>
        <Link href="/signin?next=/host" className="flex h-12 w-fit items-center rounded-full bg-peach px-6 font-extrabold text-night">
          Sign in to get started
        </Link>
      </div>
    );
  }
  const [profile] = db ? await db.select().from(hostProfiles).where(eq(hostProfiles.userId, user.id)) : [];
  return (
    <div className="flex flex-col gap-4 rounded-[28px] border border-line-soft bg-card p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold">{profile ? 'Your host profile' : 'Tell us about you'}</h2>
        {profile && (
          <Link href="/host/dashboard" className="font-extrabold text-teal underline">
            Go to dashboard →
          </Link>
        )}
      </div>
      <HostProfileForm defaults={profile ? { displayName: profile.displayName, phone: profile.phone, state: profile.state, bio: profile.bio } : {}} />
    </div>
  );
}

export default function HostPage() {
  return (
    <div className="container-site flex flex-col gap-12 py-12 md:py-16">
      <div className="flex max-w-3xl flex-col gap-4">
        <span className="eyebrow text-terracotta">For hosts &amp; local guides</span>
        <h1 className="text-[clamp(40px,7vw,72px)] font-extrabold leading-none tracking-[-0.035em]">
          Share your valley <span className="accent">with travellers.</span>
        </h1>
        <p className="text-lg text-ink-2">
          List a homestay, guesthouse, camp, village walk or guided trek. We review every listing and send enquiries straight to you.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-2 rounded-[20px] border border-line-soft bg-card p-5">
            <Icon className="text-teal" aria-hidden="true" />
            <h2 className="font-extrabold">{title}</h2>
            <p className="text-sm leading-relaxed text-ink-2">{body}</p>
          </li>
        ))}
      </ul>
      <Suspense fallback={<div className="h-64 rounded-[28px] border border-line-soft bg-card" />}>
        <HostCta />
      </Suspense>
    </div>
  );
}
