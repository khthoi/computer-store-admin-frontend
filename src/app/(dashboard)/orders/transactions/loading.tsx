import { Skeleton } from "@/src/components/ui/Skeleton";
import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { TransactionStatCards } from "@/src/components/admin/orders/TransactionStatCards";

// ─── Skeleton stats placeholder ───────────────────────────────────────────────

const EMPTY_STATS = {
  tongGiaoDich:  0,
  tongTien:      0,
  soThanhCong:   0,
  soThatBai:     0,
  soDangCho:     0,
  soDaHoan:      0,
  tyLeThanhCong: 0,
};

// ─── Loading UI ───────────────────────────────────────────────────────────────

export default function TransactionsLoading() {
  return (
    <AdminPageWrapper title="Giao dịch thanh toán" isLoading>
      <div className="space-y-6">
        {/* KPI skeleton */}
        <TransactionStatCards stats={EMPTY_STATS} isLoading />

        {/* Table skeleton */}
        <div className="rounded-2xl border border-secondary-200 bg-white shadow-sm overflow-hidden">
          {/* Toolbar skeleton */}
          <div className="border-b border-secondary-100 px-4 py-3 flex gap-3">
            <Skeleton className="h-9 w-60 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
            <div className="ml-auto">
              <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
          </div>

          {/* Rows skeleton */}
          <div className="divide-y divide-secondary-50 px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3.5">
                <Skeleton className="h-4 w-12 rounded" />
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-24 rounded ml-auto" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}
