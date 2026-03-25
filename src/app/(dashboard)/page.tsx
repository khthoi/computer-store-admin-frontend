import type { Metadata } from "next";
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { AdminPageWrapper } from "@/src/components/admin/layout/AdminPageWrapper";
import { StatCard } from "@/src/components/admin/StatCard";
import { RevenueLineChart } from "@/src/components/admin/dashboard/RevenueLineChart";
import { TopProductsBarChart } from "@/src/components/admin/dashboard/TopProductsBarChart";
import { OrdersByStatusDonut } from "@/src/components/admin/dashboard/OrdersByStatusDonut";
import { RecentOrdersTable } from "@/src/components/admin/dashboard/RecentOrdersTable";
import { LowStockAlertList } from "@/src/components/admin/dashboard/LowStockAlertList";
import {
  REVENUE_DATA,
  TOP_PRODUCTS_DATA,
  ORDERS_BY_STATUS_DATA,
  RECENT_ORDERS_DATA,
  LOW_STOCK_DATA,
} from "./_mock";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <AdminPageWrapper title="Dashboard">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Doanh thu"
          value="2,4 tỷ ₫"
          changePercent={12}
          changeLabel="so với tháng trước"
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          variant="primary"
          sparklineData={[180, 210, 190, 240, 220, 260, 250, 280, 240]}
        />
        <StatCard
          title="Đơn hàng"
          value="1.842"
          changePercent={8}
          changeLabel="so với tháng trước"
          icon={<ShoppingBagIcon className="w-5 h-5" />}
          variant="success"
          sparklineData={[120, 140, 130, 160, 155, 170, 165, 180, 175]}
        />
        <StatCard
          title="Người dùng mới"
          value="347"
          changePercent={24}
          changeLabel="so với tháng trước"
          icon={<UsersIcon className="w-5 h-5" />}
          variant="warning"
          sparklineData={[20, 28, 24, 32, 30, 38, 36, 42, 40]}
        />
        <StatCard
          title="Sắp hết hàng"
          value="12 sản phẩm"
          changePercent={-3}
          changeLabel="so với tuần trước"
          icon={<ExclamationTriangleIcon className="w-5 h-5" />}
          variant="error"
          sparklineData={[18, 16, 17, 15, 14, 13, 15, 14, 12]}
        />
      </div>

      {/* Row 2: Revenue chart + Orders donut */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <RevenueLineChart data={REVENUE_DATA} defaultPeriod="30d" />
        <OrdersByStatusDonut data={ORDERS_BY_STATUS_DATA} />
      </div>

      {/* Row 3: Top products + Low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <TopProductsBarChart data={TOP_PRODUCTS_DATA} />
        <LowStockAlertList items={LOW_STOCK_DATA} />
      </div>

      {/* Row 4: Recent orders (full width) */}
      <h2 className="text-sm font-semibold text-secondary-500 uppercase tracking-wide mb-3">
        Đơn hàng gần đây
      </h2>
      <RecentOrdersTable orders={RECENT_ORDERS_DATA} />
    </AdminPageWrapper>
  );
}
