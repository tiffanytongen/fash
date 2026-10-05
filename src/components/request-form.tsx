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
import { UploadIcon } from "./icons";

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

// Budget presets per item. "Custom" reveals exact min/max fields.
const BUDGET_PRESETS: Record<string, { label: string; min: string; max: string }[]> = {
  MYR: [
    { label: "Under RM50", min: "", max: "50" },
    { label: "RM50–100", min: "50", max: "100" },
    { label: "RM100–200", min: "100", max: "200" },
    { label: "RM200+", min: "200", max: "" },
  ],
  AUD: [
    { label: "Under A$20", min: "", max: "20" },
    { label: "A$20–40", min: "20", max: "40" },
    { label: "A$40–80", min: "40", max: "80" },
    { label: "A$80+", min: "80", max: "" },
  ],
};

export function RequestForm() {
  const [values, setValues] = useState<RequestFormValues>(EMPTY);
  const [image, setImage] = useState<{ file: File; url: string } | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("editing");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [measurementsOpen, setMeasurementsOpen] = useState(false);
  const [customBudget, setCustomBudget] = useState(false);
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
    if (next.budgetMin || (next.budgetMax && next.budgetMax !== "Choose a budget per item.")) setCustomBudget(true);
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
    setCustomBudget(false);
    setPhase("editing");
  }

  if (phase === "submitted" && requestId) {
    return <SubmittedState requestId={requestId} imageUrl={image?.url} onStartOver={startOver} />;
  }

  const submitting = phase === "submitting";
  const presets = BUDGET_PRESETS[values.budgetCurrency] ?? BUDGET_PRESETS.MYR;
  const activePreset = customBudget
    ? null
    : presets.find((p) => p.min === values.budgetMin && p.max === values.budgetMax) ?? null;
  const budgetError = errors.budgetMin ?? errors.budgetMax ?? errors.budgetCurrency;
  const pickBudget = (min: string, max: string) => {
    setValues((v) => ({ ...v, budgetMin: min, budgetMax: max }));
    setErrors((e) => ({ ...e, budgetMin: undefined, budgetMax: undefined }));
  };

  return (
    <div className="mx-auto max-w-xl">
      <form ref={formRef} onSubmit={submit} noValidate>
        {/* ── Image ─────────────────────────────────────────── */}
        <Question title="Your inspiration">
          {image ? (
            <div className="flex items-center gap-4 rounded-3xl bg-card p-3">
              {/* next/image can't optimise local blob: URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={`Your inspiration: ${image.file.name}`}
                className="h-28 w-22 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{image.file.name}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <button type="button" onClick={() => inputRef.current?.click()} className="underline underline-offset-4">
                    Change
                  </button>
                  <button type="button" onClick={() => setImage(null)} className="text-muted hover:text-ink">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              data-invalid={errors.image ? true : undefined}
              onClick={() => inputRef.current?.click()}
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
              className={`flex w-full items-center gap-4 rounded-3xl p-4 text-left transition-colors ${
                dragging ? "bg-ink text-paper" : errors.image ? "bg-accent-soft" : "bg-card hover:bg-line/60"
              }`}
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-ink text-paper">
                <UploadIcon width={22} height={22} />
              </span>
              <span>
                <span className="block text-[15px] font-medium">Add a photo or screenshot</span>
                <span className={`block text-sm ${dragging ? "text-paper/70" : "text-muted"}`}>
                  Pinterest, Instagram, Xiaohongshu…
                </span>
              </span>
            </button>
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

          <Reveal label="Add what you love about it" open={Boolean(values.note || errors.note)}>
            <TextArea
              id="note"
              label="What do you like about this look?"
              placeholder="e.g. the square neckline and the long skirt"
              value={values.note}
              onChange={set("note")}
              error={errors.note}
            />
          </Reveal>
        </Question>

        {/* ── Match mode ────────────────────────────────────── */}
        <Question title="How close should we go?">
          <fieldset>
            <legend className="sr-only">Matching preference</legend>
            <div className="grid grid-cols-2 gap-2" data-invalid={errors.matchMode ? true : undefined} tabIndex={-1}>
              {MATCH_MODES.map((mode) => {
                const on = values.matchMode === mode;
                return (
                  <label
                    key={mode}
                    className={`cursor-pointer rounded-3xl p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
                      on ? "bg-ink text-paper" : "bg-card hover:bg-line/60"
                    }`}
                  >
                    <input
                      type="radio"
                      name="matchMode"
                      value={mode}
                      checked={on}
                      onChange={() => set("matchMode")(mode)}
                      className="sr-only"
                    />
                    <span className="block font-serif text-xl leading-tight">{MATCH_MODE_LABELS[mode].title}</span>
                    <span className={`mt-1 block text-xs leading-snug ${on ? "text-paper/70" : "text-muted"}`}>
                      {MATCH_MODE_LABELS[mode].blurb}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <FieldError message={errors.matchMode} />
        </Question>

        {/* ── Budget ────────────────────────────────────────── */}
        <Question
          title="Budget per item"
          aside={
            <div className="flex rounded-full bg-card p-0.5 text-xs" role="group" aria-label="Currency">
              {BUDGET_CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={values.budgetCurrency === c}
                  onClick={() => {
                    setValues((v) => ({ ...v, budgetCurrency: c, budgetMin: "", budgetMax: "" }));
                    setCustomBudget(false);
                  }}
                  className={`rounded-full px-3 py-1.5 ${values.budgetCurrency === c ? "bg-ink text-paper" : "text-muted"}`}
                >
                  {c === "MYR" ? "RM" : "A$"}
                </button>
              ))}
            </div>
          }
        >
          <div className="flex flex-wrap gap-2" data-invalid={budgetError ? true : undefined} tabIndex={-1}>
            {presets.map((p) => (
              <Chip key={p.label} on={activePreset === p} onClick={() => { setCustomBudget(false); pickBudget(p.min, p.max); }}>
                {p.label}
              </Chip>
            ))}
            <Chip on={customBudget} onClick={() => { setCustomBudget(true); pickBudget("", ""); }}>
              Custom
            </Chip>
          </div>
          {customBudget && (
            <div className="grid grid-cols-2 gap-3">
              <NumberInput id="budgetMin" label="Min (optional)" value={values.budgetMin} onChange={set("budgetMin")} error={errors.budgetMin} />
              <NumberInput id="budgetMax" label="Max" value={values.budgetMax} onChange={set("budgetMax")} error={errors.budgetMax} />
            </div>
          )}
          <FieldError message={budgetError} />
        </Question>

        {/* ── Size & fit ────────────────────────────────────── */}
        <Question title="Your usual size">
          <ChipGroup
            name="usualSize"
            legend="Usual clothing size"
            options={USUAL_SIZES.map((s) => ({ value: s, label: s }))}
            value={values.usualSize}
            onChange={set("usualSize")}
            error={errors.usualSize}
          />
        </Question>

        <Question title="How do you like it to fit?">
          <ChipGroup
            name="fitPreference"
            legend="Preferred fit"
            options={FIT_PREFERENCES.map((f) => ({ value: f, label: FIT_LABELS[f] }))}
            value={values.fitPreference}
            onChange={set("fitPreference")}
            error={errors.fitPreference}
          />
          <Reveal
            label="Add measurements"
            hint="helps with Chinese sizing"
            open={measurementsOpen}
            onOpen={() => setMeasurementsOpen(true)}
          >
            <div className="grid grid-cols-2 gap-3">
              <NumberInput id="heightCm" label="Height (cm)" value={values.heightCm} onChange={set("heightCm")} error={errors.heightCm} />
              <NumberInput id="bustCm" label="Bust (cm)" value={values.bustCm} onChange={set("bustCm")} error={errors.bustCm} />
              <NumberInput id="waistCm" label="Waist (cm)" value={values.waistCm} onChange={set("waistCm")} error={errors.waistCm} />
              <NumberInput id="hipsCm" label="Hips (cm)" value={values.hipsCm} onChange={set("hipsCm")} error={errors.hipsCm} />
            </div>
            <FieldError message={errors.heightCm ?? errors.bustCm ?? errors.waistCm ?? errors.hipsCm} />
          </Reveal>
        </Question>

        {/* ── Notes ─────────────────────────────────────────── */}
        <div className="border-t border-line py-6">
          <Reveal label="Add notes for your curator" hint="e.g. skirt only, no polyester" open={Boolean(values.extraNotes || errors.extraNotes)}>
            <TextArea
              id="extraNotes"
              label="Notes for your curator"
              placeholder="e.g. I want the skirt but not the top · no polyester · under RM100"
              value={values.extraNotes}
              onChange={set("extraNotes")}
              error={errors.extraNotes}
            />
          </Reveal>
        </div>

        {formError && (
          <p role="alert" className="mb-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm text-accent">
            {formError}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-full bg-ink py-4 text-[15px] text-paper disabled:opacity-60"
          >
            {submitting ? "Sending your request…" : "Send my request"}
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-muted">
            A person hand-picks your shortlist from Taobao — nothing is matched automatically.
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

/** One question: a title row and its answer controls, separated by hairlines. */
function Question({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3 border-t border-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/** Hides an optional field behind a small "+ label" link until it's needed. */
function Reveal({
  label,
  hint,
  open,
  onOpen,
  children,
}: {
  label: string;
  hint?: string;
  open: boolean;
  onOpen?: () => void;
  children: React.ReactNode;
}) {
  const [opened, setOpened] = useState(false);
  if (open || opened) return <div className="pt-1">{children}</div>;
  return (
    <button
      type="button"
      onClick={() => {
        setOpened(true);
        onOpen?.();
      }}
      className="text-sm text-ink underline-offset-4 hover:underline"
    >
      <span aria-hidden>+ </span>
      {label}
      {hint && <span className="text-muted"> · {hint}</span>}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-accent">{message}</p>;
}

function TextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex justify-between text-sm">
        <span>{label}</span>
        <span className={`text-xs ${value.length > MAX_TEXT ? "text-accent" : "text-muted"}`}>
          {value.length}/{MAX_TEXT}
        </span>
      </label>
      <textarea
        id={id}
        rows={3}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={`w-full resize-none rounded-2xl border bg-card px-4 py-3 text-[15px] outline-none placeholder:text-muted/70 focus:border-ink ${
          error ? "border-accent" : "border-transparent"
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
          error ? "border-accent" : "border-transparent"
        }`}
      />
    </label>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`h-11 rounded-full px-4 text-sm transition-colors ${on ? "bg-ink text-paper" : "bg-card hover:bg-line/60"}`}
    >
      {children}
    </button>
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
      <legend className="sr-only">{legend}</legend>
      <div className="flex flex-wrap gap-2" data-invalid={error ? true : undefined} tabIndex={-1}>
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex h-11 min-w-12 cursor-pointer items-center justify-center rounded-full px-4 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ink ${
              value === o.value ? "bg-ink text-paper" : "bg-card hover:bg-line/60"
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
      {error && (
        <div className="mt-2">
          <FieldError message={error} />
        </div>
      )}
    </fieldset>
  );
}
