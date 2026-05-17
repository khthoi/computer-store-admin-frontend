"use client";

import { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";

import { StatCard } from "@/src/components/admin/StatCard";
import { RevenueLineChart } from "@/src/components/admin/dashboard/RevenueLineChart";
import { TopProductsBarChart } from "@/src/components/admin/dashboard/TopProductsBarChart";
import { OrdersByStatusDonut } from "@/src/components/admin/dashboard/OrdersByStatusDonut";
import { RecentOrdersTable } from "@/src/components/admin/dashboard/RecentOrdersTable";
import { LowStockAlertList } from "@/src/components/admin/dashboard/LowStockAlertList";
import { ActionItemsGrid } from "@/src/components/admin/dashboard/ActionItemsGrid";
import { RequirePermission } from "@/src/components/admin/auth/RequirePermission";
import { DashboardService, type DashboardOverview } from "@/src/services/dashboard/dashboard.service";
import { useAuth } from "@/src/store/auth.store";
import { formatVND } from "@/src/lib/format";

function formatShortVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + " tỷ ₫";
  }
  if (amount >= 1_000_000) {
    return (amount / 1_000_000).toFixed(0) + " triệu ₫";
  }
  return formatVND(amount);
}

export function DashboardClient() {
  const { hasPermission } = useAuth();
  const canViewReports = hasPermission("reports.read");

  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Tracks whether the action-items grid had any cards to render. Drives the
  // empty state at the bottom of the page when the user can see nothing else.
  const [actionItemsEmpty, setActionItemsEmpty] = useState(false);

  useEffect(() => {
    if (!canViewReports) return;
    DashboardService.getOverview()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [canViewReports]);

  const loading = canViewReports && data === null && error === null;
  const showOverviewBlock = canViewReports;
  const isCompletelyEmpty = !showOverviewBlock && actionItemsEmpty;

  return (
    <>
      {/* Top: action items (everyone — content filtered by backend) */}
      <ActionItemsGrid onEmpty={() => setActionItemsEmpty(true)} />

      {/* Reports/KPIs block — only for users with reports.read */}
      {showOverviewBlock && (
        <>
          {error && (
            <p className="mb-6 rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-600">
              Không thể tải dữ liệu dashboard: {error}
            </p>
          )}

          {/* KPI row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              title="Doanh thu"
              value={data ? formatShortVND(data.kpis.revenue.value) : "—"}
              changePercent={data?.kpis.revenue.changePercent}
              changeLabel="so với tháng trước"
              icon={<CurrencyDollarIcon className="w-5 h-5" />}
              variant="primary"
              sparklineData={data?.kpis.revenue.sparkline}
              isLoading={loading}
            />
            <StatCard
              title="Đơn hàng"
              value={data ? data.kpis.orders.value.toLocaleString("vi-VN") : "—"}
              changePercent={data?.kpis.orders.changePercent}
              changeLabel="so với tháng trước"
              icon={<ShoppingBagIcon className="w-5 h-5" />}
              variant="success"
              sparklineData={data?.kpis.orders.sparkline}
              isLoading={loading}
            />
            <RequirePermission
              permission="customers.read"
              fallback={
                <StatCard
                  title="Người dùng mới"
                  value="—"
                  changeLabel="Không có quyền xem"
                  icon={<UsersIcon className="w-5 h-5" />}
                  variant="warning"
                  isLoading={false}
                />
              }
            >
              <StatCard
                title="Người dùng mới"
                value={data ? data.kpis.newCustomers.value.toLocaleString("vi-VN") : "—"}
                changePercent={data?.kpis.newCustomers.changePercent}
                changeLabel="so với tháng trước"
                icon={<UsersIcon className="w-5 h-5" />}
                variant="warning"
                sparklineData={data?.kpis.newCustomers.sparkline}
                isLoading={loading}
              />
            </RequirePermission>
            <RequirePermission
              permission="inventory.read"
              fallback={
                <StatCard
                  title="Sắp hết hàng"
                  value="—"
                  changeLabel="Không có quyền xem"
                  icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                  variant="error"
                  isLoading={false}
                />
              }
            >
              <StatCard
                title="Sắp hết hàng"
                value={data ? `${data.kpis.lowStockCount.value} sản phẩm` : "—"}
                changePercent={data?.kpis.lowStockCount.changePercent || undefined}
                changeLabel="so với tuần trước"
                icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                variant="error"
                sparklineData={data?.kpis.lowStockCount.sparkline}
                isLoading={loading}
              />
            </RequirePermission>
          </div>

          {/* Row 2: Revenue chart + Orders donut */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RevenueLineChart
              data={data?.revenueChart ?? []}
              defaultPeriod="30d"
            />
            <RequirePermission permission="orders.read">
              <OrdersByStatusDonut data={data?.ordersByStatus ?? []} />
            </RequirePermission>
          </div>

          {/* Row 3: Top products + Low stock */}
          <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <RequirePermission permission="products.read">
              <TopProductsBarChart data={data?.topProducts ?? []} />
            </RequirePermission>
            <RequirePermission permission="inventory.read">
              <LowStockAlertList items={data?.lowStock ?? []} />
            </RequirePermission>
          </div>

          {/* Row 4: Recent orders */}
          <RequirePermission permission="orders.read">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-secondary-500">
              Đơn hàng gần đây
            </h2>
            <RecentOrdersTable orders={data?.recentOrders ?? []} />
          </RequirePermission>
        </>
      )}

      {/* Empty state — user has no widgets at all. */}
      {isCompletelyEmpty && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <InboxIcon className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Chưa có thông tin để hiển thị
          </h3>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Tài khoản của bạn hiện không có quyền xem các widget trên dashboard.
            Liên hệ quản trị viên nếu bạn cần thêm quyền truy cập.
          </p>
        </div>
      )}
    </>
  );
}
