# Build log

Newest entries at the top. Keep each entry short: what changed, what we learned, what's next.

---

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
