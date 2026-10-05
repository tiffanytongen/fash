import Link from "next/link";

export default function RequestNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-serif text-4xl">We can&apos;t find that request</p>
      <p className="mt-3 text-sm text-muted">
        Check the link is complete. Requests are stored on the device that runs this prototype, so a link from
        another computer won&apos;t work yet.
      </p>
      <Link
        href="/inspiration"
        className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm text-paper"
      >
        Send a new request
      </Link>
    </div>
  );
}
