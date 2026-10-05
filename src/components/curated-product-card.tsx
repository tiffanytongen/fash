import { MATCH_TYPE_LABELS, type CuratedProduct } from "@/types/curation";

// One hand-picked recommendation on a request page.

const TAOBAO_HOSTS = ["taobao.com", "tmall.com", "tb.cn", "tmall.hk"];

/** Only link out to real Taobao/Tmall https URLs. */
export function safeTaobaoUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const ok = u.protocol === "https:" && TAOBAO_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith(`.${h}`));
    return ok ? u.toString() : null;
  } catch {
    return null;
  }
}

const formatCny = (n: number) => `¥${n.toLocaleString("en-AU")}`;
const formatLocal = (amount: number, currency: string) =>
  `${currency === "MYR" ? "RM" : "A$"}${amount.toLocaleString("en-AU", { maximumFractionDigits: 0 })}`;

export function CuratedProductCard({ product, index }: { product: CuratedProduct; index: number }) {
  const link = safeTaobaoUrl(product.taobaoUrl);

  return (
    <article className="overflow-hidden rounded-[28px] bg-card">
      <div className="grid gap-0 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-line/50 sm:aspect-auto sm:min-h-full">
          {product.image.url ? (
            // Curator-supplied listing photos come from external hosts (e.g. alicdn),
            // which next/image would need configuring for. A plain <img> is enough here.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image.url}
              alt={product.image.alt}
              referrerPolicy="no-referrer"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={product.image.alt}
              className="absolute inset-0 grid place-items-center bg-gradient-to-br from-line/40 to-line text-xs uppercase tracking-[0.14em] text-muted"
            >
              {product.isDemo ? "Demo · no image" : "Image unavailable"}
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-medium text-ink">
            #{index + 1} · {MATCH_TYPE_LABELS[product.matchType]}
          </span>
          {product.isDemo && (
            <span className="absolute right-3 top-3 rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-accent">
              Demo
            </span>
          )}
        </div>

        {/* Details */}
        <div className="p-5 md:p-6">
          <h3 className="font-serif text-2xl leading-tight">{product.title}</h3>
          {product.priceCny !== null && (
            <p className="mt-1.5 text-[15px]">
              {formatCny(product.priceCny)}
              {product.convertedPrice && (
                <span className="text-muted">
                  {" "}
                  · ≈ {formatLocal(product.convertedPrice.amount, product.convertedPrice.currency)}
                </span>
              )}
            </p>
          )}

          <p className="mt-4 text-[15px] leading-relaxed text-ink">
            <span className="text-xs uppercase tracking-[0.14em] text-muted">Why we picked it · </span>
            {product.whyItMatches}
          </p>

          <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Shop</dt>
              <dd className="mt-0.5">
                <span className="text-ink">{product.shop.name}</span>
                <span className="text-muted"> — {product.shop.qualityNote}</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Reviews</dt>
              <dd className="mt-0.5 text-ink/85">{product.reviewNote}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.14em] text-muted">Sizing</dt>
              <dd className="mt-0.5 text-ink/85">
                {product.availableSizes && product.availableSizes.length > 0 && (
                  <span className="mr-1.5 inline-flex flex-wrap gap-1 align-middle">
                    {product.availableSizes.map((s) => (
                      <span key={s} className="rounded-full border border-line px-2 py-0.5 text-xs">
                        {s}
                      </span>
                    ))}
                  </span>
                )}
                {product.sizingNote}
              </dd>
            </div>
          </dl>

          {product.curatorNote && (
            <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-sm italic text-ink/85">
              <span className="not-italic text-muted">Curator&apos;s note: </span>
              {product.curatorNote}
            </p>
          )}

          {product.tags && product.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Tags">
              {product.tags.map((t) => (
                <li key={t} className="rounded-full bg-paper px-2.5 py-0.5 text-xs text-muted">
                  {t}
                </li>
              ))}
            </ul>
          )}

          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-sm text-paper sm:w-auto sm:px-7"
            >
              View on Taobao ↗
            </a>
          ) : (
            <span
              aria-disabled
              className="mt-5 inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-line text-sm text-muted sm:w-auto sm:px-7"
            >
              {product.isDemo ? "Demo item — no Taobao link" : "Link coming soon"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
