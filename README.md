# Taobao Fashion Discovery (working name)

An AI-assisted fashion discovery platform that makes Chinese fashion — especially Taobao — accessible to English-speaking shoppers in Malaysia and Australia.

> **Status: early prototype.** Every product is a fictional demo item with an illustrated placeholder image. There are no real Taobao listings, prices, ratings or seller scores. The image analysis step is **mocked**: it returns one of five sample looks, not a reading of your photo.

## What works today

| Page | Route | What it does |
| --- | --- | --- |
| Landing | `/` | Explains the product. The search box hands off to Discover. |
| Discover | `/discover` | Masonry product grid with live text search plus category and aesthetic filters. Filters are saved in the URL (`?q=&category=&style=`). |
| Product | `/products/[id]` | Image gallery, English description, demo price, sizes, sizing tip, details, save button. |
| Inspiration | `/inspiration` | Upload one image → interpretation, Taobao search keywords and ranked matches with a % score and a one-line reason. Analysis is mocked (see below). |
| Saved | `/saved` | Items you've hearted, stored in this browser's `localStorage`. |

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (design tokens in `src/app/globals.css`)
- **Local mock data** in `src/data/products.ts`, accessed only through `src/lib/catalog.ts` so it can be swapped for Supabase later

## Run it locally

Requires Node.js 20.9 or newer (developed on Node 22).

```bash
npm install
npm run dev          # http://localhost:3000
```

Other commands:

```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript, no output files
npm run build        # production build (also type-checks)
npm run start        # serve the production build
```

No environment variables are needed yet. See `.env.example` for what will be needed later.

## Project structure

```
src/
  app/                  Pages (one folder per route)
    page.tsx            Landing
    discover/           Search + grid
    products/[id]/      Product details (+ not-found)
    inspiration/        Upload one image → matches
    api/match/          POST endpoint: image in, analysis + ranked matches out
    saved/              Saved items
    error.tsx           App-wide error screen
    not-found.tsx       App-wide 404
  components/           Reusable UI (cards, nav, gallery, board…)
  data/                 Mock catalogue + category/style lists
  lib/
    catalog.ts          Data access — the only place that touches product data
    search.ts           Discover keyword search (searchCatalog)
    matching/           Inspiration pipeline (see below)
    resize-image.ts     Shrinks photos in the browser before upload
    saved-items.ts      localStorage saved-items hook
  types/product.ts      The Product data model
docs/                   Product, roadmap, decisions, build log
```

## Inspiration matching pipeline

```
image ──▶ analyzeInspiration() ──▶ searchProducts() ──▶ rankProducts() ──▶ results
          (MOCK: sample looks)     (demo catalogue)     (attribute overlap)
```

All in `src/lib/matching/`. Each step has one job and a typed input/output (`types.ts`), so it can be replaced on its own:

| Step | Today | Later |
| --- | --- | --- |
| `analyzeInspiration(image)` | Picks one of 5 sample looks (`src/data/mock-looks.ts`) from the image's fingerprint. **Does not look at the image.** | Multimodal vision model returning the same JSON shape |
| `searchProducts(analysis)` | Loose filter over the demo catalogue | Real product retrieval (e.g. Taobao / affiliate API) |
| `rankProducts(analysis, candidates)` | Weighted attribute overlap + one-line explanation | Embedding / visual similarity |

`matchInspiration()` in `index.ts` runs the three in order; `POST /api/match` calls it.

## Documentation

- [docs/PRODUCT.md](docs/PRODUCT.md) — vision, users, problem, MVP
- [docs/ROADMAP.md](docs/ROADMAP.md) — milestones and future features
- [docs/DECISIONS.md](docs/DECISIONS.md) — architecture and product decisions
- [docs/BUILD_LOG.md](docs/BUILD_LOG.md) — dated development log

## Not affiliated

This project is not affiliated with Taobao or Alibaba Group.
