import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductById, getRelatedProducts } from "@/lib/catalog";
import { categoryLabel, styleLabel } from "@/data/taxonomy";
import { formatPrice } from "@/lib/format";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-card";
import { SaveButton } from "@/components/save-button";
import { ArrowLeftIcon } from "@/components/icons";

type Props = { params: Promise<{ id: string }> };

// Pre-build a page for every product in the catalogue.
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return product
    ? { title: product.title, description: product.description }
    : { title: "Product not found" };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 md:px-8 md:pt-10">
      <Link
        href="/discover"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeftIcon width={16} height={16} /> Back to discover
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-14">
        <ProductGallery images={product.images} category={product.category} />

        <div className="md:py-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted">
            <span>{categoryLabel(product.category)}</span>
            <span aria-hidden>·</span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">Demo product</span>
          </div>

          <h1 className="mt-3 font-serif text-4xl leading-tight md:text-5xl">{product.title}</h1>
          {product.originalTitle && (
            <p className="mt-1 text-sm text-muted" lang="zh">
              {product.originalTitle}
            </p>
          )}

          <p className="mt-5 text-2xl">
            {formatPrice(product.price)}
            <span className="ml-2 align-middle text-xs text-muted">illustrative demo price (CNY)</span>
          </p>

          <p className="mt-6 leading-relaxed text-ink/85">{product.description}</p>

          {/* Sizes */}
          <section className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.14em] text-muted">Sizes</h2>
            {product.sizes ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <li
                    key={size}
                    className="min-w-12 rounded-full border border-line bg-card px-4 py-2 text-center text-sm"
                  >
                    {size}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">No size information for this item.</p>
            )}
            {product.sizeNote && (
              <p className="mt-3 rounded-2xl bg-card px-4 py-3 text-sm text-muted">
                <span className="text-ink">Sizing tip:</span> {product.sizeNote}
              </p>
            )}
          </section>

          {/* Details */}
          <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-line pt-6 text-sm">
            <dt className="text-muted">Style</dt>
            <dd>{product.styles.map(styleLabel).join(", ")}</dd>
            <dt className="text-muted">Colour</dt>
            <dd className="capitalize">{product.colors.join(", ")}</dd>
            <dt className="text-muted">Material</dt>
            <dd className="capitalize">{product.materials.join(", ")}</dd>
            <dt className="text-muted">Seller</dt>
            <dd>
              {product.seller.name}
              {product.seller.location && <span className="text-muted"> · {product.seller.location}</span>}
              <span className="text-muted"> (fictional)</span>
            </dd>
          </dl>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SaveButton productId={product.id} productTitle={product.title} variant="full" />
            {product.sourceUrl ? (
              <a
                href={product.sourceUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-6 text-sm text-paper"
              >
                View original listing
              </a>
            ) : (
              <span
                aria-disabled
                className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full bg-line px-6 text-sm text-muted"
              >
                Original listing unavailable
              </span>
            )}
          </div>
          {!product.sourceUrl && (
            <p className="mt-3 text-xs text-muted">
              This is a demo item, so there&apos;s no real Taobao listing to link to.
            </p>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16 border-t border-line pt-10 md:mt-24">
          <h2 className="mb-6 font-serif text-3xl">You might also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
