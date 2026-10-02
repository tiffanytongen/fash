"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STYLES } from "@/data/taxonomy";
import type { StyleTag } from "@/types/product";
import { CloseIcon, UploadIcon } from "./icons";

// Images are previewed locally with object URLs. Nothing is uploaded to a
// server, and nothing is analysed — visual search is a future milestone.
// When it exists, this component will send the files to an API route and
// show matches instead of asking for a text description.

const MAX_FILES = 8;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

type Pin = { id: string; url: string; name: string; broken?: boolean };

export function InspirationBoard() {
  const [pins, setPins] = useState<Pin[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<StyleTag | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Free the browser memory used by previews when leaving the page.
  const pinsRef = useRef<Pin[]>([]);
  useEffect(() => {
    pinsRef.current = pins;
  }, [pins]);
  useEffect(() => () => pinsRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const nextErrors: string[] = [];
    const accepted: Pin[] = [];
    let room = MAX_FILES - pins.length;

    for (const file of Array.from(fileList)) {
      if (!ACCEPTED.includes(file.type)) {
        nextErrors.push(`“${file.name}” isn't a supported image (use JPG, PNG, WebP, GIF or AVIF).`);
      } else if (file.size > MAX_BYTES) {
        nextErrors.push(`“${file.name}” is larger than 10 MB.`);
      } else if (room <= 0) {
        nextErrors.push(`You can pin up to ${MAX_FILES} images. “${file.name}” was skipped.`);
      } else {
        accepted.push({ id: crypto.randomUUID(), url: URL.createObjectURL(file), name: file.name });
        room--;
      }
    }

    setPins((prev) => [...prev, ...accepted]);
    setErrors(nextErrors);
  }

  function removePin(id: string) {
    setPins((prev) => {
      const pin = prev.find((p) => p.id === id);
      if (pin) URL.revokeObjectURL(pin.url);
      return prev.filter((p) => p.id !== id);
    });
  }

  const searchParams = new URLSearchParams();
  if (description.trim()) searchParams.set("q", description.trim());
  if (style) searchParams.set("style", style);
  const searchHref = `/discover${searchParams.size ? `?${searchParams}` : ""}`;
  const canSearch = Boolean(description.trim() || style);

  return (
    <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:gap-14">
      {/* ── Board ─────────────────────────────────────────── */}
      <section aria-labelledby="board-heading">
        <h2 id="board-heading" className="sr-only">
          Your inspiration board
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`rounded-3xl border-2 border-dashed p-6 text-center transition-colors md:p-10 ${
            dragging ? "border-ink bg-card" : "border-line"
          }`}
        >
          <UploadIcon width={28} height={28} className="mx-auto text-muted" />
          <p className="mt-3 font-serif text-2xl">Pin your inspiration</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            Screenshots from Pinterest, Instagram or Xiaohongshu. Up to {MAX_FILES} images, 10 MB each.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={pins.length >= MAX_FILES}
            className="mt-5 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm text-paper disabled:opacity-40"
          >
            Choose images
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            multiple
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose inspiration images"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = ""; // allow choosing the same file again
            }}
          />
          <p className="mt-4 text-xs text-muted">Your images stay on this device and aren&apos;t uploaded.</p>
        </div>

        {errors.length > 0 && (
          <ul role="alert" className="mt-4 space-y-1 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent">
            {errors.map((err) => (
              <li key={err}>{err}</li>
            ))}
          </ul>
        )}

        {pins.length > 0 && (
          <div className="mt-6 columns-2 gap-3 md:columns-3">
            {pins.map((pin) => (
              <figure key={pin.id} className="group relative mb-3 break-inside-avoid overflow-hidden rounded-2xl bg-line/50">
                {pin.broken ? (
                  <div className="flex aspect-square items-center justify-center p-4 text-center text-xs text-muted">
                    Couldn&apos;t preview “{pin.name}”
                  </div>
                ) : (
                  // A plain <img> is right here: next/image can't optimise local blob: URLs.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pin.url}
                    alt={`Inspiration image: ${pin.name}`}
                    className="block w-full"
                    onError={() =>
                      setPins((prev) => prev.map((p) => (p.id === pin.id ? { ...p, broken: true } : p)))
                    }
                  />
                )}
                <button
                  type="button"
                  onClick={() => removePin(pin.id)}
                  aria-label={`Remove ${pin.name}`}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-ink shadow-sm"
                >
                  <CloseIcon width={15} height={15} />
                </button>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* ── Describe & search ─────────────────────────────── */}
      <section aria-labelledby="describe-heading" className="md:sticky md:top-24 md:self-start">
        <div className="rounded-3xl bg-card p-6 md:p-8">
          <p className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs text-accent">
            Visual matching coming soon
          </p>
          <h2 id="describe-heading" className="mt-4 font-serif text-3xl leading-tight">
            Tell us what you love about these looks
          </h2>
          <p className="mt-2 text-sm text-muted">
            We can&apos;t read images yet, so we&apos;ll search the demo catalogue using your words.
          </p>

          <label htmlFor="inspo-description" className="mt-6 block text-xs uppercase tracking-[0.14em] text-muted">
            Describe it
          </label>
          <textarea
            id="inspo-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="e.g. flowy neutral linen, relaxed but put-together"
            className="mt-2 w-full resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none placeholder:text-muted/70 focus:border-ink"
          />

          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-muted">Closest aesthetic</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={style === s.id}
                onClick={() => setStyle(style === s.id ? null : s.id)}
                className={`h-9 rounded-full border px-3.5 text-sm transition-colors ${
                  style === s.id ? "border-ink bg-ink text-paper" : "border-line bg-paper hover:border-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {canSearch ? (
            <Link
              href={searchHref}
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-ink text-sm text-paper"
            >
              Find similar pieces
            </Link>
          ) : (
            <span
              aria-disabled
              className="mt-7 flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-line text-sm text-muted"
            >
              Add a description or aesthetic to search
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
