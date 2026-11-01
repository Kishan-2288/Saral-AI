# Saral AI website (saral.me)

Premium, minimal, scroll-driven 3D marketing site for **Saral AI**, the WhatsApp AI appointment assistant for clinics, hospitals, IVF centres and diagnostic labs.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · React Three Fiber + drei (Three.js) · GSAP ScrollTrigger · Lenis · Framer Motion · Zod + React Hook Form · Zustand.
English at `/`, Hindi at `/hi`. Light / Dark / System theme with no flash. Fully server-rendered content, 3D is a lazy, decorative enhancement.

> Start with **[ACCEPTANCE.md](./ACCEPTANCE.md)** (what is verified, what is not) and the **[TODO list](#todo-for-the-owner)** below.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # then fill in the TODO values (see table below)
npm run dev                     # http://localhost:3000
```

Scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `test` (Vitest), `lhci` (Lighthouse CI).
Requires Node ≥ 20.9. A backend (FastAPI) is only needed for the demo form and `/book/[token]` (see below).

### QA switches for the 3D scene
`/?3d=off` (no 3D) · `/?3d=low` (force the light tier) · `/?3d=force` (skip the WebGL capability check, useful in headless/software-GL). The scene also never mounts under `prefers-reduced-motion`, with Save-Data/2G, or after the visitor clicks **Pause animation** (footer).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | prod | Canonical URL, sitemap, OG. Default `https://www.saral.me` (canonical host is **www**). |
| `BACKEND_URL` | prod | FastAPI base. **One default: `http://127.0.0.1:8000`** (the old repo disagreed: 8001 in code, 8000 in `.env.example`). Read at **build** time by the `/api/v1/*` rewrite and at **runtime** by `/api/demo-request`. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | **TODO(owner)** | Digits with country code (`919XXXXXXXXX`). Unset → CTA opens WhatsApp's contact picker instead of your chat. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | **TODO(owner)** | Shown in footer. Empty → not rendered. |
| `NEXT_PUBLIC_SOCIAL_LINKEDIN` / `_INSTAGRAM` / `_X` / `_YOUTUBE` | **TODO(owner)** | Footer links + Organization `sameAs`. Empty → not rendered. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | prod | Cloudflare Turnstile. **In production the form refuses to run without them** (API returns 503, button disabled). Dev: no captcha. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | Enables consent-gated analytics. Empty → no analytics code, no third-party script. |
| `NEXT_DIST_DIR` | QA only | Lets `next dev` and `next start` run side by side. |

Removed from the old project: `GEMINI_API_KEY`, `APP_URL` (never used).

## Project structure

```
app/
  [locale]/                 en + hi routes (root layout #1): home, features, how-it-works, solutions/{clinics,hospitals},
                            security, pricing, demo, about, privacy, terms, cookies, 404
  book/[token]/             patient payment page (root layout #2: no marketing chrome, noindex, Razorpay only here)
  api/demo-request/         Zod + Turnstile + rate limit -> proxies to backend
  og/  sitemap.ts  robots.ts  manifest.ts  icon.svg  apple-icon.png  favicon.ico
components/
  canvas/                   3D layer (see components/canvas/README.md)
  sections/                 Hero, Problem, HowItWorks, Features, ChatDemoSection, Handoff, Dashboard, Security, UseCases, Faq, FinalCta
  chat-demo/                scripted WhatsApp-style demo (no network, no data)
  forms/  book/  ui/        DemoForm, BookingSession, header/footer/controls/scroll engine/analytics
content/
  en/  hi/  types.ts        all copy, typed: TypeScript enforces EN/HI parity
  legal.ts                  DRAFT privacy/terms/cookies text
styles/tokens.css           design tokens (light/dark)
lib/                        i18n, seo, schemas, store, rate-limit, legacy-routes, theme script …
public/brand/               SVG wordmark (light + dark) and mark. Replace when a real logo exists
tests/                      Vitest
```

### Editing copy
All text lives in `content/en/index.ts` and `content/hi/index.ts`, both typed by `content/types.ts`. Hindi needs native review before launch.

### Design system
`styles/tokens.css` is the single source of colour. One accent (WhatsApp-teal), amber is reserved for *human handoff / illustrative* labels. **AA deviation from the spec:** `#0E9F6E` is only 3.4:1 on white, so light mode uses `#0A7F5A` (5.0:1) and `--primary-ink #087050` for text on tinted surfaces. Dark mode keeps `#2DD4A0`.
Type: Sora (display) + Inter (body) + Noto Sans Devanagari (Hindi), all self-hosted WOFF2 subsets in `app/fonts/` (SIL OFL licences included), so there is no third-party font host.

### Theme (no flash)
An inline script in `<head>` sets `data-theme` before first paint from `localStorage` / `prefers-color-scheme`; CSS tokens do the rest. Light/Dark/System toggle selected-state is styled from `<html data-theme-pref>` (no JS flash). The 3D scene blends light↔dark over ~400 ms (materials, lights, environment, halo).

## Backend contract (unchanged from the old site)

| Call | Used by |
|---|---|
| `POST {BACKEND_URL}/api/v1/demo-requests/` body `{name,email,phone,organization,industry,monthly_conversations,primary_challenge}` → `{success, leadId}` | `/api/demo-request` (success is shown **only** if the backend confirms `res.ok && success`) |
| `GET /api/v1/booking/{token}`, `POST /api/v1/payments/create-order`, `POST /api/v1/payments/verify` | `/book/[token]` through the same-origin rewrite `/api/v1/*` |

**Verify with your backend:** the form's *industry* options are `Healthcare, Clinic, Diagnostic & Lab, IVF & Specialty, Enterprise / Other`. `Clinic` is new compared with the old form, so confirm the backend accepts it (or change `content/*/form.industries`).

## Security
* Headers (verified with `curl -I`): CSP (separate policy for `/book/*` that additionally allows Razorpay), HSTS, `X-Frame-Options: DENY`, `nosniff`, Referrer-Policy, Permissions-Policy, COOP. `/book/*` also gets `noindex` and `no-store`.
* **CSP caveat:** `script-src` includes `'unsafe-inline'` because Next.js emits inline bootstrap scripts and the theme script must run pre-paint, while pages stay statically rendered. Upgrade path: nonce-based CSP in `middleware.ts` (makes pages dynamic).
* Form: Zod on client and server, Cloudflare Turnstile, hidden honeypot, per-IP rate limit (5 / 10 min). **The limiter is in-memory per instance**: use Upstash/Redis or a Cloudflare rate-limit rule on multi-instance or serverless hosting.
* No patient data is collected. Request bodies are never logged. Nothing is stored in the browser except theme, animation and consent preferences (no lead data).
* **`data/leads.json` from the old repo was not carried over** (it held a real lead's name, email and phone). Purge it from git history, e.g. `pipx run git-filter-repo --path data/leads.json --invert-paths` (then force-push and rotate anything it implied). `.gitignore` here blocks `data/` and `leads*.json`.

## Deploy

**Vercel (simplest):** import the repository, set the Vercel **Root Directory** to `saral-web`, and keep the detected Next.js framework. The checked-in `vercel.json` uses `npm ci`, `npm run build`, and the Mumbai region (`bom1`). Set `BACKEND_URL` in both Preview and Production; Vercel injects it at build time for `/api/v1/*` rewrites and at runtime for `/api/demo-request`. Run `alembic upgrade head` on the backend before enabling the form so the `demo_requests` table exists. Add `saral.me` + `www.saral.me`, make **`www` primary and redirect the apex to it** (the canonical tags already point at www).
**Any Node host:** `npm ci && npm run build && npm start` (set `PORT`). Put a CDN/WAF in front and add a shared rate limit.
**Docker:** add `output: "standalone"` to `next.config.ts`, then a standard Next standalone Dockerfile.

**Old URLs.** The old site was a hash-routed SPA (`#/services` …). Hash fragments never reach a server, so they cannot be 301s and, being fragments, were never indexed. `LegacyHashRedirect` maps them client-side (`#/services → /features`, `#/solutions → /solutions/clinics`, `#/saral-booking | #/contact | #/book-demo → /demo`, `#/about | #/case-studies → /about`). **`/book/:token` is preserved** (patients hold these links). `/en/*` 308-redirects to the unprefixed URL.

## Testing and QA
```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run lhci            # Lighthouse CI against a local build (thresholds in lighthouserc.json)
```
Measured results from the build session are in **ACCEPTANCE.md**, including what could *not* be verified here (real-device frame rate, Safari/Firefox/iOS, screen readers, INP).

## TODO for the owner
Nothing below was invented; each is marked in code with `TODO(owner)` / `TODO(legal)` where relevant.

1. **WhatsApp number** (`NEXT_PUBLIC_WHATSAPP_NUMBER`) and confirm the prefilled message wording.
2. **Support email** and **social URLs**.
3. **Turnstile keys** (site + secret) and decide on **analytics** (`NEXT_PUBLIC_PLAUSIBLE_DOMAIN`).
4. **Legal review** of `/privacy`, `/terms`, `/cookies` (`content/legal.ts`): controller name/address, retention, DPDP notice, grievance contact, governing law. English only; Hindi pages show a notice.
5. **Hindi copy**: native-speaker review of `content/hi`.
6. **Confirm product claims** (all carried from the old copy or from the requirements file, none independently verified): reminders; the four handoff triggers; "introduces itself as an AI and offers a person"; the four security items (tenant isolation, RBAC, HMAC-verified webhooks, audit logs); Hindi/Hinglish voice-note understanding; "checks your availability".
7. **Dashboard**: shown only as an *Illustrative · sample data* mockup; replace with a real screenshot only if one is approved.
8. **Real logo** (replace `public/brand/*.svg`, `app/icon.svg`, `app/apple-icon.png`, `app/favicon.ico`, `public/icons/*`).
9. **About page**: no team/story content exists to verify, so it is intentionally minimal.
10. **Pricing** is "Talk to us". To show prices, edit `lib/pricing.config.ts` (figures are in the commented config).
11. **Backend**: confirm the `Clinic` industry value (above) and the `{success, leadId}` response.
12. **Domain**: apex → www redirect, `NEXT_PUBLIC_SITE_URL`.
13. **Shared rate limiter** if hosting on multiple instances/serverless.
14. **Test `/book/[token]` with real backend + Razorpay test keys.** It was tested here only against a mock backend and a mocked Razorpay object.
15. Cross-browser/device and manual screen-reader QA (see ACCEPTANCE.md).
16. Purge `data/leads.json` from the old repo's git history (see Security).

## Assumptions I made
* English at `/`, Hindi at `/hi` (locale-prefix routing, `hreflang` alternates, `x-default` = English).
* Healthcare-only positioning; all multi-industry and Instagram material from the old site dropped. No testimonials, stats, client logos, compliance badges, or invented metrics.
* Demo form keeps the backend's 7 fields (+ a consent checkbox that is **not** sent). The requirements' *role* and *city* fields are not collected because the backend contract is fixed.
* `#/case-studies → /about` (case studies were cut); `#/solutions → /solutions/clinics`.
* "Demo Clinic", "Dr. Sharma", "Dr. Joshi", slot times and the dashboard rows are fictional and labelled as sample data.
* Bloom post-processing was replaced by a soft radial halo (lighter, no extra dependency, works on mobile). Theme-adaptive glow is still delivered.
* Dropped as out of scope or risky: preloader (hurts LCP, conflicts with "calm"), custom cursor, mobile gyro tilt, ROI estimator (W-09), blog (no content or CMS decision). Pricing *page* exists but shows no prices.
* Next.js is pinned to 15.5.x; Latin-only subsets for Sora/Inter (no Latin-extended).
* OG image text is English for both languages (the default OG font has no Devanagari glyphs).
