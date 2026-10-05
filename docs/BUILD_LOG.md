# Build log

Newest entries at the top. Keep each entry short: what changed, what we learned, what's next.

---

## 2026-10-05 — Cleaner request form and request page

**Why:** Feedback: too many empty boxes made the form feel unfinished.

**Changed**
- Form: budget is now tap-to-choose ranges (RM/A$ toggle, "Custom" reveals min/max); optional note, measurements and curator notes hide behind "+ Add…" links; compact image picker; lighter, borderless controls. No empty text boxes show by default.
- Budget model: `max` may be `null` ("RM200+"); at least one of min/max is required.
- Request page: the dashed "pending" box is replaced by a "what happens next" card; picks without a photo no longer show an empty grey image block.

**Verified**
- Lint, typecheck, build clean; browser suite 88/88 (phone + desktop).

## 2026-10-05 — Pivot to concierge MVP

**Why:** Validate demand for curated Taobao shortlists before automating.

**Built**
- `/inspiration` is now a concierge request form (image, note, budget, size, measurements, fit, Find this / Find my vibe, notes) with inline validation and a success state + request ID.
- `POST /api/requests`, `GET /api/requests/[id]/image`; shared validator (`src/lib/requests/validate.ts`).
- Dev-only file store (`src/lib/requests/store.ts`, `.data/`), unguessable `req_…` IDs.
- `/requests/[id]`: inspiration, preferences, status timeline, then pending state or 3–5 curated picks (why it matches, shop, reviews, sizing, curator note, Taobao button).
- Types: `CurationRequest`, `CuratedResult` (with `source`), `CuratedProduct` (`src/types/curation.ts`).
- `npm run curate` helper + template + labelled demo shortlist.
- Automated matcher moved to `/labs/auto-match` (unchanged, not linked). Landing copy updated to the concierge offer.
- `npm run typecheck` now regenerates route types first, so it works in a fresh clone.

**Verified**
- Lint, typecheck, build: pass with no warnings.
- API via curl: 201 / 400 / 415 / 422 / 404 cases, path traversal blocked.
- Curation helper: status changes, 3–5 rule, Taobao-URL rule, overwrite protection.
- Headless browser, phone + desktop: 84/84 checks — form validation, submit, success, my-requests, pending/reviewing/demo/curated/completed states, link safety, no automation wording on live pages, 404, lab page and Discover still work, no console errors.

**Fixed along the way**
- Measurements panel collapsed while typing once an error was fixed.
- Build warning: the file store made the bundler trace the whole project.

**Not yet tested**
- Real phones; deployed hosting (storage is local-only by design); real Taobao listing images (hotlink behaviour).

**Next**
- Database-backed store + contact field, then run the concierge with real shoppers.

## 2026-10-05 — Inspiration matching vertical slice

**Built**
- Inspiration page now takes **one** image → "Find matches" → results screen (replaces the multi-image board and text hand-off).
- `src/lib/matching/`: `analyzeInspiration()` (mock), `searchProducts()`, `rankProducts()`, `matchInspiration()`, shared types and vocabulary.
- `POST /api/match` route with type/size validation and clear errors (400/413/415/500).
- Results: uploaded image, "We think you're looking for…", attribute chips, copyable Taobao keywords, ranked matches with %, reason, demo price, save and link.
- Products gained `garment`, `silhouette`, `details`; 12 new demo products (28 total).
- Browser-side resize before upload (a 5.6 MB photo uploads as ~740 KB).
- Renamed Discover's keyword search to `searchCatalog()`.

**Verified**
- `npm run lint`, `npm run typecheck`, `npm run build` pass.
- API via curl: valid upload, determinism, missing file, wrong type, >5 MB, empty file, non-multipart, GET → all correct status codes.
- Headless browser (phone 390px + desktop 1366px): 56/56 checks — validation, preview, loading, server error + retry, network failure, results content, sorting, explanation, copy keyword, save, product link, resize, reset, Discover regression, no console errors.

**Fixed along the way**
- Network failures showed the browser's raw "Failed to fetch"; now a friendly message.
- Picking an invalid file while one was selected left the button saying "Try again"; validation errors no longer change the flow state.

**Not yet tested**
- Real phones, iPhone HEIC photos (not accepted yet), slow networks.

**Next**
- Replace the mock analysis with a real vision model.

## 2026-10-02 — Milestone 1 scaffold

**Built**
- Scaffolded with `create-next-app` (Next.js 16.3, React 19.2, Tailwind v4, TypeScript, ESLint).
- Pages: landing, discover, product details, inspiration board, saved; app-wide error and 404 pages.
- 16 fictional demo products with illustrated placeholders (`src/data/products.ts`).
- Keyword search with synonyms and ranking (`src/lib/search.ts`); category + aesthetic filters; URL-synced.
- Saved items via `localStorage` (`src/lib/saved-items.ts`).
- Inspiration board: drag-and-drop or picker, up to 8 images, type/size validation, local previews, describe-and-search hand-off.
- Mobile bottom tab bar; sticky desktop header with saved count.

**Verified**
- `npm run lint`, `npm run typecheck`, `npm run build` all pass.
- Automated headless-browser run (Chromium, phone 390px and desktop 1366px): 46/46 checks passed — page loads, no horizontal scroll, live search, URL sync, filters, empty state, save/unsave, saved persistence across reload, clear all, image preview, invalid-file error, remove image, inspiration → discover hand-off, no console errors.

**Fixed along the way**
- Next 16 renames: `next/image` `priority` → `loading="eager"`; error boundary `reset` → `retry`.
- Missing products returned 200 instead of 404 because of a loading screen; removed it (DECISIONS 010).
- Hero text column overflowed by 4px on phones; added `min-w-0`.

**Not yet tested**
- Real phones (iOS Safari, Android Chrome), especially photo picking from the camera roll and HEIC images.
- Screen readers.
- Real users.

**Next**
- Deploy a preview and run the first user tests.
