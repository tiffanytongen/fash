import {
  BUDGET_CURRENCIES,
  FIT_PREFERENCES,
  MATCH_MODES,
  USUAL_SIZES,
  type CurationRequestInput,
  type Measurements,
} from "@/types/curation";

// Validation shared by the request form (instant feedback) and the API
// (the source of truth). No library needed for a form this size.

/** Raw form values, as the browser sends them. Everything is a string. */
export type RequestFormValues = {
  note: string;
  budgetCurrency: string;
  budgetMin: string;
  budgetMax: string;
  usualSize: string;
  heightCm: string;
  bustCm: string;
  waistCm: string;
  hipsCm: string;
  fitPreference: string;
  matchMode: string;
  extraNotes: string;
};

export type FieldErrors = Partial<Record<keyof RequestFormValues | "image", string>>;

export type ValidationResult =
  | { ok: true; value: CurationRequestInput }
  | { ok: false; errors: FieldErrors };

export const MAX_TEXT = 500;

const MEASUREMENT_RANGES: Record<keyof Measurements, [number, number, string]> = {
  heightCm: [120, 220, "Height"],
  bustCm: [50, 200, "Bust"],
  waistCm: [40, 200, "Waist"],
  hipsCm: [50, 200, "Hips"],
};

const oneOf = <T extends string>(list: readonly T[], v: string): v is T => (list as readonly string[]).includes(v);

const text = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Parses an optional number. Returns undefined for empty, NaN for invalid. */
function optionalNumber(v: unknown): number | undefined {
  const s = text(v);
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

export function validateRequest(raw: Partial<Record<keyof RequestFormValues, unknown>>): ValidationResult {
  const errors: FieldErrors = {};

  const note = text(raw.note);
  if (note.length > MAX_TEXT) errors.note = `Please keep this under ${MAX_TEXT} characters.`;

  const extraNotes = text(raw.extraNotes);
  if (extraNotes.length > MAX_TEXT) errors.extraNotes = `Please keep this under ${MAX_TEXT} characters.`;

  const currency = text(raw.budgetCurrency);
  if (!oneOf(BUDGET_CURRENCIES, currency)) errors.budgetCurrency = "Choose a currency.";

  const max = optionalNumber(raw.budgetMax);
  const min = optionalNumber(raw.budgetMin);
  if (max === undefined && min === undefined) errors.budgetMax = "Choose a budget per item.";
  else if (max !== undefined && (Number.isNaN(max) || max <= 0)) errors.budgetMax = "Enter a number above 0.";
  if (min !== undefined && (Number.isNaN(min) || min < 0)) errors.budgetMin = "Enter a number of 0 or more.";
  if (!errors.budgetMin && !errors.budgetMax && min !== undefined && max !== undefined && min > max)
    errors.budgetMin = "Minimum can't be more than maximum.";

  const usualSize = text(raw.usualSize);
  if (!oneOf(USUAL_SIZES, usualSize)) errors.usualSize = "Choose your usual size.";

  const measurements: Measurements = { heightCm: null, bustCm: null, waistCm: null, hipsCm: null };
  for (const key of Object.keys(MEASUREMENT_RANGES) as (keyof Measurements)[]) {
    const [lo, hi, label] = MEASUREMENT_RANGES[key];
    const n = optionalNumber(raw[key]);
    if (n === undefined) continue;
    if (Number.isNaN(n) || n < lo || n > hi) errors[key] = `${label} should be between ${lo} and ${hi} cm.`;
    else measurements[key] = Math.round(n * 10) / 10;
  }
  const hasMeasurements = Object.values(measurements).some((v) => v !== null);

  const fitPreference = text(raw.fitPreference);
  if (!oneOf(FIT_PREFERENCES, fitPreference)) errors.fitPreference = "Choose a fit.";

  const matchMode = text(raw.matchMode);
  if (!oneOf(MATCH_MODES, matchMode)) errors.matchMode = "Choose how close the match should be.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      note: note || null,
      budget: {
        currency: currency as CurationRequestInput["budget"]["currency"],
        min: min ?? null,
        max: max ?? null,
      },
      usualSize: usualSize as CurationRequestInput["usualSize"],
      measurements: hasMeasurements ? measurements : null,
      fitPreference: fitPreference as CurationRequestInput["fitPreference"],
      matchMode: matchMode as CurationRequestInput["matchMode"],
      extraNotes: extraNotes || null,
    },
  };
}
