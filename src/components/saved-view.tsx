"use client";

import Link from "next/link";
import type { Product } from "@/types/product";
import { useSavedItems } from "@/lib/saved-items";
import { ProductGrid, ProductGridSkeleton } from "./product-card";

export function SavedView({ products }: { products: Product[] }) {
  const { ids, ready, clear } = useSavedItems();

  // Wait for localStorage to be read so we don't flash the empty state.
  if (!ready) return <ProductGridSkeleton count={4} />;

  // Keep the order in which items were saved (newest first).
  const byId = new Map(products.map((p) => [p.id, p]));
  const saved = ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));

  if (saved.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line px-6 py-20 text-center">
        <p className="font-serif text-3xl">Nothing saved yet</p>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
          Tap the heart on any piece to keep it here. Saved items live in this browser only.
        </p>
        <Link
          href="/discover"
          className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-paper"
        >
          Start discovering
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between text-sm text-muted">
        <span>
          {saved.length} saved {saved.length === 1 ? "piece" : "pieces"}
        </span>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Remove all saved items?")) clear();
          }}
          className="underline underline-offset-4 hover:text-ink"
        >
          Clear all
        </button>
      </div>
      <ProductGrid products={saved} />
    </>
  );
}
