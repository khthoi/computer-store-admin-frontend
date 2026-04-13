import { Skeleton } from "@/src/components/ui/Skeleton";

/**
 * Loading skeleton for /audit-logs — shown by Next.js App Router
 * while AuditLogsPage suspends during server-side rendering.
 */
export default function AuditLogsLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto w-full">
      {/* Page header skeleton */}
      <div className="mb-6 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="h-4 w-80 rounded" />
        </div>
      </div>

      {/* Toolbar skeleton */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-44 rounded-lg" />
        <div className="ml-auto">
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl border border-secondary-200 bg-white">
        {/* Table header */}
        <div className="grid grid-cols-7 gap-4 border-b border-secondary-100 bg-secondary-50 px-4 py-3">
          {["w-32", "w-40", "w-24", "w-36", "flex-1", "w-24", "w-10"].map(
            (w, i) => (
              <Skeleton key={i} className={`h-3.5 ${w} rounded`} />
            )
          )}
        </div>

        {/* Table rows */}
        {Array.from({ length: 10 }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid grid-cols-7 gap-4 border-b border-secondary-50 px-4 py-3.5 last:border-0"
          >
            {/* Timestamp */}
            <Skeleton className="h-3.5 w-32 rounded font-mono" />

            {/* Actor: avatar + name + badge */}
            <div className="flex items-center gap-2">
              <Skeleton variant="avatar" count={1} className="shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-4 w-14 rounded-full" />
              </div>
            </div>

            {/* Action badge */}
            <Skeleton className="h-5 w-24 rounded-full" />

            {/* Entity badge + label */}
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>

            {/* Description */}
            <Skeleton className="h-3.5 w-full rounded" />

            {/* IP */}
            <Skeleton className="h-3 w-24 rounded font-mono" />

            {/* Action button */}
            <Skeleton className="h-6 w-8 rounded" />
          </div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="mt-3 flex items-center justify-between">
        <Skeleton className="h-4 w-40 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
