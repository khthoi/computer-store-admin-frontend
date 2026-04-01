export default function OrdersLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-secondary-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-secondary-100" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="p-4 border-b border-secondary-100">
          <div className="flex gap-3">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-secondary-100" />
            <div className="h-10 w-40 animate-pulse rounded-lg bg-secondary-100" />
            <div className="h-10 w-40 animate-pulse rounded-lg bg-secondary-100" />
          </div>
        </div>
        <div className="divide-y divide-secondary-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="h-4 w-32 animate-pulse rounded bg-secondary-100" />
              <div className="h-4 w-40 animate-pulse rounded bg-secondary-100" />
              <div className="h-5 w-20 animate-pulse rounded-full bg-secondary-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-secondary-100" />
              <div className="ml-auto h-4 w-28 animate-pulse rounded bg-secondary-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
