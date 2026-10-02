import Link from "next/link";
import { getAllProducts } from "@/lib/catalog";
import { STYLES } from "@/data/taxonomy";
import { ProductGrid } from "@/components/product-card";
import { ProductArt } from "@/components/product-art";
import { StyleSearchForm } from "@/components/style-search-form";
import { ArrowRightIcon } from "@/components/icons";

const STEPS = [
  {
    n: "01",
    title: "Bring your inspiration",
    body: "Saw a look on Pinterest, Instagram or Xiaohongshu? Describe it in your own words, or pin the images to an inspiration board.",
  },
  {
    n: "02",
    title: "Discover in English",
    body: "Browse curated Chinese fashion with English titles, descriptions and the details that matter before you buy.",
  },
  {
    n: "03",
    title: "Shop with confidence",
    body: "Sizing notes written for Malaysian and Australian shoppers, and a link to the original listing when it's available.",
  },
];

export default async function HomePage() {
  const products = await getAllProducts();
  const heroPicks = [products[0], products[5], products[4]];

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-14 pt-10 md:grid-cols-[1.1fr_1fr] md:items-center md:px-8 md:pb-24 md:pt-20">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            Chinese fashion, made accessible
          </p>
          <h1 className="mt-4 font-serif text-[44px] leading-[1.02] tracking-tight md:text-7xl">
            Your Pinterest board, <span className="italic">found</span> on Taobao.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted md:text-base">
            Discover Chinese fashion in English — curated pieces, clear descriptions and sizing
            help for shoppers in Malaysia and Australia.
          </p>
          <div className="mt-8 max-w-lg">
            <StyleSearchForm placeholder="e.g. linen dress for a humid day" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <Link href="/inspiration" className="underline decoration-line underline-offset-4 hover:decoration-ink">
              Or upload inspiration images
            </Link>
            <Link href="/discover" className="text-muted hover:text-ink">
              Browse everything →
            </Link>
          </div>
        </div>

        {/* Editorial collage of three products */}
        <div className="grid grid-cols-[1.2fr_1fr] gap-3 md:gap-4" aria-hidden>
          <ProductArt
            image={heroPicks[0].images[0]}
            category={heroPicks[0].category}
            eager
            className="row-span-2 aspect-[3/4.6] rounded-[28px]"
          />
          <ProductArt
            image={heroPicks[1].images[0]}
            category={heroPicks[1].category}
            eager
            className="aspect-square rounded-[28px]"
          />
          <ProductArt
            image={heroPicks[2].images[0]}
            category={heroPicks[2].category}
            eager
            className="aspect-square rounded-[28px]"
          />
        </div>
      </section>

      {/* ── Styles ───────────────────────────────────────────── */}
      <section className="border-y border-line bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
          <h2 className="font-serif text-3xl md:text-4xl">Shop by aesthetic</h2>
          <ul className="no-scrollbar -mx-4 mt-6 flex snap-x gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 lg:grid-cols-7">
            {STYLES.map((s) => (
              <li key={s.id} className="snap-start">
                <Link
                  href={`/discover?style=${s.id}`}
                  className="flex h-full w-40 flex-col justify-between rounded-2xl border border-line bg-paper p-4 transition-colors hover:border-ink md:w-auto"
                >
                  <span className="font-serif text-xl">{s.label}</span>
                  <span className="mt-6 text-xs leading-snug text-muted">{s.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-24">
        <h2 className="max-w-xl font-serif text-3xl leading-tight md:text-5xl">
          From screenshot to shopping bag, without the language barrier.
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-ink pt-5">
              <span className="text-xs tracking-[0.2em] text-muted">{step.n}</span>
              <h3 className="mt-2 font-serif text-2xl">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Featured ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl">This week&apos;s edit</h2>
            <p className="mt-1 text-sm text-muted">Demo products — illustrations, not real listings.</p>
          </div>
          <Link href="/discover" className="hidden items-center gap-1.5 text-sm md:inline-flex">
            View all <ArrowRightIcon width={16} height={16} />
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 8)} />
        <div className="mt-4 text-center md:hidden">
          <Link
            href="/discover"
            className="inline-flex h-12 items-center rounded-full border border-ink px-6 text-sm"
          >
            View all pieces
          </Link>
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="mx-4 mb-16 rounded-[32px] bg-ink px-6 py-14 text-center text-paper md:mx-auto md:max-w-6xl md:py-20">
        <h2 className="mx-auto max-w-lg font-serif text-4xl leading-tight md:text-5xl">
          Have a board full of looks you can&apos;t find?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm text-paper/70">
          Pin your inspiration and tell us what you love. Visual matching is coming — for now we
          search by your description.
        </p>
        <Link
          href="/inspiration"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-paper px-7 text-sm text-ink"
        >
          Start an inspiration board
        </Link>
      </section>
    </>
  );
}
