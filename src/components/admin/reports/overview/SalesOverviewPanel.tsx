import { StatCard } from "@/src/components/admin/StatCard";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
  ArrowPathRoundedSquareIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesMetrics {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  returningRate: number;
}

interface SalesOverviewPanelProps {
  data: SalesMetrics;
  comparison?: SalesMetrics;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(n: number): string {
  return n.toLocaleString("vi-VN") + "₫";
}

function formatPercent(n: number): string {
  return n.toFixed(1) + "%";
}

function computeTrend(
  current: number,
  previous: number | undefined
): number | undefined {
  if (previous === undefined || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SalesOverviewPanel — server component that renders 4 KPI StatCards.
 * Shows trend percentages when comparison data is provided.
 */
export function SalesOverviewPanel({
  data,
  comparison,
}: SalesOverviewPanelProps) {
  const revenueTrend = computeTrend(
    data.totalRevenue,
    comparison?.totalRevenue
  );
  const orderTrend = computeTrend(data.orderCount, comparison?.orderCount);
  const avgTrend = computeTrend(
    data.avgOrderValue,
    comparison?.avgOrderValue
  );
  const returningTrend = computeTrend(
    data.returningRate,
    comparison?.returningRate
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Doanh thu"
        value={formatVND(data.totalRevenue)}
        changePercent={revenueTrend}
        changeLabel="so kỳ trước"
        variant="primary"
        icon={<CurrencyDollarIcon className="w-5 h-5" />}
      />

      <StatCard
        title="Số đơn hàng"
        value={data.orderCount.toLocaleString("vi-VN")}
        changePercent={orderTrend}
        changeLabel="so kỳ trước"
        variant="default"
        icon={<ShoppingCartIcon className="w-5 h-5" />}
      />

      <StatCard
        title="Giá trị đơn trung bình"
        value={formatVND(data.avgOrderValue)}
        changePercent={avgTrend}
        changeLabel="so kỳ trước"
        variant="success"
        icon={<ReceiptPercentIcon className="w-5 h-5" />}
      />

      <StatCard
        title="Tỷ lệ khách quay lại"
        value={formatPercent(data.returningRate)}
        changePercent={returningTrend}
        changeLabel="so kỳ trước"
        variant="warning"
        icon={<ArrowPathRoundedSquareIcon className="w-5 h-5" />}
      />
    </div>
  );
}
