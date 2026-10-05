# Decisions

Short notes on *why* things are the way they are. Add a new entry whenever we make a choice someone might question later.

---

### 001 — Next.js App Router, TypeScript, Tailwind
**Decision:** Use the official `create-next-app` scaffold (Next.js 16, React 19, Tailwind v4).
**Why:** One framework covers pages, API routes (for future AI calls) and deployment. TypeScript catches mistakes early. Tailwind keeps styling next to the markup, which is easier to follow than separate CSS files.

### 002 — All product data goes through `src/lib/catalog.ts`
**Decision:** Pages never import the mock data directly. They call `getAllProducts()`, `getProductById()` etc.
**Why:** When we move to Supabase, only this one file changes. The functions are already `async`, so callers won't need edits.

**Planned Supabase table** (mirrors `src/types/product.ts`):
```
products(id text pk, title text, original_title text, description text,
         category text, styles text[], colors text[], materials text[], tags text[],
         price_amount numeric null, price_currency text, sizes text[] null, size_note text,
         seller_name text, seller_location text, source_url text null,
         images jsonb, layout text, created_at timestamptz)
```

### 003 — Simple keyword search, as a pure function
**Decision:** `src/lib/search.ts` tokenises the query, removes filler words, expands a small synonym list and scores matches (title > category/style/colour/material > description/tags).
**Why:** It's predictable, instant, free and easy to understand. It runs in the browser so results update as you type. Because the UI only calls `searchProducts()`, we can later replace it with Postgres full-text search or embeddings.
**Trade-off:** It doesn't understand meaning — "something for a wedding" only works if those words appear in the data.

### 004 — Filters live in the URL
**Decision:** Discover reads and writes `?q=`, `?category=`, `?style=`.
**Why:** Results can be shared, bookmarked and refreshed, and the landing page and inspiration board can link straight to a search.

### 005 — Illustrated placeholders instead of photos
**Decision:** Product images have `src: null` and render a gradient with a simple garment line drawing.
**Why:** We don't have permission to use real product photography. The `ProductArt` component already supports real `src` URLs when we have licensed images.

### 006 — Honest demo labelling
**Decision:** Every card says "Demo"; prices say "demo price"; sellers say "(fictional)"; there's no fake "View on Taobao" link.
**Why:** Users in tests should react to the experience, not be misled. It also avoids inventing real-looking URLs, ratings or trust scores.

### 007 — Saved items in `localStorage`
**Decision:** Store an array of product ids under `tfd:saved-items:v1` using a `useSyncExternalStore` hook.
**Why:** No accounts needed yet. The hook keeps tabs in sync and avoids hydration errors. The `v1` in the key lets us migrate the format later.

### 008 — Inspiration uploads stay on the device *(superseded by 012)*
**Decision:** Images are previewed with `URL.createObjectURL` and never uploaded. The page says clearly that visual matching isn't built and asks the user to describe the look instead.
**Why:** No server, storage or AI costs, no privacy risk, and no pretending. When visual search arrives, the board will POST images to an API route (`src/app/api/...`) that calls the AI service server-side, so API keys never reach the browser.

### 009 — Prices shown in CNY only
**Decision:** Show `¥` amounts without converting to MYR/AUD.
**Why:** Conversion needs live exchange rates and adds false precision to fake prices. Revisit once real prices exist (and test which currency users expect).

### 010 — No product loading screen
**Decision:** Removed `products/[id]/loading.tsx`.
**Why:** Product pages are pre-built, so it never appeared — and it caused missing products to return HTTP 200 instead of 404. Re-add a loading state when product data is fetched live.

### 011 — Inspiration matching as three replaceable steps
**Decision:** `analyzeInspiration()` → `searchProducts()` → `rankProducts()` in `src/lib/matching/`, joined by typed contracts (`types.ts`) and run by `matchInspiration()`.
**Why:** Each step will be replaced by something very different (vision model, Taobao retrieval, embeddings). Keeping them separate means each swap touches one file.
**Rename:** the old Discover keyword search was also called `searchProducts()`. It is now `searchCatalog()` to avoid confusion.

### 012 — The image goes to our server (not stored)
**Decision:** The browser shrinks the image (max 1280px JPEG) and POSTs it to `/api/match`. The route keeps it in memory for the request only.
**Why:** A real vision model must be called server-side so the API key stays secret. Doing the upload now means swapping in the model doesn't change the UI. Shrinking keeps uploads fast and under hosting limits (Vercel functions accept ~4.5 MB). We use a route handler, not a Server Action, because Server Actions cap bodies at 1 MB by default.

### 013 — Honest mock analysis
**Decision:** The mock returns one of five sample looks chosen by a SHA-256 fingerprint of the image (same image → same look). The response carries `isMockAnalysis: true` and the results show a "Demo analysis" label.
**Why:** It lets us test the whole results experience without paying for AI, without pretending we read the photo.

### 014 — Ranking by weighted attribute overlap
**Decision:** Per dimension score, then a weighted average: garment 35%, colour 20%, silhouette 15%, details 15%, style 10%, material 5%. Set dimensions use the *overlap coefficient* (shared ÷ smaller set), because an outfit analysis lists several garments while a product is one. Dimensions the analysis leaves empty or "unknown" are skipped. Words are normalised first (`vocabulary.ts`: "minimalist" → minimal, charcoal → grey). Matches under 30% are hidden; display is capped at 99%.
**Why:** Simple, explainable, and every point of the score can be traced to a reason shown to the user.
**Trade-off:** It's only as good as the metadata. It can't see that two items *look* alike.

### 015 — Pivot the MVP to a manual concierge
**Decision:** The main flow is now *request → a person curates → shopper sees shortlist*. Automated matching moved to `/labs/auto-match` (code kept, not linked).
**Why:** The riskiest assumption is whether people want curated Taobao picks at all. A concierge tests that with real recommendations, before we spend on AI and retrieval.
**Rule:** Nothing on the live flow may imply automated analysis or matching.

### 016 — One output shape for manual and automated curation
**Decision:** `CuratedResult` (in `src/types/curation.ts`) is what the shopper sees, whoever made it. It has `source: "manual" | "assisted" | "automated"`.
**Why:** Automation can be added behind the same request page. First as suggestions to the curator ("assisted"), later end-to-end ("automated"). Every manual shortlist we create is also labelled training and evaluation data for that future system.

### 017 — Development-only file store
**Decision:** `src/lib/requests/store.ts` saves requests, images and shortlists as files in `.data/` (git-ignored). `scripts/curate.mjs` edits the same files.
**Why:** No database yet, by request. It's enough to prove the flow locally.
**Limits:** It does not work on serverless hosting (read-only filesystem; the API returns 503). Real users need a database before launch. Only `store.ts` (and the CLI) need to change. Paths are marked `turbopackIgnore` so deploy builds don't bundle the whole project.

### 018 — Private-by-link request pages
**Decision:** Request IDs are random (`req_` + 16 hex characters). Anyone with the link can see the request and its image; pages are `noindex`.
**Why:** No accounts yet. Unguessable links are the simplest access control. Revisit when accounts or contact details are added.

### 019 — Curation helper instead of an admin panel
**Decision:** A small CLI (`npm run curate -- list | show | status | attach | demo`) rather than an admin UI. Shortlists are JSON files copied from `scripts/curation-template.json`. The helper requires 3–5 products and real https Taobao/Tmall links (only items marked `isDemo` may omit them).
**Why:** Fastest thing that works for one curator, and nothing to secure. Build an admin UI only if curation volume justifies it.
