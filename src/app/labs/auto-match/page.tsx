import type { Metadata } from "next";
import { InspirationBoard } from "@/components/inspiration-board";

// Experimental: the automated inspiration → match prototype (mocked analysis,
// demo catalogue). Kept for future automation work; not linked from the site
// and not part of the current concierge service.

export const metadata: Metadata = {
  title: "Auto-match (experimental)",
  robots: { index: false, follow: false },
};

export default function AutoMatchLabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-14">
      <header className="mb-8 md:mb-10">
        <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
          Internal experiment — not the live service
        </p>
        <h1 className="mt-4 font-serif text-4xl md:text-6xl">Auto-match prototype</h1>
        <p className="mt-2 max-w-lg text-sm text-muted md:text-base">
          The future automated pipeline: analyse → search → rank. Image analysis is mocked and all products are
          fictional demo items.
        </p>
      </header>
      <InspirationBoard />
    </div>
  );
}
