export default function OrderDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-secondary-100" />
          <div className="h-7 w-56 animate-pulse rounded-lg bg-secondary-100" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-secondary-100" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-secondary-100" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-2xl bg-secondary-100" />
          <div className="h-80 animate-pulse rounded-2xl bg-secondary-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-secondary-100" />
        </div>
        <div className="space-y-4">
          <div className="h-56 animate-pulse rounded-2xl bg-secondary-100" />
          <div className="h-48 animate-pulse rounded-2xl bg-secondary-100" />
          <div className="h-40 animate-pulse rounded-2xl bg-secondary-100" />
        </div>
      </div>
    </div>
  );
}
