"use client";

import { useEffect, useRef, useState } from "react";
import type { MatchResponse } from "@/lib/matching/types";
import { resizeImage } from "@/lib/resize-image";
import { MatchResults } from "./match-results";
import { CloseIcon, UploadIcon } from "./icons";

// One inspiration image → POST /api/match → ranked matches.
// The flow is a small state machine: empty → selected → analysing → results | error.

const MAX_BYTES = 10 * 1024 * 1024; // before resizing in the browser
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

type Selected = { file: File; url: string };
type Phase = "selected" | "analysing" | "results" | "error";

export function InspirationBoard() {
  const [selected, setSelected] = useState<Selected | null>(null);
  const [phase, setPhase] = useState<Phase>("selected");
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef<AbortController | null>(null);

  // Free the preview's memory and cancel any request when the image changes or we leave.
  useEffect(() => {
    if (!selected) return;
    return () => URL.revokeObjectURL(selected.url);
  }, [selected]);
  useEffect(() => () => requestRef.current?.abort(), []);

  function choose(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError(`“${file.name}” isn't a supported image. Use JPG, PNG, WebP, GIF or AVIF.`);
      return; // keep any current selection as it was
    }
    if (file.size > MAX_BYTES) {
      setError(`“${file.name}” is larger than 10 MB.`);
      return;
    }
    requestRef.current?.abort();
    setSelected({ file, url: URL.createObjectURL(file) });
    setResult(null);
    setError(null);
    setPhase("selected");
  }

  function reset() {
    requestRef.current?.abort();
    setSelected(null);
    setResult(null);
    setError(null);
    setPhase("selected");
  }

  async function findMatches() {
    if (!selected) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setPhase("analysing");
    setError(null);

    try {
      const body = new FormData();
      const image = await resizeImage(selected.file);
      body.append("image", image, selected.file.name);

      const res = await fetch("/api/match", { method: "POST", body, signal: controller.signal });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong. Please try again.");

      setResult(data as MatchResponse);
      setPhase("results");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (controller.signal.aborted) return; // user moved on; not an error
      // fetch() throws a TypeError for network failures; our own errors carry a readable message.
      const offline = err instanceof TypeError || !(err instanceof Error) || !err.message;
      setError(offline ? "Couldn't reach the server. Check your connection and try again." : err.message);
      setPhase("error");
    }
  }

  if (phase === "results" && result && selected) {
    return <MatchResults imageUrl={selected.url} imageName={selected.file.name} result={result} onReset={reset} />;
  }

  const analysing = phase === "analysing";

  return (
    <div className="mx-auto max-w-xl">
      {selected ? (
        <figure className="relative overflow-hidden rounded-[28px] bg-line/50">
          {/* next/image can't optimise local blob: URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selected.url}
            alt={`Your inspiration: ${selected.file.name}`}
            className={`block max-h-[560px] w-full object-cover transition-opacity ${analysing ? "opacity-60" : ""}`}
          />
          {analysing && (
            <div className="absolute inset-0 grid place-items-center" role="status">
              <span className="rounded-full bg-card/95 px-5 py-2.5 text-sm shadow-sm">
                <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
                Reading the look…
              </span>
            </div>
          )}
          {!analysing && (
            <button
              type="button"
              onClick={reset}
              aria-label="Remove image"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-card/90 text-ink shadow-sm"
            >
              <CloseIcon width={16} height={16} />
            </button>
          )}
        </figure>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            choose(e.dataTransfer.files);
          }}
          className={`rounded-[28px] border-2 border-dashed px-6 py-14 text-center transition-colors ${
            dragging ? "border-ink bg-card" : "border-line"
          }`}
        >
          <UploadIcon width={28} height={28} className="mx-auto text-muted" />
          <p className="mt-3 font-serif text-3xl">Add one inspiration image</p>
          <p className="mx-auto mt-2 max-w-xs text-sm text-muted">
            A screenshot from Pinterest, Instagram or Xiaohongshu. JPG, PNG, WebP, GIF or AVIF, up to 10 MB.
          </p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 text-sm text-paper"
          >
            Choose an image
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-label="Choose an inspiration image"
        onChange={(e) => {
          choose(e.target.files);
          e.target.value = ""; // allow choosing the same file again
        }}
      />

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      {selected && (
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={findMatches}
            disabled={analysing}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-ink px-6 text-sm text-paper disabled:opacity-60"
          >
            {analysing ? "Finding matches…" : phase === "error" ? "Try again" : "Find matches"}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={analysing}
            className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6 text-sm hover:border-ink disabled:opacity-60"
          >
            Choose a different image
          </button>
        </div>
      )}

      <p className="mt-5 text-center text-xs leading-relaxed text-muted">
        Your image is sent to our server only to find matches. It isn&apos;t stored.
        <br />
        Prototype: the image analysis is currently a demo and all products are fictional.
      </p>
    </div>
  );
}
