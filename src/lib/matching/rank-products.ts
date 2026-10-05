import { styleLabel, STYLES } from "@/data/taxonomy";
import type { Product, StyleTag } from "@/types/product";
import type { InspirationAnalysis, MatchDimension, RankedMatch } from "./types";
import {
  NEUTRAL_COLOR_FAMILIES,
  colorFamily,
  garmentSimilarity,
  isKnown,
  normalizeDetail,
  normalizeMaterial,
  normalizeSilhouette,
  normalizeStyle,
  toSet,
} from "./vocabulary";

// STEP 3 — Score and order candidates.
//
// Today: weighted attribute overlap. For each dimension we compare the
// analysis with the product and get a 0–1 score, then take a weighted average.
// Dimensions the analysis left empty or "unknown" are skipped (and the
// remaining weights rescaled), so a missing material doesn't drag scores down.
//
// Later: replace with image/text embedding similarity. Keep the RankedMatch
// output shape and the UI won't need to change.

const WEIGHTS: Record<MatchDimension, number> = {
  garment: 0.35,
  colors: 0.2,
  silhouette: 0.15,
  details: 0.15,
  style: 0.1,
  materials: 0.05,
};

/** Matches below this are not shown. */
const MIN_SCORE = 0.3;
/** Attribute overlap alone never proves an identical item, so cap the display. */
const MAX_PERCENT = 99;

/**
 * Overlap coefficient: shared items ÷ size of the smaller set.
 * We use the smaller set because an outfit analysis lists attributes for
 * several garments, while a product is a single garment.
 */
function overlap(a: Set<string>, b: Set<string>): { score: number; shared: string[] } {
  if (a.size === 0 || b.size === 0) return { score: 0, shared: [] };
  const shared = [...a].filter((x) => b.has(x));
  return { score: shared.length / Math.min(a.size, b.size), shared };
}

type DimensionResult = { score: number; shared: string[] } | null; // null = skipped

function scoreDimensions(analysis: InspirationAnalysis, product: Product) {
  const knownGarments = analysis.garmentTypes.filter(isKnown);
  let garment: DimensionResult = null;
  if (knownGarments.length > 0) {
    const best = Math.max(
      ...knownGarments.map((g) => garmentSimilarity(g, product.garment, product.category)),
    );
    garment = { score: best, shared: best > 0 ? [product.garment] : [] };
  }

  const maybe = (query: Set<string>, productSet: Set<string>): DimensionResult =>
    query.size === 0 ? null : overlap(query, productSet);

  const productStyles = toSet([...product.styles, ...product.tags], normalizeStyle);

  return {
    garment,
    colors: maybe(toSet(analysis.colors, colorFamily), toSet(product.colors, colorFamily)),
    silhouette: maybe(
      toSet(analysis.silhouette, normalizeSilhouette),
      toSet(product.silhouette, normalizeSilhouette),
    ),
    details: maybe(toSet(analysis.notableDetails, normalizeDetail), toSet(product.details, normalizeDetail)),
    style: maybe(toSet(analysis.style, normalizeStyle), productStyles),
    materials: maybe(toSet(analysis.materials, normalizeMaterial), toSet(product.materials, normalizeMaterial)),
  } satisfies Record<MatchDimension, DimensionResult>;
}

// ── Explanation ─────────────────────────────────────────────────────────────

const isStyleTag = (s: string): s is StyleTag => STYLES.some((t) => t.id === s);

function colourPhrase(sharedFamilies: string[], product: Product): string {
  if (sharedFamilies.every((f) => NEUTRAL_COLOR_FAMILIES.has(f))) return "neutral colour palette";
  // Use the product's own colour word, e.g. "burgundy" rather than "red".
  const word = product.colors.find((c) => sharedFamilies.includes(colorFamily(c))) ?? sharedFamilies[0];
  return `${word} colour`;
}

// The order phrases appear in, most specific first. Up to three are used.
const PHRASE_ORDER: MatchDimension[] = ["details", "silhouette", "colors", "garment", "style", "materials"];

function explain(dims: ReturnType<typeof scoreDimensions>, product: Product): string {
  const phrases: string[] = [];
  for (const dim of PHRASE_ORDER) {
    const result = dims[dim];
    if (!result || result.shared.length === 0) continue;
    const shared = result.shared.slice(0, 2);
    switch (dim) {
      case "details":
        phrases.push(shared.join(" and "));
        break;
      case "silhouette":
        phrases.push(`${shared.join(" ")} silhouette`);
        break;
      case "colors":
        phrases.push(colourPhrase(result.shared, product));
        break;
      case "garment":
        phrases.push(`${product.garment} shape`);
        break;
      case "style":
        phrases.push(`${shared.map((s) => (isStyleTag(s) ? styleLabel(s) : s[0].toUpperCase() + s.slice(1))).join("/")} feel`);
        break;
      case "materials":
        phrases.push(`${shared[0]} fabric`);
        break;
    }
    if (phrases.length === 3) break;
  }

  if (phrases.length === 0) return "Shares a few attributes with your inspiration.";
  const list =
    phrases.length === 1 ? phrases[0] : `${phrases.slice(0, -1).join(", ")} and ${phrases.at(-1)}`;
  return `Similar ${list}.`;
}

// ── Public API ──────────────────────────────────────────────────────────────

export function rankProducts(
  analysis: InspirationAnalysis,
  candidates: Product[],
  { limit = 12 }: { limit?: number } = {},
): RankedMatch[] {
  return candidates
    .map((product) => {
      const dims = scoreDimensions(analysis, product);
      let total = 0;
      let weightUsed = 0;
      const matched: RankedMatch["matched"] = {};
      for (const dim of Object.keys(WEIGHTS) as MatchDimension[]) {
        const result = dims[dim];
        if (!result) continue;
        total += WEIGHTS[dim] * result.score;
        weightUsed += WEIGHTS[dim];
        if (result.shared.length > 0) matched[dim] = result.shared;
      }
      const score = weightUsed > 0 ? total / weightUsed : 0;
      return {
        product,
        score,
        percent: Math.min(MAX_PERCENT, Math.round(score * 100)),
        explanation: explain(dims, product),
        matched,
      };
    })
    .filter((m) => m.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id))
    .slice(0, limit);
}
