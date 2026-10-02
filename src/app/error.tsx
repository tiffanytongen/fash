"use client";

// Catches unexpected errors in any page and offers a retry.
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-serif text-4xl">Something went wrong</p>
      <p className="mt-3 text-sm text-muted">
        Sorry — this page didn&apos;t load properly. Please try again.
      </p>
      {error.digest && <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p>}
      <button
        type="button"
        onClick={() => retry()}
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-paper"
      >
        Try again
      </button>
    </div>
  );
}
