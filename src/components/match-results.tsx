"use client";

import Link from "next/link";
import { useState } from "react";
import type { MatchResponse, RankedMatch } from "@/lib/matching/types";
import { formatPrice } from "@/lib/format";
import { ProductArt } from "./product-art";
import { SaveButton } from "./save-button";

type Props = {
  imageUrl: string;
  imageName: string;
  result: MatchResponse;
  onReset: () => void;
};

export function MatchResults({ imageUrl, imageName, result, onReset }: Props) {
  const { analysis, interpretation, matches, isMockAnalysis } = result;
  const attributes = [
    ...analysis.garmentTypes,
    ...analysis.colors,
    ...analysis.silhouette,
    ...analysis.notableDetails,
    ...analysis.materials,
  ].filter((a) => a && a !== "unknown");

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-14">
      {/* ── Your inspiration + our interpretation ─────────────── */}
      <aside className="min-w-0 md:sticky md:top-24 md:self-start">
        <div className="overflow-hidden rounded-[28px] bg-line/50">
          {/* next/image can't optimise local blob: URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={`Your inspiration: ${imageName}`} className="block max-h-[300px] w-full object-cover md:max-h-[480px]" />
        </div>

        {isMockAnalysis && (
          <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent" role="note">
            <strong className="font-medium">Demo analysis.</strong> This is a sample look, not read from your
            photo — real image understanding is the next step.
          </p>
        )}

        <h2 className="mt-6 text-xs uppercase tracking-[0.14em] text-muted">We think you&apos;re looking for…</h2>
        <p className="mt-2 font-serif text-2xl leading-snug md:text-3xl">{interpretation}</p>

        {attributes.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Detected attributes">
            {attributes.map((a) => (
              <li key={a} className="rounded-full bg-card px-3 py-1 text-xs text-ink">
                {a}
              </li>
            ))}
          </ul>
        )}

        {analysis.taobaoSearchKeywords.length > 0 && (
          <section className="mt-6 rounded-3xl bg-card p-5">
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted">Taobao search keywords</h3>
            <p className="mt-1 text-xs text-muted">Copy these into Taobao to search for yourself.</p>
            <ul className="mt-3 space-y-2">
              {analysis.taobaoSearchKeywords.map((k) => (
                <KeywordRow key={k} keyword={k} />
              ))}
            </ul>
          </section>
        )}

        <button
          type="button"
          onClick={onReset}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-ink text-sm hover:bg-ink hover:text-paper"
        >
          Try another image
        </button>
      </aside>

      {/* ── Ranked matches ──────────────────────────────────────── */}
      <section aria-labelledby="matches-heading" className="min-w-0">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="matches-heading" className="font-serif text-3xl md:text-4xl">
            Closest matches
          </h2>
          <span className="text-sm text-muted">{matches.length} found</span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Match % compares garment, colour, shape, details and style — not the photo itself. All items are demo
          products.
        </p>

        {matches.length > 0 ? (
          <ol className="mt-6 space-y-4">
            {matches.map((m, i) => (
              <MatchCard key={m.product.id} match={m} rank={i + 1} />
            ))}
          </ol>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
            <p className="font-serif text-3xl">No close matches yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
              Our demo catalogue is small. Try the Taobao keywords, or browse everything.
            </p>
            <Link
              href="/discover"
              className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-paper"
            >
              Browse the catalogue
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function MatchCard({ match, rank }: { match: RankedMatch; rank: number }) {
  const { product, percent, explanation } = match;
  return (
    <li className="relative flex gap-4 rounded-3xl bg-card p-3 pr-4 md:gap-5">
      <Link href={`/products/${product.id}`} className="shrink-0" tabIndex={-1} aria-hidden>
        <ProductArt
          image={product.images[0]}
          category={product.category}
          className="h-36 w-28 rounded-2xl md:h-40 md:w-32"
        />
      </Link>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm">
            <span className="font-medium text-ink">{percent}% match</span>
            <span className="text-muted"> · #{rank}</span>
          </p>
          <SaveButton productId={product.id} productTitle={product.title} />
        </div>
        <h3 className="mt-1 font-serif text-xl leading-tight">
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-sm leading-snug text-ink/80">{explanation}</p>
        <p className="mt-2 text-xs text-muted">
          {formatPrice(product.price)} · demo price · {product.seller.name}
        </p>
        {/* Visual similarity bar */}
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="h-full rounded-full bg-ink" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </li>
  );
}

function KeywordRow({ keyword }: { keyword: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-paper px-4 py-2.5">
      <span lang="zh" className="min-w-0 truncate text-[15px]">
        {keyword}
      </span>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(keyword);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Clipboard can be blocked (e.g. non-HTTPS). The text is still selectable.
          }
        }}
        className="shrink-0 text-xs text-muted underline underline-offset-4 hover:text-ink"
        aria-label={`Copy ${keyword}`}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </li>
  );
}
