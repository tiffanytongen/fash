import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-serif text-4xl">This piece has gone</p>
      <p className="mt-3 text-sm text-muted">
        We couldn&apos;t find that product. It may have been removed from the demo catalogue.
      </p>
      <Link
        href="/discover"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-paper"
      >
        Keep discovering
      </Link>
    </div>
  );
}
