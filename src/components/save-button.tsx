"use client";

import { useSavedItems } from "@/lib/saved-items";
import { HeartIcon } from "./icons";

type Props = {
  productId: string;
  productTitle: string;
  variant?: "icon" | "full";
};

export function SaveButton({ productId, productTitle, variant = "icon" }: Props) {
  const { isSaved, toggle, ready } = useSavedItems();
  const saved = ready && isSaved(productId);

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={() => toggle(productId)}
        aria-pressed={saved}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm transition-colors ${
          saved
            ? "border-ink bg-ink text-paper"
            : "border-ink text-ink hover:bg-ink hover:text-paper"
        }`}
      >
        <HeartIcon filled={saved} width={18} height={18} />
        {saved ? "Saved" : "Save item"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        // The button sits on top of a card link — don't navigate.
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productTitle} from saved` : `Save ${productTitle}`}
      className="grid h-9 w-9 place-items-center rounded-full bg-card/90 text-ink shadow-sm backdrop-blur transition-transform active:scale-90"
    >
      <HeartIcon filled={saved} width={17} height={17} className={saved ? "text-accent" : ""} />
    </button>
  );
}
