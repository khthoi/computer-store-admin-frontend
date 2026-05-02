import { StatCard } from "@/src/components/admin/StatCard";
import { formatVND } from "@/src/lib/format";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import type { InventoryStats } from "@/src/types/inventory.types";

interface InventoryStatsBarProps {
  stats: InventoryStats;
}

export function InventoryStatsBar({ stats }: InventoryStatsBarProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        title="Tổng SKU"
        value={stats.totalSkus.toLocaleString("vi-VN")}
        icon={<CubeIcon className="w-5 h-5" />}
        variant="default"
      />
      <StatCard
        title="Tổng tồn kho"
        value={stats.totalUnits.toLocaleString("vi-VN")}
        icon={<BanknotesIcon className="w-5 h-5" />}
        variant="primary"
      />
      <StatCard
        title="Sắp hết hàng"
        value={stats.lowStockCount.toLocaleString("vi-VN")}
        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
        variant="warning"
      />
      <StatCard
        title="Hết hàng"
        value={stats.outOfStockCount.toLocaleString("vi-VN")}
        icon={<XCircleIcon className="w-5 h-5" />}
        variant="error"
      />
    </div>
  );
}
