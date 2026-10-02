import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-serif text-5xl">404</p>
      <p className="mt-3 text-sm text-muted">We couldn&apos;t find that page.</p>
      <Link
        href="/"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-paper"
      >
        Back home
      </Link>
    </div>
  );
}
