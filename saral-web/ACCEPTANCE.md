# Acceptance checklist

Mapped to **§11 Testing & Acceptance Criteria** and **§8.3 Performance Budgets** of `saral-ai-website-redesign-requirements.md`, plus the build brief's non-negotiables.
Legend: ✅ verified here · 🟡 partly verified / needs owner action · ⬜ not verified (could not be tested in this environment)

All measurements below were taken in a sandbox: **headless Chromium 153 with software (SwiftShader) WebGL**, Lighthouse with its standard simulated throttling, a mock backend, and a mocked Razorpay object. Treat them as strong evidence, not a substitute for real-device testing.

## §11 Acceptance criteria

| # | Criterion | Status | Evidence / what is left |
|---|---|---|---|
| 1 | All pages SSR and pass Lighthouse targets | 🟡 | Every page is server-rendered/static (`next build` route table; JS-off test shows full copy). Lighthouse on the **home page**: mobile **99 / 100 / 100 / 100** (perf / a11y / best-practices / SEO), LCP 0.9 s, CLS 0, TBT 0 ms, with and without 3D (`?3d=force` mobile: 99/100/100/100, LCP 1.0 s). Desktop 98/100/100/100 without 3D and with the low 3D tier. **Not completed:** Lighthouse on desktop with the *high* 3D tier (software WebGL saturates the CPU so Lighthouse never reaches idle). **Not run:** Lighthouse on the other pages (axe was run on them). `npm run lhci` is wired for all four main routes. |
| 2 | Scroll story smooth (60 fps desktop, ≥ 30 fps mid-range mobile) | ⬜ | Cannot be measured without a GPU. Mechanisms are in place: on-demand rendering (idle canvas = no GPU), DPR clamp, `PerformanceMonitor` adaptive quality, low/high quality tiers, procedural low-poly geometry, no post-processing (draw calls were not profiled). **Measure on a real mid-range phone and a laptop before launch.** |
| 3 | Light/Dark/System with no flash; 3D adapts | ✅ | Stored `dark` is applied before `DOMContentLoaded`; Light/Dark/System toggle updates `<html data-theme>` and persists; System follows `prefers-color-scheme`. Screenshots of every scene in both themes confirm materials, lights, environment and halo all switch (damped ~400 ms). |
| 4 | Reduced-motion and non-WebGL fallbacks | ✅ | Tested: WebGL blocked → no canvas, hero poster visible, no page errors, no dead space; `prefers-reduced-motion` → no canvas even with `?3d=force`, all reveal content visible, no Lenis; `?3d=off`; JS disabled → full copy, FAQ answers and headings present. "Pause animation" control in the footer (WCAG 2.2.2). |
| 5 | Demo form delivers leads; WhatsApp CTA opens correct chat | 🟡 | Form tested against a **mock** backend: validation errors with `aria-invalid`; success shown **only** after backend confirms; backend 500 → error + Retry, never success; offline → network error; nothing stored in `localStorage`; honeypot not forwarded; rate limit returns 429; production refuses to run without Turnstile (503). **Left:** test against the real backend/inbox (confirm the new `Clinic` industry value) and **set `NEXT_PUBLIC_WHATSAPP_NUMBER`** (until then the CTA opens WhatsApp's contact picker). |
| 6 | Accessibility audit (axe + manual keyboard/screen reader) | 🟡 | **axe-core, WCAG 2.1 A/AA: 0 violations** on 11 combinations (`/`, `/hi`, `/features`, `/demo`, `/security`, `/solutions/clinics`, `/privacy`, 404 × light/dark). Real fixes made from audits: AA contrast (spec teal 3.4:1 → 5.0:1; `--primary-ink` for tinted surfaces), no text dimming on inactive steps, 24 px hit targets on the section dots, descriptive link text. Keyboard: first Tab is "Skip to content", mobile menu is a focus-trapped dialog closed by Escape, visible focus ring everywhere. **Left:** manual screen-reader pass (NVDA/VoiceOver/TalkBack); axe catches only a subset of issues. |
| 7 | Cross-browser/device QA on the support matrix | ⬜ | Only Chromium (desktop 1440×900 and mobile 390×844 emulation) was run. **Firefox, Safari, iOS Safari 16+, Android Chrome and real devices still need a pass.** |
| 8 | No console errors; security headers; analytics consent | 🟡 | No console errors or warnings in the 3D-enabled screenshot runs (desktop light, desktop dark, mobile; later builds changed only small layout/CSS details). Headers verified with `curl -I` (CSP per route, HSTS, XFO, nosniff, Referrer-Policy, Permissions-Policy, COOP; `/book/*` adds noindex + no-store). Analytics is consent-gated in code (nothing loads before "Accept analytics" and without `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) but **was not exercised against a live analytics provider**. CSP uses `'unsafe-inline'` for scripts (see README for the nonce upgrade path). |
| 9 | Old URLs 301-redirected; apex/www canonicalised | 🟡 | The old site's hash routes (`#/services`…) never reach a server and cannot be 301s; `LegacyHashRedirect` maps them client-side (mapping unit-tested; the in-browser redirect itself was not exercised). `/en/*` → 308 to the unprefixed URL (verified). `/book/:token` preserved (verified). Canonical tags and sitemap point at `www`; **the apex → www redirect must be configured at the host/DNS.** |
| 10 | Design review: premium and minimal | ⬜ | Needs a human review. Self-check against the brief: one accent colour; Sora + Inter only; short copy; one hero object per scene; 400–800 ms eased motion; no testimonials, badges or stats; single quiet fade for reveals. |

## §8.3 Performance budgets

| Metric | Target | Result |
|---|---|---|
| LCP | ≤ 2.5 s | ✅ 0.9 s mobile (simulated slow 4G + 4× CPU), 0.3 s desktop. *A first run measured 4.4 s: the hero headline wasn't an LCP candidate because its entrance animation started at `opacity: 0`; fixed by animating transform only.* |
| INP | ≤ 200 ms | ⬜ not measured (no real interaction/field data). TBT is 0 ms. |
| CLS | ≤ 0.1 | ✅ 0 |
| Initial JS (before 3D) | ≤ 150 KB gzip | ✅ **130 KB** first-load JS for `/` (Next.js build output). Note: total JS transferred before 3D is ~285 KB because gsap, Lenis and Framer Motion features load right after hydration as a separate enhancement layer (Lighthouse "JS" line). |
| 3D lazy-load | after first paint / idle | ✅ separate chunk, mounted after `load` + idle callback (+3 s on slow networks); never loaded for reduced motion, no-WebGL, paused. |
| 3D payload | ≤ 6 MB desktop / 3 MB mobile | ✅ ≈ **0.26 MB** of extra JS (gzip) and **0 bytes** of model/texture files (all procedural). |
| Frame rate | 60 fps desktop / ≥ 30 mobile | ⬜ see criterion 2 |
| Lighthouse | ≥ 90 perf, 100 a11y, ≥ 95 SEO/BP | ✅ on the home page, see criterion 1 |

## Build brief: non-negotiables

| Requirement | Status | Note |
|---|---|---|
| Server-rendered content; title, meta, OG, JSON-LD, sitemap, robots | ✅ | Per-page metadata with canonical + `hreflang`; Organization/WebSite/SoftwareApplication/FAQPage/BreadcrumbList JSON-LD (no invented ratings or offers); dynamic OG image at `/og`; `sitemap.xml` with alternates; `robots.txt` (blocks `/api/`, `/book/`). |
| Fallbacks: reduced motion, no-WebGL/low-end, simplified mobile scene | ✅ | See criterion 4. Mobile = low tier (DPR ≤ 1.25, 3 bubbles, 220 particles, objects parked at the bottom of the viewport). |
| 3D lazy after first paint; adaptive quality | ✅ | |
| WCAG 2.1 AA; canvas `aria-hidden`; info also as real text | 🟡 | See criterion 6. |
| CSP headers; form spam protection; no patient data collected | ✅ | Turnstile + honeypot + rate limit + Zod; demo form warns not to include patient info; no patient data stored. |
| Do not invent product claims; list unknowns | ✅ | Every unverified item is a `TODO` in the README list (16 items). |
| No medical advice in the demo; emergency → human handoff | ✅ | Six flows incl. *Health question* (allergy rash) and *Emergency* (chest pain), both end in a handoff with a staff reply; unit tests assert this in EN and HI. |
| English + Hindi | ✅ | `/` and `/hi`, typed parity, hreflang. Only "understands Hindi/Hinglish voice notes" is claimed. Needs native review. |
| Fixes from the audit | ✅ | No fake success; `leads.json` not carried over (purge from git history, see README); one `BACKEND_URL` default (8000); `GEMINI_API_KEY`/`APP_URL` removed; no frame JPGs or dead components; client-side redirect map. |
| `/book/[token]` ported; Razorpay only on that route | ✅/🟡 | Same three API calls; Razorpay script is on that route only (verified). Happy path and failure paths tested with a mocked Razorpay + mock backend; **test with real backend and Razorpay test keys.** |

## Automated checks run at handoff
`eslint .` → 0 errors, 0 warnings · `tsc --noEmit` → clean · `vitest` → 12/12 passing (schemas, legacy redirects, locale paths, EN/HI parity, handoff flows, rate limiter) · `next build` → success, 12 routes × 2 locales + API + `/book/[token]`.
The browser-driven QA scripts used for the numbers above are in `qa/` (see `qa/README.md`).
