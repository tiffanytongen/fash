import { MOCK_LOOKS } from "@/data/mock-looks";
import type { InspirationAnalysis, InspirationImage } from "./types";

// STEP 1 — Understand the look.
//
// ⚠️ MOCK. This does not look at the image. It picks one of the sample looks
// in src/data/mock-looks.ts using a fingerprint of the image bytes, so the
// same image always gives the same result and different images vary.
//
// To make it real: send `image` to a multimodal vision model with a prompt
// asking for JSON in the InspirationAnalysis shape, validate the response,
// and set IS_MOCK_ANALYSIS to false. Keep the API key server-side
// (this function only runs inside the /api/match route).

export const IS_MOCK_ANALYSIS = true;

export async function analyzeInspiration(image: InspirationImage): Promise<InspirationAnalysis> {
  const digest = await crypto.subtle.digest("SHA-256", image.bytes as BufferSource);
  const index = new DataView(digest).getUint32(0) % MOCK_LOOKS.length;
  // Return a copy so callers can't accidentally mutate the sample data.
  return structuredClone(MOCK_LOOKS[index]);
}
