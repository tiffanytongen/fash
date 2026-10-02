import { PRODUCTS } from "@/data/products";
import type { Product } from "@/types/product";

// Data-access layer for the catalogue.
//
// Every page gets products through these functions — never by importing
// PRODUCTS directly. When we move to Supabase, only this file changes:
// each function becomes a query against the `products` table.
// They are already `async` so callers won't need to change.

export async function getAllProducts(): Promise<Product[]> {
  return PRODUCTS;
}

export async function getProductById(id: string): Promise<Product | null> {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const wanted = new Set(ids);
  return PRODUCTS.filter((p) => wanted.has(p.id));
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  return PRODUCTS.filter(
    (p) =>
      p.id !== product.id &&
      (p.category === product.category || p.styles.some((s) => product.styles.includes(s))),
  ).slice(0, limit);
}
