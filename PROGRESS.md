# Mistrail — build progress

Spec: _Mistrail Technical Build Specification v1.0_ (Oct 2026). Design: `reference/mockup.html` ("09 Plan Your Trip · Permits & costs").

**Live URL:** _not yet deployed. The Vercel project must be connected by the owner (see README → Deployment)._
**Repository:** https://github.com/sinhasneha4790/Tourism

## Decisions taken while building Phase 1

- **Design tokens follow the supplied mock-up**, not the older palette in spec §3: Manrope and Instrument Serif, deep teal `#2E4A50`, terracotta `#B5462E`, peach `#E9A07F` and paper `#F6F8F7`. The amber CTA colour is darkened to `#A8620F` so white text passes WCAG AA.
- **Next.js 16.4 with Cache Components** (the scaffold default). Pages are prerendered, and interactive widgets that read the URL sit inside `<Suspense>` with a static fallback.
- **Photos:** stock-photo hosts could not be checked from the build environment, so cards use drawn SVG scenes (`components/ui/Scene.tsx`). Adding `src` to any image switches it to `next/image`.
- **Navigation** covers the Phase 1 routes only (Destinations, Packages, Festivals, Permits, Plan). Homestays, Experiences, account, About and Contact come in later phases, so no nav item points to a missing page.
- **Forms** (package enquiry, plan, newsletter) validate with zod on the server and are rate-limited. They send through Resend once `RESEND_API_KEY` + `CONTACT_TO_EMAIL` are set (Phase 2 exit criterion).
- **Budget planner** counts nights as `days − 1`. The mock-up charged one night per day.
- Analytics and Speed Insights load only on Vercel.

## Phases

- [x] **Phase 1 — Foundation & content site.** Code complete; verified locally with lint, typecheck, 21 unit tests, content validation, build, and 42 Playwright checks at 360 / 768 / 1280 px.
  - [x] Next.js + TypeScript (strict) + Tailwind 4 + next/font + lucide-react
  - [x] Design tokens in `app/globals.css`
  - [x] Layout: travel-note bar (dismissible, localStorage), sticky header, ⌘K / Ctrl+K search, accessible mobile drawer, footer
  - [x] Content files typed and zod-validated (`scripts/validate-content.ts`)
  - [x] Home, States (list + 8 detail pages), Packages (list + 6 detail pages), Festivals, Permits, Plan, Search, 404
  - [x] SEO: per-page metadata, canonical URLs, sitemap.xml, robots.txt, OG image, JSON-LD (TravelAgency, TouristDestination, TouristTrip/Product, Event)
  - [x] Security headers (CSP, nosniff, Referrer-Policy, Permissions-Policy, X-Frame-Options)
  - [x] CI workflow
  - [x] Pushed to GitHub (`main`)
  - [ ] **Deploy to Vercel.** Waiting on the owner to import the repo (see "Owner actions" below).
  - [ ] Lighthouse ≥ 90 on production (needs the live URL)
- [ ] Phase 2 — Enquiries & trust (Contact, About, legal pages, WhatsApp button, email delivery)
- [ ] Phase 3 — Marketplace listings
- [ ] Phase 4 — Bookings & payments (Razorpay test mode)
- [ ] Phase 5 — Polish

## Mock-up defects (spec §9)

- [x] 1 Stray icon markup in the announcement bar: clean lucide icons
- [x] 2 Per-person total never updated: React state, unit-tested
- [x] 3 Filter relied on global `event`: controlled state synced to the URL
- [x] 4 Festival month filter empty: working Jan–Dec + All chips, `?month=`
- [x] 5 Interest filter did nothing: packages filter by `?interest=`
- [x] 6 Search XSS: results rendered as React text; e2e test included
- [x] 7 ILP link always Arunachal: per-state `applyUrl`; unit test included
- [x] 8 Hard-coded countdown: next festival computed from data, hydration-safe, rolls over yearly
- [x] 9 Single page: real routes
- [x] 10 .gov.in contact details: footer states that Mistrail is a private company; contacts come from env vars
- [x] 11 Reused unrelated photos: distinct illustrated scenes per place until owner photos arrive
- [x] 12 CDN Tailwind / Font Awesome: npm Tailwind + lucide-react
- [x] 13 Text below 12 px / low contrast: 12 px minimum for readable text; contrast-checked overlays
- [x] 14 Hero badge pulsed forever: `motion-safe` only; global reduced-motion rule
- [x] 15 Old branding: Mistrail — Into the Northeast

