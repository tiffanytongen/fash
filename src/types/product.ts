// The core data shape for the catalogue.
// Keep this in sync with the future Supabase `products` table (see docs/DECISIONS.md).

export type Category =
  | "dresses"
  | "tops"
  | "bottoms"
  | "outerwear"
  | "sets"
  | "shoes"
  | "accessories";

export type StyleTag =
  | "minimal"
  | "new-chinese"
  | "streetwear"
  | "coquette"
  | "quiet-luxury"
  | "y2k"
  | "workwear";

export type ProductImage = {
  id: string;
  alt: string;
  /** A licensed image URL. `null` means we render an illustrated placeholder instead. */
  src: string | null;
  /** Two colours used to paint the placeholder illustration. */
  tone: [string, string];
};

export type Product = {
  id: string; // URL-safe slug, used in /products/[id]
  title: string; // English title
  originalTitle?: string; // Chinese title as a seller might list it
  description: string; // English description
  category: Category;
  styles: StyleTag[];
  colors: string[];
  materials: string[];
  tags: string[]; // extra searchable keywords
  /** Illustrative demo price. Not a real listing price. */
  price: { amount: number; currency: "CNY" } | null;
  /** `null` when sizes are not known. */
  sizes: string[] | null;
  sizeNote?: string;
  seller: { name: string; location?: string };
  /** Link to the original listing. Always `null` for demo products. */
  sourceUrl: string | null;
  images: ProductImage[];
  /** Tall cards make the grid feel more like Pinterest. */
  layout?: "regular" | "tall";
  isDemo: true;
};
