"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SearchIcon } from "./icons";

// Landing-page search. Sends the user to /discover?q=... where the real
// search happens, so there is only one search implementation.
export function StyleSearchForm({ placeholder }: { placeholder?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        router.push(q ? `/discover?q=${encodeURIComponent(q)}` : "/discover");
      }}
      className="flex w-full items-center gap-2 rounded-full border border-line bg-card p-1.5 pl-5 shadow-[0_8px_30px_-12px_rgba(27,26,23,0.18)]"
    >
      <SearchIcon className="shrink-0 text-muted" />
      <label htmlFor="style-search" className="sr-only">
        Describe your style
      </label>
      <input
        id="style-search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder ?? "Describe your style…"}
        className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-muted/70"
        autoComplete="off"
        enterKeyHint="search"
      />
      <button
        type="submit"
        className="h-11 shrink-0 rounded-full bg-ink px-5 text-sm text-paper transition-opacity hover:opacity-90"
      >
        Discover
      </button>
    </form>
  );
}
