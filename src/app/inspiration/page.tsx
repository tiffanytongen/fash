import type { Metadata } from "next";
import { InspirationBoard } from "@/components/inspiration-board";

export const metadata: Metadata = { title: "Inspiration" };

export default function InspirationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-14">
      <header className="mb-8 md:mb-10">
        <h1 className="font-serif text-4xl md:text-6xl">Inspiration board</h1>
        <p className="mt-2 max-w-lg text-sm text-muted md:text-base">
          Gather the looks you love, then describe them to find similar pieces.
        </p>
      </header>
      <InspirationBoard />
    </div>
  );
}
