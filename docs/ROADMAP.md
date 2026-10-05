# Roadmap

Build small, test with real people, then build the next thing.

## Milestone 1 — Clickable discovery prototype ✅ (current)

Goal: a real, runnable prototype we can put in front of users.

- [x] Landing, Discover, Product, Inspiration, Saved pages
- [x] Mock catalogue (16 demo items, illustrated placeholders)
- [x] Working text search with category + aesthetic filters, URL-synced
- [x] Local image previews on the inspiration board
- [x] Saved items in `localStorage`
- [x] Loading, empty, error and not-found states
- [ ] Deploy a preview (e.g. Vercel) so testers can open it on their phones
- [ ] Run 5–10 user tests (see assumptions in PRODUCT.md)

## Milestone 1.5 — Inspiration matching vertical slice ✅

- [x] One-image upload with preview, validation and browser-side resizing
- [x] `POST /api/match` running analyse → search → rank
- [x] Mocked `analyzeInspiration()` (5 sample looks), clearly labelled
- [x] Results: interpretation, copyable Taobao keywords, ranked matches with % and reason
- [x] Catalogue extended to 28 items with garment, silhouette and details metadata
- [ ] Replace the mock with a real vision model (first item of Milestone 3)

## Milestone 2 — Real, curated catalogue

Goal: replace demo items with a small set of real, permission-cleared products.

- [ ] Choose 20–50 real products by hand (with seller permission or via an affiliate programme)
- [ ] Move the catalogue to Supabase (`products` table), keeping `src/lib/catalog.ts` as the only access point
- [ ] Store licensed images in Supabase Storage; enable `next/image` remote patterns
- [ ] Real original-listing links (affiliate links where available)
- [ ] Simple admin flow for adding products (even a Supabase dashboard is fine at first)
- [ ] Basic analytics: searches, saves, outbound clicks

## Milestone 3 — First AI feature

Goal: one AI feature that clearly helps, chosen from user-test learnings.

Options (pick one):
- [ ] **Real image analysis** — swap the mock `analyzeInspiration()` for a vision model (the pipeline and UI already exist)
- [ ] **Visual search** — image embeddings + vector search to replace attribute ranking
- [ ] **Smarter text search** — semantic search over descriptions (text embeddings)
- [ ] **Translation pipeline** — turn Chinese listing text into clean English titles, descriptions and size notes

## Later possibilities (not committed)

- Accounts and synced saved items
- Personalised recommendations
- Trusted-seller curation (only with a transparent, real methodology)
- Size recommendations from user measurements
- Affiliate partnerships, premium styling, brand partnerships
