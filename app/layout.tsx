import type { Metadata, Viewport } from 'next';
import { Manrope, Instrument_Serif } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SITE } from '@/content/site';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});
const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: 'italic',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Mistrail — Into the Northeast',
    template: '%s · Mistrail',
  },
  description: SITE.description,
  applicationName: 'Mistrail',
  openGraph: {
    type: 'website',
    siteName: 'Mistrail — Into the Northeast',
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};

export const viewport: Viewport = {
  themeColor: '#2E4A50',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en-IN" className={`${manrope.variable} ${instrumentSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-teal focus:px-5 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        {children}
        {/* These scripts are served by Vercel only; skip them elsewhere to avoid 404s. */}
        {process.env.VERCEL && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
