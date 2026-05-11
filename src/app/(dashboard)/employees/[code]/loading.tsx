import { Skeleton } from "@/src/components/ui/Skeleton";

export default function EmployeeDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Skeleton className="h-4 w-40" />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Two-column */}
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* Left cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-4 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right tabs */}
        <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
          <div className="border-b border-secondary-200 px-6 py-3">
            <div className="flex gap-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="rounded-lg border border-secondary-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
