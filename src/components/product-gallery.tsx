"use client";

import { useState } from "react";
import type { Category, ProductImage } from "@/types/product";
import { ProductArt } from "./product-art";

export function ProductGallery({ images, category }: { images: ProductImage[]; category: Category }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <ProductArt
        image={current}
        category={category}
        eager
        sizes="(min-width: 768px) 50vw, 100vw"
        className="aspect-[4/5] rounded-[28px]"
      />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2" role="group" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              aria-pressed={i === active}
              className={`overflow-hidden rounded-xl border-2 transition-colors ${
                i === active ? "border-ink" : "border-transparent"
              }`}
            >
              <ProductArt image={img} category={category} className="h-20 w-16" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
