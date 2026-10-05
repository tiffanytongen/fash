// Data model for the concierge MVP.
//
//   CurationRequest  — what a shopper asks for (one inspiration image + preferences)
//   CuratedResult    — the shortlist we send back (3–5 CuratedProducts)
//
// Today a person creates every CuratedResult by hand. Later, automated steps
// (image analysis, Taobao retrieval, shop scoring, personal ranking) will
// produce the same CuratedResult shape, marked with a different `source`,
// so the request page never needs to change.
//
// Both types are plain JSON so they map 1:1 onto future database tables.

// ── Request ─────────────────────────────────────────────────────────────────

export const REQUEST_STATUSES = ["submitted", "reviewing", "curated", "completed"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const FIT_PREFERENCES = ["fitted", "regular", "oversized", "no-preference"] as const;
export type FitPreference = (typeof FIT_PREFERENCES)[number];

export const MATCH_MODES = ["find-this", "find-my-vibe"] as const;
export type MatchMode = (typeof MATCH_MODES)[number];

export const BUDGET_CURRENCIES = ["MYR", "AUD"] as const;
export type BudgetCurrency = (typeof BUDGET_CURRENCIES)[number];

export const USUAL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type UsualSize = (typeof USUAL_SIZES)[number];

export type Measurements = {
  heightCm: number | null;
  bustCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
};

export type InspirationImageRef = {
  /** Where the stored file lives (a filename today; a storage path later). */
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  originalName: string;
};

/** What the shopper fills in. Shared by the form, the API and the store. */
export type CurationRequestInput = {
  note: string | null;
  /** Per item. At least one of min/max is set; `max: null` means "and up". */
  budget: { currency: BudgetCurrency; min: number | null; max: number | null };
  usualSize: UsualSize;
  measurements: Measurements | null;
  fitPreference: FitPreference;
  matchMode: MatchMode;
  extraNotes: string | null;
};

export type CurationRequest = CurationRequestInput & {
  id: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  inspirationImage: InspirationImageRef;
  status: RequestStatus;
  schemaVersion: 1;
};

// ── Curated results ─────────────────────────────────────────────────────────

export const MATCH_TYPES = ["exact-ish", "similar", "vibe"] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

export type CuratedProduct = {
  id: string;
  title: string;
  image: { url: string | null; alt: string };
  /** The real listing. `null` only for demo items. */
  taobaoUrl: string | null;
  priceCny: number | null;
  /** Curator-provided approximate price in the shopper's currency. */
  convertedPrice?: { amount: number; currency: BudgetCurrency } | null;
  shop: {
    name: string;
    /** Why we trust (or are cautious about) this shop, in plain words. */
    qualityNote: string;
  };
  /** What buyer reviews say, e.g. fabric, accuracy of photos, sizing. */
  reviewNote: string;
  availableSizes: string[] | null;
  sizingNote: string;
  whyItMatches: string;
  matchType: MatchType;
  curatorNote: string;
  tags?: string[];
  /** True for development demo data. The UI labels these clearly. */
  isDemo?: boolean;
};

/** Who produced the shortlist. Only "manual" exists today. */
export type CurationSource = "manual" | "assisted" | "automated";

export type CuratedResult = {
  requestId: string;
  curatedAt: string; // ISO 8601
  source: CurationSource;
  curatorName: string | null;
  /** A short personal message shown above the picks. */
  summary: string | null;
  products: CuratedProduct[];
};

// ── Display labels ──────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: "Submitted",
  reviewing: "Being curated",
  curated: "Picks ready",
  completed: "Completed",
};

export const FIT_LABELS: Record<FitPreference, string> = {
  fitted: "Fitted",
  regular: "Regular",
  oversized: "Oversized",
  "no-preference": "No preference",
};

export const MATCH_MODE_LABELS: Record<MatchMode, { title: string; blurb: string }> = {
  "find-this": { title: "Find this", blurb: "As close to the photo as possible" },
  "find-my-vibe": { title: "Find my vibe", blurb: "Similar style, not necessarily exact" },
};

export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  "exact-ish": "Closest match",
  similar: "Similar piece",
  vibe: "Same vibe",
};
