export default function OpportunitySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-xl border-l-4 border-y border-r p-5"
          style={{ borderColor: "var(--border)", borderLeftColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="skeleton-shimmer h-5 w-20 rounded-full" />
            <div className="skeleton-shimmer h-8 w-16 rounded-md" />
          </div>
          <div className="skeleton-shimmer mb-2 h-5 w-3/4 rounded" />
          <div className="skeleton-shimmer mb-3 h-4 w-1/2 rounded" />
          <div className="skeleton-shimmer h-3 w-full rounded" />
          <div className="skeleton-shimmer mt-1.5 h-3 w-full rounded" />
          <div className="skeleton-shimmer mt-1.5 h-3 w-2/3 rounded" />
          <div className="mt-4 flex gap-2">
            <div className="skeleton-shimmer h-4 w-20 rounded" />
            <div className="skeleton-shimmer h-4 w-24 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}