## Acceptance checklist (spec §13)

- [x] Visual parity with mock-up on Home, States, Packages, Festivals, Permits, Plan (desktop and mobile)
- [x] Every nav item, footer link, card and CTA goes to a real route
- [x] Home filter, interest tiles, package filters and festival month filter filter correctly and update the URL
- [x] Permit checker returns the right record for every state × nationality, links that state's portal, flags unverified records
- [x] Budget planner matches unit tests; per-person total updates; print view hides chrome
- [x] Festival countdown targets the next upcoming festival with no hydration warning
- [x] Search finds states, attractions, packages, festivals; keyboard accessible; no raw HTML injection
- [x] No government branding or .gov.in contacts (only outbound links to official permit portals)
- [ ] Lighthouse mobile ≥ 90 in all four categories on Home and a package page (run after deploy)
- [x] No console errors locally (checked by Playwright); [ ] re-check on production
- [x] sitemap.xml, robots.txt, OG images and per-page titles present
- [ ] GitHub repo exists ✔, main protected by CI ☐, Vercel project connected ☐, push to main auto-deploys ☐, PRs get previews ☐
- [x] .env.example committed; no secrets in git history
- [x] README explains setup, scripts, content editing and deployment; [ ] PROGRESS.md updated with the live URL

## Owner actions needed

1. ~~GitHub push access~~ — done.
2. **Vercel.** Import the repository at vercel.com/new (one click; Next.js is detected). Set `NEXT_PUBLIC_SITE_URL`.
3. **Branch protection.** GitHub → Settings → Branches → protect `main`, require the `CI / check` status.
4. Supply: contact email, phone, WhatsApp number, Resend API key, real package prices and departure dates, and photos.

## Content the owner must verify

Every item below is a placeholder until checked. Permit records show an "Unverified" badge on the site.

**Permits (`content/permits.ts`, 26 records, all `verified: false`)**

- Assam, Meghalaya, Tripura: no permit, for Indian, foreign and OCI travellers
- Arunachal Pradesh: ILP for Indians; PAP for foreign nationals and OCI. Portal: eilp.arunachal.gov.in
- Nagaland: ILP for Indians; foreign-national and OCI rules. Portal: ilp.nagaland.gov.in
- Manipur: ILP for Indians; foreign-national and OCI rules. Portal: manipurilponline.mn.gov.in
- Mizoram: ILP for Indians; foreign-national and OCI rules. Portal: ilp.mizoram.gov.in
- Sikkim: no entry permit for Indians, plus protected-area permits for Tsomgo/Nathula and North Sikkim; RAP for foreign nationals and OCI. Portal: sikkimtourism.gov.in
- For every record: fee, validity, processing time, documents, and whether each portal URL is current

**Festival dates (`content/festivals.ts`, all `dateConfirmed: false`)**
Hornbill (1–10 Dec 2026), Wangala (6–8 Nov 2026), Sangai (21–30 Nov 2026), Losar (Feb 2027), Chapchar Kut (Mar 2027), Shad Suk Mynsiem (Apr 2027), Rongali Bihu (14–20 Apr 2027), Moatsu (1–3 May 2027), Ambubachi Mela (Jun 2027), Kharchi Puja (Jul 2027), Ziro Festival of Music (Sep 2027), Pang Lhabsol (date not set)

**Prices and rates**

- Package from-prices (`content/packages.ts`): ₹18,500 · ₹24,500 · ₹38,500 · ₹27,500 · ₹32,000 · ₹62,000, plus inclusions, routes and distances
- Planner rates (`content/rates.ts`): homestay ₹2,200 · 3-star ₹4,500 · heritage ₹8,500 per room night; SUV ₹3,500 · sedan ₹2,500 per day · shared ₹900 per person per day; food ₹800 pp/day; safari ₹2,200 pp; ILP ₹300 pp; peak ×1.15 (Oct–Dec)

**Other facts:** airports, capitals and best seasons in `content/states.ts`, and the "Getting there" text in `content/reach.ts`.
