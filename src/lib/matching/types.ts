import type { Product } from "@/types/product";

// The contract between the three steps of inspiration matching:
//
//   analyzeInspiration(image)            → InspirationAnalysis
//   searchProducts(analysis)             → Product[]  (candidates)
//   rankProducts(analysis, candidates)   → RankedMatch[]
//
// Each step can be replaced (vision model, Taobao retrieval, embeddings)
// as long as it keeps these shapes.

/** What we think the inspiration image shows. Use "unknown" when unsure. */
export type InspirationAnalysis = {
  garmentTypes: string[]; // e.g. ["fitted top", "maxi skirt"]
  colors: string[];
  silhouette: string[];
  materials: string[];
  style: string[];
  notableDetails: string[];
  /** A natural English description, usable as a search query. */
  englishSearchPhrase: string;
  /** Chinese keywords a shopper could paste into Taobao search. */
  taobaoSearchKeywords: string[];
};

/** The image handed to analyzeInspiration(). */
export type InspirationImage = {
  bytes: Uint8Array;
  mimeType: string;
};

export type MatchDimension = "garment" | "colors" | "silhouette" | "style" | "details" | "materials";

export type RankedMatch = {
  product: Product;
  /** 0–1 */
  score: number;
  /** 0–100, rounded, for display. */
  percent: number;
  /** One line, e.g. "Similar square neckline, fitted silhouette and neutral colour palette." */
  explanation: string;
  /** Attribute values that overlapped, per dimension (useful for debugging and UI). */
  matched: Partial<Record<MatchDimension, string[]>>;
};

/** What POST /api/match returns. */
export type MatchResponse = {
  analysis: InspirationAnalysis;
  /** One sentence: "We think you're looking for…" */
  interpretation: string;
  matches: RankedMatch[];
  /** True while analyzeInspiration() is mocked. The UI must say so. */
  isMockAnalysis: boolean;
};
