# Taobao Fashion Discovery (working name)

An AI-assisted fashion discovery platform that makes Chinese fashion — especially Taobao — accessible to English-speaking shoppers in Malaysia and Australia.

> **Current MVP: manual concierge curation.** A shopper sends one inspiration image and a few preferences; a person hand-picks 3–5 Taobao items and adds them to the shopper's request page. Nothing is matched automatically.
>
> **Core validation question:** *Will users value receiving a curated shortlist of Taobao items based on their inspiration?*
>
> **Long-term direction:** a personalised inspiration-to-Taobao discovery engine. Future layers: (1) curated shop database, (2) automated retrieval, (3) personalisation, (4) swipe taste onboarding, (5) sizing / fit assistant. See [docs/PRODUCT.md](docs/PRODUCT.md).
>
> Discover and product pages use a **fictional demo catalogue**. Request storage is **local-only** for now.

## What works today

| Page | Route | What it does |
| --- | --- | --- |
| Landing | `/` | Explains the product. The search box hands off to Discover. |
| Discover | `/discover` | Masonry product grid with live text search plus category and aesthetic filters. Filters are saved in the URL (`?q=&category=&style=`). |
| Product | `/products/[id]` | Image gallery, English description, demo price, sizes, sizing tip, details, save button. |
| Request a shortlist | `/inspiration` | **Main flow.** One image + note, budget, size, measurements, fit, "Find this"/"Find my vibe", notes → request saved → success screen with request ID. |
| Request page | `/requests/[id]` | Inspiration image, preferences, status, then the hand-curated picks (or a pending state). |
| Auto-match (lab) | `/labs/auto-match` | Experimental automated matcher (mocked analysis, demo catalogue). Not linked; kept for future automation. |
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
    inspiration/        Concierge request form
    requests/[id]/      Request page: pending state or curated picks
    labs/auto-match/    Experimental automated matcher (not linked)
    api/requests/       POST: create a request · [id]/image: GET its image
    api/match/          POST: automated matcher (used by the lab page)
    saved/              Saved items
    error.tsx           App-wide error screen
    not-found.tsx       App-wide 404
  components/           Reusable UI (cards, nav, gallery, board…)
  data/                 Mock catalogue + category/style lists
  lib/
    catalog.ts          Data access — the only place that touches product data
    search.ts           Discover keyword search (searchCatalog)
    requests/           Concierge: store (dev file store), validation, my-requests
    matching/           Automated pipeline for later (see below)
    resize-image.ts     Shrinks photos in the browser before upload
    saved-items.ts      localStorage saved-items hook
  types/product.ts      The Product data model (demo catalogue)
  types/curation.ts     CurationRequest, CuratedResult, CuratedProduct
scripts/curate.mjs      Manual curation helper (npm run curate)
docs/                   Product, roadmap, decisions, build log
```

## Curating a request (manual workflow)

Requests are stored locally in `.data/` (git-ignored) while you run `npm run dev` or `npm run start`.

```bash
npm run curate -- list                         # see incoming requests
npm run curate -- show <id>                    # details + path to the image
npm run curate -- status <id> reviewing        # shopper sees "Being curated"
cp scripts/curation-template.json my-picks.json  # fill in 3–5 real picks
npm run curate -- attach <id> my-picks.json    # shopper sees the shortlist
npm run curate -- status <id> completed
npm run curate -- demo <id>                    # (dev) attach a clearly labelled demo shortlist
```

Each pick needs a real `https://` Taobao/Tmall link. The helper checks this and the 3–5 count. Use `--force` to replace an existing shortlist.

> ⚠️ This storage does not work on serverless hosting (e.g. Vercel). Real users need a database first; only `src/lib/requests/store.ts` and the helper need to change.

## Automated matching pipeline (future, in the lab)

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
