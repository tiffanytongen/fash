import type { Category } from "@/types/product";

// Shared word-normalisation for searchProducts() and rankProducts().
// The analysis (today a mock, later a vision model) and the catalogue use
// slightly different words for the same thing. These maps fold them together
// so attribute overlap can be counted with simple set operations.
//
// When ranking moves to embeddings, most of this file can be deleted.

const clean = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

export const isKnown = (s: string) => {
  const c = clean(s);
  return c !== "" && c !== "unknown";
};

// ── Garments ────────────────────────────────────────────────────────────────

type GarmentFamily =
  | "dress" | "skirt" | "trousers" | "top" | "cardigan"
  | "outerwear" | "set" | "shoes" | "bag" | "accessory";

// Order matters: the first family whose keyword appears wins.
const GARMENT_FAMILIES: [GarmentFamily, string[]][] = [
  ["set", ["co-ord", "set"]],
  ["dress", ["dress", "qipao", "cheongsam"]],
  ["skirt", ["skirt"]],
  ["trousers", ["trousers", "pants", "jeans", "shorts"]],
  ["cardigan", ["cardigan"]],
  ["outerwear", ["jacket", "blazer", "coat", "hoodie", "vest", "gilet"]],
  ["top", ["top", "tee", "t-shirt", "tank", "camisole", "cami", "blouse", "shirt", "polo"]],
  ["shoes", ["flats", "sneakers", "shoes", "heels", "boots", "loafers"]],
  ["bag", ["bag", "tote"]],
  ["accessory", ["hair stick", "hairpin", "jewellery", "jewelry", "scarf"]],
];

const FAMILY_CATEGORY: Record<GarmentFamily, Category> = {
  dress: "dresses",
  skirt: "bottoms",
  trousers: "bottoms",
  top: "tops",
  cardigan: "tops",
  outerwear: "outerwear",
  set: "sets",
  shoes: "shoes",
  bag: "accessories",
  accessory: "accessories",
};

const hasWord = (text: string, word: string) =>
  new RegExp(`(^|[\\s-])${word.replace(/[-]/g, "\\-")}($|[\\s-])`).test(text);

export function garmentFamily(garment: string): GarmentFamily | null {
  const g = clean(garment);
  for (const [family, words] of GARMENT_FAMILIES) {
    if (words.some((w) => hasWord(g, w))) return family;
  }
  return null;
}

export function garmentCategory(garment: string): Category | null {
  const family = garmentFamily(garment);
  return family ? FAMILY_CATEGORY[family] : null;
}

/**
 * How closely a product's garment matches one garment from the analysis.
 * 1 = same garment ("maxi skirt" / "maxi skirt")
 * 0.9 = one contains the other ("baggy jeans" / "jeans")
 * 0.75 = same family ("maxi skirt" / "midi skirt")
 * 0.5 = same category ("camisole" / "cardigan" are both tops)
 */
export function garmentSimilarity(queryGarment: string, productGarment: string, productCategory: Category): number {
  const q = clean(queryGarment);
  const p = clean(productGarment);
  if (q === p) return 1;
  if (hasWord(q, p) || hasWord(p, q)) return 0.9;
  const qf = garmentFamily(q);
  if (qf && qf === garmentFamily(p)) return 0.75;
  if (qf && FAMILY_CATEGORY[qf] === productCategory) return 0.5;
  return 0;
}

// ── Colours ─────────────────────────────────────────────────────────────────

const COLOR_FAMILIES: Record<string, string[]> = {
  white: ["white", "ivory", "cream", "off-white"],
  black: ["black"],
  grey: ["grey", "gray", "dark grey", "charcoal", "heather grey", "washed grey", "light grey"],
  beige: ["beige", "oat", "camel", "champagne", "neutral", "tan", "nude"],
  brown: ["brown", "chocolate"],
  pink: ["pink", "blush", "baby pink"],
  red: ["red", "burgundy", "wine"],
  green: ["green", "sage", "olive", "jade"],
  blue: ["blue", "baby blue", "mid blue", "navy", "light blue"],
  gold: ["gold"],
};

export const NEUTRAL_COLOR_FAMILIES = new Set(["white", "black", "grey", "beige", "brown"]);

export function colorFamily(color: string): string {
  const c = clean(color);
  for (const [family, words] of Object.entries(COLOR_FAMILIES)) {
    if (words.includes(c)) return family;
  }
  return c;
}

// ── Style, silhouette, details, materials ───────────────────────────────────

const STYLE_SYNONYMS: Record<string, string> = {
  minimalist: "minimal",
  clean: "minimal",
  "new chinese": "new-chinese",
  chinese: "new-chinese",
  新中式: "new-chinese",
  "quiet luxury": "quiet-luxury",
  "old money": "quiet-luxury",
  elegant: "quiet-luxury",
  street: "streetwear",
  romantic: "coquette",
  office: "workwear",
};

const SILHOUETTE_SYNONYMS: Record<string, string> = {
  slim: "fitted",
  "slim fit": "fitted",
  bodycon: "fitted",
  loose: "relaxed",
  "low rise": "low-rise",
  "high waist": "high-waisted",
  "high-waist": "high-waisted",
  "wide leg": "wide-leg",
  "a line": "a-line",
};

const DETAIL_SYNONYMS: Record<string, string> = {
  "square neck": "square neckline",
  "frog button": "frog buttons",
  "stand collar": "mandarin collar",
  bow: "bows",
  lace: "lace trim",
  pleated: "pleats",
  ruffle: "ruffles",
  "puff sleeve": "puff sleeves",
};

const MATERIAL_SYNONYMS: Record<string, string> = {
  "rib knit": "knit",
  "wool blend": "wool",
  silk: "satin",
};

const via = (map: Record<string, string>) => (s: string) => {
  const c = clean(s);
  return map[c] ?? c;
};

export const normalizeStyle = via(STYLE_SYNONYMS);
export const normalizeSilhouette = via(SILHOUETTE_SYNONYMS);
export const normalizeDetail = via(DETAIL_SYNONYMS);
export const normalizeMaterial = via(MATERIAL_SYNONYMS);

/** Normalises a list, drops "unknown", and de-duplicates. */
export function toSet(values: string[], normalize: (s: string) => string): Set<string> {
  return new Set(values.filter(isKnown).map(normalize));
}
