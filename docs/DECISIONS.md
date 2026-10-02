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

### 008 — Inspiration uploads stay on the device
**Decision:** Images are previewed with `URL.createObjectURL` and never uploaded. The page says clearly that visual matching isn't built and asks the user to describe the look instead.
**Why:** No server, storage or AI costs, no privacy risk, and no pretending. When visual search arrives, the board will POST images to an API route (`src/app/api/...`) that calls the AI service server-side, so API keys never reach the browser.

### 009 — Prices shown in CNY only
**Decision:** Show `¥` amounts without converting to MYR/AUD.
**Why:** Conversion needs live exchange rates and adds false precision to fake prices. Revisit once real prices exist (and test which currency users expect).

### 010 — No product loading screen
**Decision:** Removed `products/[id]/loading.tsx`.
**Why:** Product pages are pre-built, so it never appeared — and it caused missing products to return HTTP 200 instead of 404. Re-add a loading state when product data is fetched live.
