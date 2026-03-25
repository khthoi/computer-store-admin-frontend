// Skeleton for the Dashboard page — shown by Next.js during server-side loading.
// Must be a server component (no "use client").

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Page title skeleton */}
      <div className="h-8 w-48 bg-secondary-200 rounded-md" />

      {/* KPI row — 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-secondary-200 rounded" />
              <div className="h-8 w-8 bg-secondary-200 rounded-lg" />
            </div>
            <div className="h-7 w-32 bg-secondary-200 rounded" />
            <div className="h-3 w-20 bg-secondary-100 rounded" />
          </div>
        ))}
      </div>

      {/* Row 2: Revenue chart + Orders donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="h-5 w-36 bg-secondary-200 rounded" />
          <div className="h-56 bg-secondary-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="h-5 w-36 bg-secondary-200 rounded" />
          <div className="h-56 bg-secondary-100 rounded-full mx-auto w-56" />
        </div>
      </div>

      {/* Row 3: Top products + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="h-5 w-40 bg-secondary-200 rounded" />
          <div className="h-56 bg-secondary-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
          <div className="h-5 w-32 bg-secondary-200 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-0">
              <div className="space-y-1">
                <div className="h-4 w-48 bg-secondary-200 rounded" />
                <div className="h-3 w-24 bg-secondary-100 rounded" />
              </div>
              <div className="h-6 w-16 bg-secondary-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Row 4: Recent orders table */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
        <div className="h-5 w-36 bg-secondary-200 rounded" />
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 pb-2 border-b border-secondary-100">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-secondary-200 rounded" />
          ))}
        </div>
        {/* Table rows */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 py-2">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 bg-secondary-100 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
