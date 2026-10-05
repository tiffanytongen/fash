import type { Category, Product, StyleTag } from "@/types/product";

// Simple keyword search over the catalogue.
// It is deliberately "dumb but predictable": we tokenise the query, expand a
// few synonyms, and score each product by where the words appear.
// Later this can be swapped for Postgres full-text search or embeddings
// without changing the UI, because the UI only calls `searchCatalog`.

export type SearchFilters = {
  query?: string;
  category?: Category | null;
  style?: StyleTag | null;
};

const STOPWORDS = new Set([
  "a", "an", "and", "the", "for", "with", "to", "of", "in", "on", "my", "me",
  "i", "im", "want", "looking", "something", "some", "like", "that", "is",
  "are", "or", "very", "really", "outfit", "style", "vibe", "vibes", "look",
]);

// Maps a word users might type → words that appear in our catalogue.
const SYNONYMS: Record<string, string[]> = {
  pants: ["trousers", "pants"],
  trousers: ["trousers", "pants"],
  jeans: ["denim"],
  cheongsam: ["qipao", "cheongsam"],
  qipao: ["qipao", "cheongsam"],
  chinese: ["new-chinese", "qipao", "mandarin"],
  jacket: ["outerwear", "blazer", "jacket"],
  coat: ["outerwear"],
  shoe: ["shoes", "sneakers", "flats"],
  trainer: ["sneakers"],
  bag: ["bag", "tote"],
  jewelry: ["jewellery", "jewelry"],
  office: ["office", "workwear"],
  work: ["office", "workwear"],
  hot: ["summer", "breathable", "linen"],
  humid: ["summer", "breathable", "linen"],
  cold: ["winter", "outerwear"],
  cute: ["coquette", "bow", "soft"],
  girly: ["coquette"],
  street: ["streetwear"],
  clean: ["minimal"],
  minimalist: ["minimal"],
  neutral: ["neutral", "beige", "cream", "oat", "camel"],
  elegant: ["elegant", "quiet-luxury"],
  classy: ["quiet-luxury", "elegant"],
  luxury: ["quiet-luxury"],
  set: ["sets", "co-ord", "matching set"],
};

const normalise = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s-]/gu, " ");

// Very small stemmer: "dresses" → "dress", "skirts" → "skirt".
const stem = (word: string) => {
  if (word.length > 4 && word.endsWith("es")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss"))
    return word.slice(0, -1);
  return word;
};

export function tokenise(query: string): string[] {
  return normalise(query)
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Each entry is a group of alternatives; matching any one counts. */
function expand(tokens: string[]): string[][] {
  return tokens.map((t) => {
    const s = stem(t);
    return Array.from(new Set([t, s, ...(SYNONYMS[t] ?? []), ...(SYNONYMS[s] ?? [])]));
  });
}

function scoreProduct(product: Product, groups: string[][]): number {
  const title = normalise(product.title);
  const strong = normalise(
    [product.category, ...product.styles, ...product.colors, ...product.materials].join(" "),
  );
  const weak = normalise([product.description, ...product.tags].join(" "));

  let score = 0;
  for (const alternatives of groups) {
    let best = 0;
    for (const word of alternatives) {
      const w = normalise(word).trim();
      if (!w) continue;
      if (title.includes(w)) best = Math.max(best, 3);
      else if (strong.includes(w)) best = Math.max(best, 2);
      else if (weak.includes(w)) best = Math.max(best, 1);
    }
    score += best;
  }
  return score;
}

/**
 * Returns products matching the filters, best matches first.
 * With no query, returns every product that passes the category/style filters.
 */
export function searchCatalog(products: Product[], filters: SearchFilters): Product[] {
  const filtered = products.filter(
    (p) =>
      (!filters.category || p.category === filters.category) &&
      (!filters.style || p.styles.includes(filters.style)),
  );

  const groups = expand(tokenise(filters.query ?? ""));
  if (groups.length === 0) return filtered;

  return filtered
    .map((product) => ({ product, score: scoreProduct(product, groups) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}
