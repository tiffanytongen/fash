import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getCuratedResult, getRequest } from "@/lib/requests/store";
import { CuratedProductCard } from "@/components/curated-product-card";
import {
  FIT_LABELS,
  MATCH_MODE_LABELS,
  STATUS_LABELS,
  type CurationRequest,
  type RequestStatus,
} from "@/types/curation";

export const metadata: Metadata = {
  title: "Your curated picks",
  // Request pages are private-by-link; keep them out of search engines.
  robots: { index: false, follow: false },
};

export default async function RequestPage({ params }: PageProps<"/requests/[id]">) {
  // Read fresh data on every visit; otherwise the first (pending) render
  // would be cached and curated picks would never appear.
  await connection();

  const { id } = await params;
  const request = await getRequest(id);
  if (!request) notFound();
  const result = await getCuratedResult(id);
  const products = result?.products ?? [];
  const hasPicks = products.length > 0;
  const hasDemo = products.some((p) => p.isDemo);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-14">
      <header className="mb-8 md:mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Request <code className="normal-case tracking-normal">{request.id}</code>
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-6xl">
          {hasPicks ? "Your curated picks" : "We're on it"}
        </h1>
      </header>

      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] md:gap-14">
        {/* ── The request ─────────────────────────────────────── */}
        <aside className="min-w-0 md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-[28px] bg-line/50">
            {/* Served by our own API from local storage. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/requests/${request.id}/image`}
              alt="Your inspiration image"
              className="block max-h-[300px] w-full object-cover md:max-h-[460px]"
            />
          </div>
          <StatusTimeline status={request.status} />
          <Preferences request={request} />
        </aside>

        {/* ── The shortlist ───────────────────────────────────── */}
        <section className="min-w-0" aria-labelledby="picks-heading">
          {hasPicks ? (
            <>
              <h2 id="picks-heading" className="sr-only">
                Curated picks
              </h2>
              <div className="mb-6 rounded-3xl border border-line px-5 py-4 text-sm">
                <p className="text-ink">
                  {products.length} {products.length === 1 ? "pick" : "picks"} hand-selected
                  {result?.curatorName ? ` by ${result.curatorName}` : ""} on{" "}
                  {new Date(result!.curatedAt).toLocaleDateString("en-AU", { day: "numeric", month: "long" })}.
                </p>
                {result?.summary && <p className="mt-2 leading-relaxed text-ink/80">{result.summary}</p>}
                <p className="mt-2 text-xs text-muted">
                  Chosen by a person, not an algorithm. Prices and stock are as checked at curation time — confirm on
                  Taobao before buying.
                </p>
              </div>
              {hasDemo && (
                <p role="note" className="mb-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent">
                  <strong className="font-medium">Development demo.</strong> These are placeholder picks for testing
                  the page — they weren&apos;t chosen for your image and aren&apos;t real listings.
                </p>
              )}
              <ol className="space-y-6">
                {products.map((p, i) => (
                  <li key={p.id}>
                    <CuratedProductCard product={p} index={i} />
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <PendingState status={request.status} />
          )}
        </section>
      </div>
    </div>
  );
}

// ── Pieces ───────────────────────────────────────────────────────────────────

const STEPS: RequestStatus[] = ["submitted", "reviewing", "curated"];

function StatusTimeline({ status }: { status: RequestStatus }) {
  const current = status === "completed" ? STEPS.length : STEPS.indexOf(status);
  return (
    <div className="mt-6">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">
        Status · <span className="text-ink">{STATUS_LABELS[status]}</span>
      </p>
      <ol className="mt-3 flex items-center gap-2" aria-label="Request progress">
        {STEPS.map((step, i) => (
          <li key={step} className="flex flex-1 flex-col gap-1.5">
            <span className={`h-1 rounded-full ${i <= current ? "bg-ink" : "bg-line"}`} aria-hidden />
            <span className={`text-[11px] ${i <= current ? "text-ink" : "text-muted"}`}>
              {STATUS_LABELS[step]}
              {i === current && status !== "completed" && <span className="sr-only"> (current)</span>}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Preferences({ request }: { request: CurationRequest }) {
  const { budget, measurements } = request;
  const money = (n: number) => `${budget.currency === "MYR" ? "RM" : "A$"}${n}`;
  const measurementText = measurements
    ? [
        measurements.heightCm && `height ${measurements.heightCm}`,
        measurements.bustCm && `bust ${measurements.bustCm}`,
        measurements.waistCm && `waist ${measurements.waistCm}`,
        measurements.hipsCm && `hips ${measurements.hipsCm}`,
      ]
        .filter(Boolean)
        .join(" · ") + " cm"
    : null;

  const rows: [string, string | null][] = [
    ["Looking for", MATCH_MODE_LABELS[request.matchMode].title],
    ["What you like", request.note],
    [
      "Budget per item",
      budget.min !== null && budget.max !== null
        ? `${money(budget.min)}–${money(budget.max)}`
        : budget.max !== null
          ? `Up to ${money(budget.max)}`
          : `${money(budget.min ?? 0)}+`,
    ],
    ["Usual size", request.usualSize],
    ["Fit", FIT_LABELS[request.fitPreference]],
    ["Measurements", measurementText],
    ["Notes", request.extraNotes],
  ];

  return (
    <section className="mt-6 rounded-3xl bg-card p-5" aria-labelledby="prefs-heading">
      <h2 id="prefs-heading" className="text-xs uppercase tracking-[0.14em] text-muted">
        Your preferences
      </h2>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 text-sm">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted">{k}</dt>
              <dd className="min-w-0 break-words text-ink">{v}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

function PendingState({ status }: { status: RequestStatus }) {
  const steps = [
    { title: "We read your request", body: "Your look, budget, size and notes." },
    { title: "We search Taobao by hand", body: "Checking shops, reviews and size charts." },
    { title: "Your 3–5 picks appear here", body: "Each with why we chose it and sizing advice." },
  ];
  const current = status === "reviewing" ? 1 : 0;
  return (
    <div className="rounded-[28px] bg-card p-6 md:p-10">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{STATUS_LABELS[status]}</p>
      <h2 id="picks-heading" className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
        We&apos;ve got your request.
      </h2>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted">
        Your curated Taobao picks will be added here manually. A person chooses every one.
      </p>

      <ol className="mt-8 space-y-5">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm ${
                i < current ? "bg-ink text-paper" : i === current ? "bg-ink text-paper ring-4 ring-line" : "bg-paper text-muted"
              }`}
              aria-hidden
            >
              {i < current ? "✓" : i + 1}
            </span>
            <div className={i > current ? "opacity-60" : ""}>
              <p className="text-[15px] text-ink">
                {step.title}
                {i === current && <span className="ml-2 text-xs text-accent">in progress</span>}
              </p>
              <p className="text-sm text-muted">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">Bookmark this page — it updates when your picks are ready.</p>
        <Link href="/discover" className="text-sm underline underline-offset-4 hover:text-ink">
          Browse while you wait
        </Link>
      </div>
    </div>
  );
}
