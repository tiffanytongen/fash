import Link from "next/link";
import type { Product } from "@/types/product";
import { categoryLabel } from "@/data/taxonomy";
import { formatPrice } from "@/lib/format";
import { ProductArt } from "./product-art";
import { SaveButton } from "./save-button";
import { DemoBadge } from "./demo-badge";

export function ProductCard({ product, eager }: { product: Product; eager?: boolean }) {
  const tall = product.layout === "tall";

  return (
    <article className="group mb-4 break-inside-avoid md:mb-6">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative">
          <ProductArt
            image={product.images[0]}
            category={product.category}
            eager={eager}
            className={`rounded-2xl transition-transform duration-500 group-hover:scale-[1.01] ${
              tall ? "aspect-[3/4.4]" : "aspect-[3/3.6]"
            }`}
          />
          <DemoBadge className="absolute left-2.5 top-2.5" />
          <div className="absolute right-2.5 top-2.5">
            <SaveButton productId={product.id} productTitle={product.title} />
          </div>
        </div>
        <div className="mt-2.5 px-0.5">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
            {categoryLabel(product.category)}
          </p>
          <h3 className="mt-0.5 text-sm leading-snug text-ink">{product.title}</h3>
          <p className="mt-1 text-sm text-muted">
            {formatPrice(product.price)} <span className="text-xs">· demo price</span>
          </p>
        </div>
      </Link>
    </article>
  );
}

// CSS columns give a simple masonry (Pinterest-style) layout with no JS.
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="columns-2 gap-4 md:columns-3 md:gap-6 lg:columns-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} eager={i < 4} />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="columns-2 gap-4 md:columns-3 md:gap-6 lg:columns-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="mb-4 break-inside-avoid md:mb-6">
          <div
            className={`animate-pulse rounded-2xl bg-line/60 ${
              i % 3 === 0 ? "aspect-[3/4.4]" : "aspect-[3/3.6]"
            }`}
          />
          <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-line/60" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-line/60" />
        </div>
      ))}
    </div>
  );
}
