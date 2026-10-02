import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllProducts } from "@/lib/catalog";
import { DiscoverView } from "@/components/discover-view";
import { ProductGridSkeleton } from "@/components/product-card";

export const metadata: Metadata = { title: "Discover" };

export default async function DiscoverPage() {
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-14">
      <header className="mb-6 md:mb-8">
        <h1 className="font-serif text-4xl md:text-6xl">Discover</h1>
        <p className="mt-2 max-w-lg text-sm text-muted md:text-base">
          Describe what you&apos;re after in your own words. This is a small demo catalogue —
          every item is fictional and illustrated.
        </p>
      </header>

      {/* useSearchParams needs a Suspense boundary; the skeleton is the loading state. */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <DiscoverView products={products} />
      </Suspense>
    </div>
  );
}
