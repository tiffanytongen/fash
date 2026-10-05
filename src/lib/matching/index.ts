import { IS_MOCK_ANALYSIS, analyzeInspiration } from "./analyze-inspiration";
import { searchProducts } from "./search-products";
import { rankProducts } from "./rank-products";
import type { InspirationAnalysis, InspirationImage, MatchResponse } from "./types";
import { isKnown } from "./vocabulary";

// The full pipeline: image → analysis → candidates → ranked matches.
// The /api/match route calls this; each step lives in its own file so it can
// be replaced independently.

export async function matchInspiration(image: InspirationImage): Promise<MatchResponse> {
  const analysis = await analyzeInspiration(image);
  const candidates = await searchProducts(analysis);
  const matches = rankProducts(analysis, candidates);

  return {
    analysis,
    interpretation: interpret(analysis),
    matches,
    isMockAnalysis: IS_MOCK_ANALYSIS,
  };
}

/** One readable sentence for "We think you're looking for…". */
export function interpret(analysis: InspirationAnalysis): string {
  const phrase = analysis.englishSearchPhrase.trim();
  const styles = analysis.style.filter(isKnown);
  const base = phrase ? phrase[0].toUpperCase() + phrase.slice(1) : analysis.garmentTypes.join(" and ");
  return styles.length ? `${base} — ${styles.join(", ")} feel.` : `${base}.`;
}

export type { InspirationAnalysis, MatchResponse, RankedMatch } from "./types";
