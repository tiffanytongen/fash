import type { Metadata } from "next";
import { getAllProducts } from "@/lib/catalog";
import { SavedView } from "@/components/saved-view";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  // Saved ids live in the browser, so we pass the catalogue down and let the
  // client pick out the saved ones. With Supabase this becomes a user query.
  const products = await getAllProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-14">
      <header className="mb-6 md:mb-8">
        <h1 className="font-serif text-4xl md:text-6xl">Saved</h1>
        <p className="mt-2 text-sm text-muted md:text-base">Your shortlist, kept on this device.</p>
      </header>
      <SavedView products={products} />
    </div>
  );
}
