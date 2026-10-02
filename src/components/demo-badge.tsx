// A visible label so nobody mistakes demo items for real listings.
export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-muted ${className}`}
    >
      Demo
    </span>
  );
}
