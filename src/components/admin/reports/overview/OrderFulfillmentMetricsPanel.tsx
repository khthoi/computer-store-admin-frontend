import { StatCard } from "@/src/components/admin/StatCard";
import {
  ClockIcon,
  TruckIcon,
  XCircleIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderFulfillmentMetrics {
  avgFulfillmentHours: number;
  onTimeRate: number;
  cancellationRate: number;
  returnRate: number;
}

interface OrderFulfillmentMetricsPanelProps {
  metrics: OrderFulfillmentMetrics;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OrderFulfillmentMetricsPanel — server component showing 4 fulfillment KPI cards.
 */
export function OrderFulfillmentMetricsPanel({
  metrics,
}: OrderFulfillmentMetricsPanelProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Thời gian xử lý TB"
        value={`${metrics.avgFulfillmentHours}h`}
        variant="default"
        icon={<ClockIcon className="w-5 h-5" />}
      />

      <StatCard
        title="Giao đúng hạn"
        value={`${metrics.onTimeRate}%`}
        variant="success"
        icon={<TruckIcon className="w-5 h-5" />}
      />

      <StatCard
        title="Tỷ lệ huỷ"
        value={`${metrics.cancellationRate}%`}
        variant="warning"
        icon={<XCircleIcon className="w-5 h-5" />}
      />

      <StatCard
        title="Tỷ lệ trả hàng"
        value={`${metrics.returnRate}%`}
        variant="error"
        icon={<ArrowUturnLeftIcon className="w-5 h-5" />}
      />
    </div>
  );
}
