import OpportunitySkeleton from "./opportunity-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="skeleton-shimmer mb-6 h-4 w-40 rounded" />
      <OpportunitySkeleton />
    </div>
  );
}