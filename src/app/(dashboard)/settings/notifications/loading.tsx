import { Skeleton } from "@/src/components/ui/Skeleton";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { NotificationStatCards } from "@/src/components/admin/notifications/NotificationStatCards";

const EMPTY_STATS = {
  tongThongBao: 0, chuaGui: 0, daGui: 0,
  thatBai: 0, huyBo: 0, tyLeDaDoc: 0,
};

export default function NotificationsLoading() {
  return (
    <AdminPageWrapper title="Thông báo hệ thống" isLoading>
      <div className="space-y-6">
        {/* KPI skeleton */}
        <NotificationStatCards stats={EMPTY_STATS} isLoading />

        {/* Table skeleton */}
        <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
          {/* Tab bar skeleton */}
          <div className="border-b border-secondary-200 px-6 flex gap-6 pt-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-36 rounded-md mb-px" />
            ))}
          </div>
          {/* Toolbar skeleton */}
          <div className="border-b border-secondary-100 px-4 py-3 flex gap-3">
            <Skeleton className="h-9 w-60 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
            <div className="ml-auto">
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>
          {/* Rows skeleton */}
          <div className="divide-y divide-secondary-50 px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5">
                <Skeleton className="h-4 w-8  rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-6  rounded ml-auto" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}
