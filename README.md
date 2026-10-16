# Mistrail — Into the Northeast

Travel website for India's eight Northeast states: curated tour packages, state guides, a festival calendar, a permit (ILP / PAP / RAP) checker and a trip cost planner.

Built with Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS 4, deployed on Vercel from GitHub.

- Design reference: [`reference/mockup.html`](reference/mockup.html). Open it in a browser.
- Build progress and the content the owner must verify: [`PROGRESS.md`](PROGRESS.md)

## Getting started

```bash
npm ci
cp .env.example .env.local   # fill in what you have; everything is optional for local dev
npm run dev                  # http://localhost:3000
```

## Scripts

| Command                    | What it does                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `npm run dev`              | Local dev server                                              |
| `npm run build`            | Production build                                              |
| `npm run lint`             | ESLint                                                        |
| `npm run typecheck`        | Generates route types, then `tsc --noEmit`                    |
| `npm run test`             | Vitest unit tests (budget maths, permits, festivals, search)  |
| `npm run test:e2e`         | Playwright smoke tests at 360 / 768 / 1280 px (needs a build) |
| `npm run validate:content` | Zod-validates every file in `/content`                        |
| `npm run format`           | Prettier                                                      |

CI (`.github/workflows/ci.yml`) runs all of these on every push and pull request.

## Editing content

All travel content is typed data in `/content`. No markup is needed.

| File                   | What it holds                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| `content/states.ts`    | The 8 state guides: description, airports, languages, attractions, food, crafts, season row |
| `content/packages.ts`  | Mistrail's tour packages: itinerary, price, inclusions, permits needed                      |
| `content/festivals.ts` | Festivals with dates and a `dateConfirmed` flag (shows "Dates TBC" when false)              |
| `content/permits.ts`   | One record per (state, nationality[, area]); each has `verified` / `lastVerified`           |
| `content/rates.ts`     | Budget planner rates and the peak-season multiplier                                         |
| `content/reach.ts`     | Getting there, essentials and etiquette                                                     |
| `content/site.ts`      | Brand, travel-note bar and navigation                                                       |

After you check a permit record on the official portal, set `verified: true` and `lastVerified: 'YYYY-MM-DD'`. Run `npm run validate:content` before you push.

**Photos.** Cards currently show drawn SVG landscapes. To use a real photo, add `src` (a `/public` path or an `images.unsplash.com` URL) and `credit` to any `image` / `cover` object. Add other image hosts to `images.remotePatterns` and the `img-src` CSP in `next.config.ts`.

## Deployment (GitHub → Vercel)

1. Push this repository to GitHub (`main` is production).
2. In Vercel: **Add New → Project → Import** this repository. The framework preset is detected as Next.js. Leave the build command and output directory at their defaults.
3. Add the environment variables from `.env.example` under **Settings → Environment Variables**: at least `NEXT_PUBLIC_SITE_URL`, and `RESEND_API_KEY` + `CONTACT_TO_EMAIL` so enquiry forms deliver.
4. From then on, every push to `main` deploys to production, and every other branch or pull request gets a preview URL.

Rollback: Vercel dashboard → Deployments → promote an earlier deployment, or `npx vercel rollback`.

Enquiry and newsletter forms return an honest "couldn't send" message until email is configured. They never claim delivery when nothing was sent.
