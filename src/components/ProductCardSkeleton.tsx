export default function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="aspect-square skeleton-shimmer" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-4 skeleton-shimmer w-4/5 rounded-lg" />
        <div className="h-4 skeleton-shimmer w-2/3 rounded-lg" />
        <div className="h-6 skeleton-shimmer w-1/2 rounded-lg" />
        <div className="h-3 skeleton-shimmer w-full rounded-lg" />
      </div>
    </div>
  );
}
