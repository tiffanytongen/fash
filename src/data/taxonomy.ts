import type { Category, StyleTag } from "@/types/product";

export const CATEGORIES: { id: Category; label: string }[] = [
  { id: "dresses", label: "Dresses" },
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "sets", label: "Sets" },
  { id: "shoes", label: "Shoes" },
  { id: "accessories", label: "Accessories" },
];

export const STYLES: { id: StyleTag; label: string; blurb: string }[] = [
  { id: "minimal", label: "Minimal", blurb: "Clean lines, quiet colours" },
  { id: "new-chinese", label: "New Chinese", blurb: "新中式 — modern takes on tradition" },
  { id: "streetwear", label: "Streetwear", blurb: "Oversized, utility, sporty" },
  { id: "coquette", label: "Coquette", blurb: "Bows, lace, soft pinks" },
  { id: "quiet-luxury", label: "Quiet luxury", blurb: "Tailored, neutral, polished" },
  { id: "y2k", label: "Y2K", blurb: "Low-rise, shine, playful" },
  { id: "workwear", label: "Workwear", blurb: "Office-ready and breathable" },
];

export const categoryLabel = (id: Category) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const styleLabel = (id: StyleTag) =>
  STYLES.find((s) => s.id === id)?.label ?? id;
