"use client";

import { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { StatCard } from "@/src/components/admin/StatCard";
import { RevenueLineChart } from "@/src/components/admin/dashboard/RevenueLineChart";
import { TopProductsBarChart } from "@/src/components/admin/dashboard/TopProductsBarChart";
import { OrdersByStatusDonut } from "@/src/components/admin/dashboard/OrdersByStatusDonut";
import { RecentOrdersTable } from "@/src/components/admin/dashboard/RecentOrdersTable";
import { LowStockAlertList } from "@/src/components/admin/dashboard/LowStockAlertList";
import { DashboardService, type DashboardOverview } from "@/src/services/dashboard/dashboard.service";
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
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    DashboardService.getOverview()
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const loading = data === null && error === null;

  if (error) {
    return (
      <p className="text-sm text-error-600 bg-error-50 border border-error-200 rounded-lg p-4">
        Không thể tải dữ liệu dashboard: {error}
      </p>
    );
  }

  return (
    <>
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
      </div>

      {/* Row 2: Revenue chart + Orders donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <RevenueLineChart
          data={data?.revenueChart ?? []}
          defaultPeriod="30d"
        />
        <OrdersByStatusDonut data={data?.ordersByStatus ?? []} />
      </div>

      {/* Row 3: Top products + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <TopProductsBarChart data={data?.topProducts ?? []} />
        <LowStockAlertList items={data?.lowStock ?? []} />
      </div>

      {/* Row 4: Recent orders */}
      <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">
        Đơn hàng gần đây
      </h2>
      <RecentOrdersTable orders={data?.recentOrders ?? []} />
    </>
  );
}
