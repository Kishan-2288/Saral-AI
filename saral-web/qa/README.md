# QA scripts (optional)

Browser-driven checks used to produce the numbers in `../ACCEPTANCE.md`. They are **not** part of the site and are excluded from lint.

```bash
# one-time, in a scratch folder (they need a Chromium; @sparticuz/chromium bundles one with software WebGL)
npm i @sparticuz/chromium puppeteer-core lighthouse axe-core
node mock-backend.mjs &              # mock FastAPI on :8000 (booking session, create-order, verify, demo-requests)
BACKEND_URL=http://127.0.0.1:8000 npm run build && npm start &   # site on :3000
node axe.mjs                         # WCAG 2.1 A/AA audit across pages/themes/locales
node lh.mjs "http://localhost:3000/?3d=off" mobile mobile-no3d    # Lighthouse (mobile|desktop)
node nowebgl.mjs                     # no-WebGL fallback
node shots.mjs desktop-light         # scene screenshots (desktop-light | desktop-dark | mobile)
```
`func2.mjs` also needs `NEXT_DIST_DIR=.next-dev npx next dev -p 3100` (captcha is only bypassed outside production).
Hard-coded paths and ports reflect the build sandbox; adjust as needed. Do not point `next dev` and `next start` at the same `.next` folder.
