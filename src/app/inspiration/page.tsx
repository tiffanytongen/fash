import type { Metadata } from "next";
import { RequestForm } from "@/components/request-form";

export const metadata: Metadata = { title: "Request a shortlist" };

// Concierge MVP: shoppers send one look + preferences, a person curates
// 3–5 Taobao picks. The automated matching prototype lives at /labs/auto-match.

export default function InspirationPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-14">
      <header className="mx-auto mb-10 max-w-xl md:mb-14">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Personal curation · early access</p>
        <h1 className="mt-3 font-serif text-4xl leading-[1.05] md:text-6xl">Send us a look. We&apos;ll find it on Taobao.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">
          Share one inspiration image and a few preferences. A real person searches Taobao for you and
          hand-picks 3–5 options, with notes on the shop, reviews and sizing.
        </p>
      </header>
      <RequestForm />
    </div>
  );
}
