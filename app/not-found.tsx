import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="container-site flex flex-1 flex-col items-start gap-5 py-24">
        <span className="eyebrow text-terracotta">404</span>
        <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold leading-none tracking-[-0.03em]">
          This trail <span className="accent">fades out.</span>
        </h1>
        <p className="max-w-xl text-lg text-ink-2">The page you were looking for doesn’t exist or has moved.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="flex h-12 items-center rounded-full bg-teal px-6 font-extrabold text-white">
            Back home
          </Link>
          <Link href="/search" className="flex h-12 items-center rounded-full border border-line bg-card px-6 font-bold">
            Search the site
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
