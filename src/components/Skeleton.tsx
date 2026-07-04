export function SkeletonCard() {
  return (
    <div className="bg-base-card rounded-2xl p-4 min-w-[160px] max-w-[200px] flex-shrink-0 animate-pulse">
      <div className="aspect-square mb-3 rounded-lg bg-white/10" />
      <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
      <div className="h-3 w-1/2 bg-white/10 rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-2 animate-pulse">
      <div className="w-8 h-8 bg-white/10 rounded" />
      <div className="w-10 h-10 bg-white/10 rounded" />
      <div className="flex-1">
        <div className="h-4 w-1/3 bg-white/10 rounded mb-2" />
        <div className="h-3 w-1/4 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonScroller({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
