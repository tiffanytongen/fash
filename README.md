# Taobao Fashion Discovery (working name)

An AI-assisted fashion discovery platform that makes Chinese fashion — especially Taobao — accessible to English-speaking shoppers in Malaysia and Australia.

> **Status: early prototype.** Every product is a fictional demo item with an illustrated placeholder image. There are no real Taobao listings, prices, ratings or seller scores, and visual (image) search is not built yet.

## What works today

| Page | Route | What it does |
| --- | --- | --- |
| Landing | `/` | Explains the product. The search box hands off to Discover. |
| Discover | `/discover` | Masonry product grid with live text search plus category and aesthetic filters. Filters are saved in the URL (`?q=&category=&style=`). |
| Product | `/products/[id]` | Image gallery, English description, demo price, sizes, sizing tip, details, save button. |
| Inspiration | `/inspiration` | Pin images (local preview only), describe the look and search by text. |
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
    inspiration/        Image board
    saved/              Saved items
    error.tsx           App-wide error screen
    not-found.tsx       App-wide 404
  components/           Reusable UI (cards, nav, gallery, board…)
  data/                 Mock catalogue + category/style lists
  lib/
    catalog.ts          Data access — the only place that touches product data
    search.ts           Keyword search + ranking (pure function)
    saved-items.ts      localStorage saved-items hook
  types/product.ts      The Product data model
docs/                   Product, roadmap, decisions, build log
```

## Documentation

- [docs/PRODUCT.md](docs/PRODUCT.md) — vision, users, problem, MVP
- [docs/ROADMAP.md](docs/ROADMAP.md) — milestones and future features
- [docs/DECISIONS.md](docs/DECISIONS.md) — architecture and product decisions
- [docs/BUILD_LOG.md](docs/BUILD_LOG.md) — dated development log

## Not affiliated

This project is not affiliated with Taobao or Alibaba Group.
