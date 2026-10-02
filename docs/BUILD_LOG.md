# Build log

Newest entries at the top. Keep each entry short: what changed, what we learned, what's next.

---

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
