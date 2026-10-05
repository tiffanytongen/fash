import { getAllProducts } from "@/lib/catalog";
import type { Product } from "@/types/product";
import type { InspirationAnalysis } from "./types";
import { colorFamily, garmentCategory, isKnown, normalizeStyle } from "./vocabulary";

// STEP 2 — Find candidates.
//
// Today: a loose filter over the demo catalogue. It keeps any product that
// shares a garment category, a colour family or a style with the analysis,
// and leaves the fine-grained scoring to rankProducts().
//
// Later: call a real product source (e.g. a Taobao/affiliate search API) with
// analysis.taobaoSearchKeywords and map the results into Product objects.
// The signature stays the same.

export async function searchProducts(
  analysis: InspirationAnalysis,
  { limit = 50 }: { limit?: number } = {},
): Promise<Product[]> {
  const products = await getAllProducts();

  const categories = new Set(analysis.garmentTypes.map(garmentCategory).filter(Boolean));
  const colors = new Set(analysis.colors.filter(isKnown).map(colorFamily));
  const styles = new Set(analysis.style.filter(isKnown).map(normalizeStyle));

  return products
    .filter(
      (p) =>
        categories.has(p.category) ||
        p.colors.some((c) => colors.has(colorFamily(c))) ||
        [...p.styles, ...p.tags].some((s) => styles.has(normalizeStyle(s))),
    )
    .slice(0, limit);
}
