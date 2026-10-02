import type { Product } from "@/types/product";

export function formatPrice(price: Product["price"]): string {
  if (!price) return "Price unavailable";
  return `¥${price.amount.toLocaleString("en-AU")}`;
}
