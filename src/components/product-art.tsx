import Image from "next/image";
import type { Category, ProductImage } from "@/types/product";

// Renders a product image. Until we have photos we're licensed to use,
// `src` is null and we draw a simple garment line-illustration on the
// product's colours. This keeps the grid visual without borrowing anyone's
// photography.

const SILHOUETTES: Record<Category, string[]> = {
  dresses: ["M38 20 Q50 28 62 20 L66 30 L60 48 L74 112 Q50 118 26 112 L40 48 L34 30 Z", "M40 48 Q50 52 60 48"],
  tops: ["M30 30 L42 24 Q50 30 58 24 L70 30 L78 46 L68 50 L66 44 L66 96 L34 96 L34 44 L32 50 L22 46 Z"],
  bottoms: ["M34 22 L66 22 L70 112 L56 112 L50 50 L44 112 L30 112 Z", "M34 30 L66 30"],
  outerwear: ["M28 26 L42 20 L50 44 L58 20 L72 26 L80 100 L66 102 L66 108 L34 108 L34 102 L20 100 Z", "M50 44 L50 108"],
  sets: [
    "M32 22 L44 18 Q50 22 56 18 L68 22 L74 36 L66 38 L66 60 L34 60 L34 38 L26 36 Z",
    "M34 68 L66 68 L68 100 L54 100 L50 84 L46 100 L32 100 Z",
  ],
  shoes: ["M22 84 Q24 70 36 70 L48 74 Q60 82 76 84 Q84 86 82 94 L24 94 Q20 92 22 84 Z", "M40 72 L52 78"],
  accessories: ["M28 50 L72 50 L76 108 L24 108 Z", "M38 50 Q38 30 50 30 Q62 30 62 50"],
};

type Props = {
  image: ProductImage;
  category: Category;
  className?: string;
  /** Pass `true` for above-the-fold images so they load first. */
  eager?: boolean;
  sizes?: string;
};

export function ProductArt({ image, category, className = "", eager, sizes }: Props) {
  if (image.src) {
    // Remote images will also need `images.remotePatterns` in next.config.ts.
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          loading={eager ? "eager" : "lazy"}
          sizes={sizes ?? "(min-width: 768px) 33vw, 50vw"}
          className="object-cover"
        />
      </div>
    );
  }

  const [from, to] = image.tone;
  return (
    <div
      role="img"
      aria-label={image.alt}
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <svg
        viewBox="0 0 100 130"
        className="absolute inset-0 m-auto h-[70%] w-[70%]"
        fill="none"
        stroke="rgba(255,255,255,0.75)"
        strokeWidth="0.9"
        strokeLinejoin="round"
        strokeLinecap="round"
        aria-hidden
      >
        {SILHOUETTES[category].map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}
