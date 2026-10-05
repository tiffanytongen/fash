"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  BUDGET_CURRENCIES,
  FIT_LABELS,
  FIT_PREFERENCES,
  MATCH_MODES,
  MATCH_MODE_LABELS,
  USUAL_SIZES,
} from "@/types/curation";
import { MAX_TEXT, validateRequest, type FieldErrors, type RequestFormValues } from "@/lib/requests/validate";
import { rememberRequest, useMyRequests } from "@/lib/requests/my-requests";
import { resizeImage } from "@/lib/resize-image";
import { CloseIcon, UploadIcon } from "./icons";

// Concierge request form: one image + a few preferences → POST /api/requests.
// Nothing is analysed or matched automatically; a person curates the picks.

const MAX_BYTES = 10 * 1024 * 1024; // before in-browser resizing
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

const EMPTY: RequestFormValues = {
  note: "",
  budgetCurrency: "MYR",
  budgetMin: "",
  budgetMax: "",
  usualSize: "",
  heightCm: "",
  bustCm: "",
  waistCm: "",
  hipsCm: "",
  fitPreference: "",
  matchMode: "",
  extraNotes: "",
};

type Phase = "editing" | "submitting" | "submitted";

export function RequestForm() {
  const [values, setValues] = useState<RequestFormValues>(EMPTY);
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("editing");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!image) return;
    return () => URL.revokeObjectURL(image.url);
  }, [image]);

  const set = (key: keyof RequestFormValues) => (value: string) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function chooseImage(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setErrors((e) => ({ ...e, image: `“${file.name}” isn't a supported image. Use JPG, PNG, WebP, GIF or AVIF.` }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, image: `“${file.name}” is larger than 10 MB.` }));
      return;
    }
    setImage({ file, url: URL.createObjectURL(file) });
    setErrors((e) => ({ ...e, image: undefined }));
  }

  function showErrors(next: FieldErrors) {
    setErrors(next);
    if (next.heightCm || next.bustCm || next.waistCm || next.hipsCm) setMeasurementsOpen(true);
    // Move focus to the first problem so it's visible on small screens.
    requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid=true], [data-invalid=true]");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus({ preventScroll: true });
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = validateRequest(values);
    const nextErrors: FieldErrors = result.ok ? {} : { ...result.errors };
    if (!image) nextErrors.image = "Add one inspiration image.";
    if (Object.keys(nextErrors).length > 0 || !image) return showErrors(nextErrors);

    setPhase("submitting");
    try {
      const body = new FormData();
      body.append("image", await resizeImage(image.file), image.file.name);
      body.append("details", JSON.stringify(values));
      const res = await fetch("/api/requests", { method: "POST", body });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setPhase("editing");
        if (data?.fieldErrors) showErrors(data.fieldErrors);
        setFormError(data?.error ?? "Something went wrong. Please try again.");
        return;
      }

      rememberRequest({ id: data.id, createdAt: new Date().toISOString() });
      setRequestId(data.id);
      setPhase("submitted");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setPhase("editing");
      setFormError("Couldn't reach the server. Check your connection and try again.");
    }
  }

  function startOver() {
    setValues(EMPTY);
    setImage(null);
    setErrors({});
    setFormError(null);
    setRequestId(null);
    setMeasurementsOpen(false);
    setPhase("editing");
  }

  if (phase === "submitted" && requestId) {
    return <SubmittedState requestId={requestId} imageUrl={image?.url} onStartOver={startOver} />;
  }

  const submitting = phase === "submitting";

  return (
    <div className="mx-auto max-w-xl">
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-10">
        {/* 1 ─ Image */}
        <Section step="01" title="Your inspiration" hint="One screenshot or photo of the look you want.">
          {image ? (
            <figure className="relative overflow-hidden rounded-[28px] bg-line/50">
              {/* next/image can't optimise local blob: URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`Your inspiration: ${image.file.name}`}
                className="block max-h-[420px] w-full object-cover"
              />
              <div className="absolute right-3 top-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="h-9 rounded-full bg-card/90 px-4 text-xs text-ink shadow-sm"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  aria-label="Remove image"
                  className="grid h-9 w-9 place-items-center rounded-full bg-card/90 text-ink shadow-sm"
                >
                  <CloseIcon width={16} height={16} />
                </button>
              </div>
            </figure>
          ) : (
            <div
              data-invalid={errors.image ? true : undefined}
              tabIndex={-1}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                chooseImage(e.dataTransfer.files);
              }}
              className={`rounded-[28px] border-2 border-dashed px-6 py-10 text-center outline-none transition-colors ${
                dragging ? "border-ink bg-card" : errors.image ? "border-accent" : "border-line"
              }`}
            >
              <UploadIcon width={26} height={26} className="mx-auto text-muted" />
              <p className="mt-3 text-sm text-muted">From Pinterest, Instagram or Xiaohongshu · up to 10 MB</p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-5 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm text-paper"
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
              chooseImage(e.target.files);
              e.target.value = "";
            }}
          />
          <FieldError message={errors.image} />

          <TextArea
            id="note"
            label="What do you like about this look?"
            optional
            placeholder="e.g. the square neckline and the long skirt"
            value={values.note}
            onChange={set("note")}
            error={errors.note}
          />
        </Section>

        {/* 2 ─ Match mode */}
        <Section step="02" title="How close should we go?">
          <fieldset>
            <legend className="sr-only">Matching preference</legend>
            <div className="grid gap-3 sm:grid-cols-2" data-invalid={errors.matchMode ? true : undefined} tabIndex={-1}>
              {MATCH_MODES.map((mode) => (
                <label
                  key={mode}
                  className={`cursor-pointer rounded-3xl border p-5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
                    values.matchMode === mode ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="matchMode"
                    value={mode}
                    checked={values.matchMode === mode}
                    onChange={() => set("matchMode")(mode)}
                    className="sr-only"
                  />
                  <span className="block font-serif text-2xl">{MATCH_MODE_LABELS[mode].title}</span>
                  <span className={`mt-1 block text-sm ${values.matchMode === mode ? "text-paper/75" : "text-muted"}`}>
                    {MATCH_MODE_LABELS[mode].blurb}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <FieldError message={errors.matchMode} />
        </Section>

        {/* 3 ─ Budget */}
        <Section step="03" title="Budget per item">
          <div className="grid grid-cols-[auto_1fr_1fr] items-end gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted">Currency</span>
              <select
                value={values.budgetCurrency}
                onChange={(e) => set("budgetCurrency")(e.target.value)}
                className="h-12 rounded-2xl border border-line bg-card px-3 text-[15px] outline-none focus:border-ink"
              >
                {BUDGET_CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c === "MYR" ? "RM (MYR)" : "A$ (AUD)"}
                  </option>
                ))}
              </select>
            </label>
            <NumberInput id="budgetMin" label="Min (optional)" value={values.budgetMin} onChange={set("budgetMin")} error={errors.budgetMin} />
            <NumberInput id="budgetMax" label="Max" value={values.budgetMax} onChange={set("budgetMax")} error={errors.budgetMax} />
          </div>
          <FieldError message={errors.budgetMin ?? errors.budgetMax ?? errors.budgetCurrency} />
        </Section>

        {/* 4 ─ Size & fit */}
        <Section step="04" title="Size & fit">
          <ChipGroup
            name="usualSize"
            legend="Usual clothing size"
            options={USUAL_SIZES.map((s) => ({ value: s, label: s }))}
            value={values.usualSize}
            onChange={set("usualSize")}
            error={errors.usualSize}
          />
          <ChipGroup
            name="fitPreference"
            legend="Preferred fit"
            options={FIT_PREFERENCES.map((f) => ({ value: f, label: FIT_LABELS[f] }))}
            value={values.fitPreference}
            onChange={set("fitPreference")}
            error={errors.fitPreference}
          />

          <details
            className="group rounded-3xl border border-line bg-card px-5 py-4"
            open={measurementsOpen}
            onToggle={(e) => setMeasurementsOpen(e.currentTarget.open)}
          >
            <summary className="cursor-pointer list-none text-sm">
              <span className="text-ink">Add measurements</span>{" "}
              <span className="text-muted">(optional, helps with Chinese sizing)</span>
              <span className="float-right text-muted transition-transform group-open:rotate-45" aria-hidden>
                +
              </span>
            </summary>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <NumberInput id="heightCm" label="Height (cm)" value={values.heightCm} onChange={set("heightCm")} error={errors.heightCm} />
              <NumberInput id="bustCm" label="Bust (cm)" value={values.bustCm} onChange={set("bustCm")} error={errors.bustCm} />
              <NumberInput id="waistCm" label="Waist (cm)" value={values.waistCm} onChange={set("waistCm")} error={errors.waistCm} />
              <NumberInput id="hipsCm" label="Hips (cm)" value={values.hipsCm} onChange={set("hipsCm")} error={errors.hipsCm} />
            </div>
            <FieldError message={errors.heightCm ?? errors.bustCm ?? errors.waistCm ?? errors.hipsCm} />
          </details>
        </Section>

        {/* 5 ─ Notes */}
        <Section step="05" title="Anything else?">
          <TextArea
            id="extraNotes"
            label="Notes for your curator"
            optional
            placeholder="e.g. I want the skirt but not the top · no polyester · under RM100"
            value={values.extraNotes}
            onChange={set("extraNotes")}
            error={errors.extraNotes}
          />
        </Section>

        {formError && (
          <p role="alert" className="rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent">
            {formError}
          </p>
        )}

        <div>
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-full bg-ink py-4 text-[15px] text-paper disabled:opacity-60"
          >
            {submitting ? "Sending your request…" : "Send my request"}
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            A person hand-picks your shortlist from Taobao — nothing is matched automatically.
            <br />
            Your image is kept only to curate this request.
          </p>
        </div>
      </form>

      <MyRequestsList />
    </div>
  );
}

// ── Success state ────────────────────────────────────────────────────────────

function SubmittedState({
  requestId,
  imageUrl,
  onStartOver,
}: {
  requestId: string;
  imageUrl?: string;
  onStartOver: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl text-center" role="status">
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="Your inspiration" className="mx-auto h-40 w-32 rounded-2xl object-cover" />
      )}
      <p className="mt-6 text-xs uppercase tracking-[0.14em] text-muted">Request received</p>
      <h2 className="mt-2 font-serif text-4xl leading-tight">We&apos;ve got your request.</h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-muted">
        Your curated Taobao picks will be added here manually. A person on our team reviews every request and
        hand-picks 3–5 options.
      </p>
      <p className="mt-6 text-sm text-muted">
        Request ID <code className="rounded bg-card px-2 py-1 text-ink">{requestId}</code>
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href={`/requests/${requestId}`}
          className="inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-sm text-paper"
        >
          View your request
        </Link>
        <button
          type="button"
          onClick={onStartOver}
          className="inline-flex h-12 items-center justify-center rounded-full border border-line px-7 text-sm hover:border-ink"
        >
          Send another
        </button>
      </div>
      <p className="mt-6 text-xs text-muted">Bookmark your request page — it&apos;s the only way back for now.</p>
    </div>
  );
}

function MyRequestsList() {
  const requests = useMyRequests();
  if (requests.length === 0) return null;
  return (
    <section className="mt-14 border-t border-line pt-8" aria-labelledby="my-requests">
      <h2 id="my-requests" className="text-xs uppercase tracking-[0.14em] text-muted">
        Your requests on this device
      </h2>
      <ul className="mt-3 divide-y divide-line">
        {requests.map((r) => (
          <li key={r.id}>
            <Link href={`/requests/${r.id}`} className="flex items-center justify-between py-3 text-sm hover:text-ink">
              <code className="text-ink">{r.id}</code>
              <span className="text-muted">
                {new Date(r.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" })} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ── Small form building blocks ───────────────────────────────────────────────

function Section({ step, title, hint, children }: { step: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <header>
        <p className="text-xs tracking-[0.2em] text-muted">{step}</p>
        <h2 className="mt-1 font-serif text-3xl">{title}</h2>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-accent">{message}</p>;
}

function TextArea({
  id,
  label,
  optional,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  optional?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex justify-between text-sm">
        <span>
          {label} {optional && <span className="text-muted">(optional)</span>}
        </span>
        <span className={`text-xs ${value.length > MAX_TEXT ? "text-accent" : "text-muted"}`}>
          {value.length}/{MAX_TEXT}
        </span>
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full resize-none rounded-2xl border bg-card px-4 py-3 text-[15px] outline-none placeholder:text-muted/70 focus:border-ink ${
          error ? "border-accent" : "border-line"
        }`}
      />
      <FieldError message={error} />
    </div>
  );
}

function NumberInput({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <label htmlFor={id} className="block min-w-0">
      <span className="mb-1.5 block text-xs text-muted">{label}</span>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`h-12 w-full rounded-2xl border bg-card px-4 text-[15px] outline-none focus:border-ink ${
          error ? "border-accent" : "border-line"
        }`}
      />
    </label>
  );
}

function ChipGroup({
  name,
  legend,
  options,
  value,
  onChange,
  error,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-2" data-invalid={error ? true : undefined} tabIndex={-1}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
              value === o.value ? "border-ink bg-ink text-paper" : "border-line bg-card hover:border-ink"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      <div className="mt-2">
        <FieldError message={error} />
      </div>
    </fieldset>
  );
}
