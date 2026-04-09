# Ship readiness checklist (For One Day)

Use this before promoting to **Vercel production**. It ties **UX expectations** to **real routes and files** in this repo—not generic advice.

---

## 1. Architecture snapshot (where things live)

| Area | Location |
|------|-----------|
| Root shell, fonts, viewport | `app/layout.tsx`, `app/globals.css` |
| Auth session (all matched routes) | `middleware.ts`, `lib/supabase/middleware.ts` |
| App shell (nav, safe areas, main padding) | `app/(dashboard)/layout.tsx` |
| Top + bottom nav (dashboard) | `components/dashboard/simple-nav.tsx` |
| Marketing header | `components/header.tsx` |
| Brand / sun motion | `components/brand/sun-motif.tsx`, `components/brand/nav-pill-logo.tsx` |
| Profile photo upload (API) | `app/api/profile-photo/route.ts`, `lib/profile-photo.ts` |
| Children / loved ones CRUD UI | `components/settings/children-manager.tsx`, `components/settings/loved-ones-manager.tsx` |
| Vault UI | `app/(dashboard)/vault/page.tsx`, `app/api/vault/*` |
| Memories | `app/(dashboard)/memories/page.tsx`, `app/api/memories/*` |
| Reflections | `app/(dashboard)/reflection/page.tsx`, `app/api/reflection/*` |
| Stripe / billing | `app/api/checkout/route.ts`, `app/api/webhooks/stripe/route.ts`, `app/(dashboard)/upgrade/page.tsx` |
| DB hardening (run in Supabase SQL) | `supabase/*.sql` (e.g. `harden-loved-ones-child-rls.sql`) |

---

## 2. Environment (Vercel + Supabase)

Copy from `.env.example`. Production must have at least:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (canonical prod URL, used in emails/links)
- Stripe: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` (if billing is live)
- Email: `RESEND_API_KEY`, `FROM_EMAIL` (if transactional email is used)
- `OPENAI_API_KEY` (if AI polish / memory features are on)
- `CRON_SECRET` / `ADMIN_API_SECRET` for protected cron or admin routes

**Rule:** `.env.local` is never committed; Vercel project settings hold prod secrets.

---

## 3. Core user journeys (smoke test)

Run these on **iPhone Safari** and **desktop Chrome** after deploy.

### A. Anonymous → account

1. `/` — landing loads; header respects safe area (`components/header.tsx` + `globals.css` utilities).
2. `/auth/signup` or `/auth/login` — sign in works; session persists after refresh.
3. If verification is required: `/auth/check-email` flow matches `app/(dashboard)/layout.tsx` rules.

### B. Authenticated hub

4. `/dashboard` — `SunriseHero`, `SimpleNav`, no content clipped under notch (dashboard layout `safe-area-inset-top`).
5. Bottom nav: single pattern (`SimpleNav` mobile bottom); scroll main content; home indicator not covered (`pb` uses `env(safe-area-inset-bottom)` in `app/(dashboard)/layout.tsx`).

### C. Capture & memory

6. `/memories` — add person, capture flow; images via `app/api/memories/*` if used.
7. `/reflection` — daily reflection; uploads if applicable (`app/api/reflection/upload-image/route.ts`).

### D. Vault & legacy

8. `/vault` — list/create items; attachments via `app/api/vault/upload-attachment/route.ts` where relevant.

### E. Settings & trust

9. `/settings` — profile; **children** / **loved ones** edit/create/delete (`children-manager`, `loved-ones-manager`); profile photos via `POST /api/profile-photo`.

### F. Monetization (if enabled)

10. `/upgrade` — checkout happy path; Stripe webhook receives events (`app/api/webhooks/stripe/route.ts`).

---

## 4. UX / visual bar (“calm, clear, premium”)

- **Motion:** `SunMotif` animation respects `prefers-reduced-motion` (`globals.css`).
- **No duplicate bottom nav:** only `SimpleNav`’s mobile tab bar in dashboard layout (`MobileBottomNav` not mounted there).
- **Errors:** user-facing toasts/messages, not raw Supabase errors in UI.
- **Empty states:** main list views should explain *why* empty + one primary action (iterate over time).

---

## 5. Security & data

- **RLS:** policies applied on the **same** Supabase project Vercel uses; run `supabase/harden-loved-ones-child-rls.sql` (or equivalent) if not already.
- **Storage:** vault/media uploads scoped by user; profile paths under `userId/profiles/...` (`app/api/profile-photo/route.ts`).
- **Debug routes:** In **production** only, `middleware.ts` blocks `/debug`, `/debug-stripe`, and `/api/debug*` (404 JSON for API, global `app/not-found.tsx` for pages). Local `next dev` is unchanged.

---

## 6. Build gate (local or CI)

```bash
npm run type-check
npm run lint
npm run build
```

Fix failures before prod.

---

## 7. Ship decision

| Ship now | Wait |
|----------|------|
| Build green, env complete, smoke tests pass on phone + desktop | Auth broken, payments wrong env, or RLS not applied to prod DB |

---

*Last updated to match repo layout and recent shell/safe-area/profile-photo work.*
