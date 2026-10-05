"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Category, Product, StyleTag } from "@/types/product";
import { CATEGORIES, STYLES } from "@/data/taxonomy";
import { searchCatalog } from "@/lib/search";
import { ProductGrid } from "./product-card";
import { CloseIcon, SearchIcon } from "./icons";

const SUGGESTIONS = [
  "linen dress for a humid day",
  "new chinese qipao",
  "oversized streetwear pants",
  "soft pink bows",
  "neutral office outfit",
];

const isCategory = (v: string | null): v is Category => CATEGORIES.some((c) => c.id === v);
const isStyle = (v: string | null): v is StyleTag => STYLES.some((s) => s.id === v);

// Reads filters from the URL. The `key` remounts the inner view whenever the
// URL changes (e.g. clicking a style link elsewhere), so state stays in sync.
export function DiscoverView({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category");
  const style = params.get("style");

  return (
    <DiscoverInner
      key={params.toString()}
      products={products}
      initialQuery={q}
      initialCategory={isCategory(category) ? category : null}
      initialStyle={isStyle(style) ? style : null}
    />
  );
}

type InnerProps = {
  products: Product[];
  initialQuery: string;
  initialCategory: Category | null;
  initialStyle: StyleTag | null;
};

function DiscoverInner({ products, initialQuery, initialCategory, initialStyle }: InnerProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [style, setStyle] = useState(initialStyle);

  // Results update instantly as you type.
  const results = useMemo(
    () => searchCatalog(products, { query, category, style }),
    [products, query, category, style],
  );

  // Write filters to the URL so the page can be shared or refreshed.
  const commit = (next: { query?: string; category?: Category | null; style?: StyleTag | null }) => {
    const merged = { query, category, style, ...next };
    const sp = new URLSearchParams();
    if (merged.query.trim()) sp.set("q", merged.query.trim());
    if (merged.category) sp.set("category", merged.category);
    if (merged.style) sp.set("style", merged.style);
    const qs = sp.toString();
    router.replace(qs ? `/discover?${qs}` : "/discover", { scroll: false });
  };

  const hasFilters = Boolean(query.trim() || category || style);

  return (
    <div>
      {/* Search box */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit({});
        }}
        className="flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 focus-within:border-ink"
      >
        <SearchIcon className="shrink-0 text-muted" />
        <label htmlFor="discover-search" className="sr-only">
          Describe your style
        </label>
        <input
          id="discover-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your style — e.g. breathable linen for work"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] outline-none placeholder:text-muted/70 [&::-webkit-search-cancel-button]:hidden"
          autoComplete="off"
          enterKeyHint="search"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              commit({ query: "" });
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-muted hover:text-ink"
            aria-label="Clear search"
          >
            <CloseIcon width={16} height={16} />
          </button>
        )}
      </form>

      {/* Category chips */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        <Chip
          active={!category}
          onClick={() => {
            setCategory(null);
            commit({ category: null });
          }}
        >
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            active={category === c.id}
            onClick={() => {
              const next = category === c.id ? null : c.id;
              setCategory(next);
              commit({ category: next });
            }}
          >
            {c.label}
          </Chip>
        ))}
      </div>

      {/* Style chips */}
      <div className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {STYLES.map((s) => (
          <Chip
            key={s.id}
            subtle
            active={style === s.id}
            onClick={() => {
              const next = style === s.id ? null : s.id;
              setStyle(next);
              commit({ style: next });
            }}
          >
            {s.label}
          </Chip>
        ))}
      </div>

      {/* Result summary */}
      <div className="mt-6 flex items-center justify-between text-sm text-muted" aria-live="polite">
        <span>
          {results.length} {results.length === 1 ? "piece" : "pieces"}
          {query.trim() && results.length > 0 && " · best matches first"}
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory(null);
              setStyle(null);
              router.replace("/discover", { scroll: false });
            }}
            className="underline underline-offset-4 hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="mt-4">
        {results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <EmptyState
            query={query}
            onSuggestion={(s) => {
              setQuery(s);
              setCategory(null);
              setStyle(null);
              commit({ query: s, category: null, style: null });
            }}
          />
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  subtle,
  onClick,
  children,
}: {
  active: boolean;
  subtle?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-9 shrink-0 whitespace-nowrap rounded-full border px-4 text-sm transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : subtle
            ? "border-transparent bg-line/50 text-ink hover:bg-line"
            : "border-line bg-card text-ink hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ query, onSuggestion }: { query: string; onSuggestion: (s: string) => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <p className="font-serif text-3xl">Nothing quite like that yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        {query.trim()
          ? `No demo pieces match “${query.trim()}” with these filters. Our catalogue is small for now — try a broader description.`
          : "No demo pieces match these filters. Try removing one."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onSuggestion(s)}
            className="rounded-full border border-line bg-card px-4 py-2 text-sm hover:border-ink"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
