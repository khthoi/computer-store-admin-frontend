import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { VariantSalesStats } from "@/src/types/product.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

// ─── Sub-component ────────────────────────────────────────────────────────────

function StatRow({
  label,
  value,
  valueClass = "",
}: {
  label:       string;
  value:       React.ReactNode;
  valueClass?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2 border-b border-secondary-50 last:border-0">
      <span className="text-xs text-secondary-400">{label}</span>
      <span className={["text-sm font-semibold text-secondary-800 tabular-nums", valueClass].filter(Boolean).join(" ")}>
        {value}
      </span>
    </li>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface VariantSalesStatsCardProps {
  stats: VariantSalesStats;
}

export function VariantSalesStatsCard({ stats }: VariantSalesStatsCardProps) {
  return (
    <div className="rounded-xl border border-secondary-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary-500">
        <ShoppingBagIcon className="w-4 h-4" aria-hidden="true" />
        Thống kê đơn
      </h2>

      <ul>
        <StatRow
          label="Đơn hàng"
          value={`${stats.tongDonHang.toLocaleString("vi-VN")} đơn`}
        />
        <StatRow
          label="Đã bán"
          value={`${stats.tongSoLuongBan.toLocaleString("vi-VN")} sản phẩm`}
        />
        <StatRow
          label="Doanh thu"
          value={vnd.format(stats.doanhThu)}
        />
        <StatRow
          label="Tỉ lệ hoàn trả"
          value={`${stats.tyLeHoanTra.toFixed(1)}%`}
          valueClass={stats.tyLeHoanTra > 3 ? "text-amber-600" : ""}
        />
      </ul>
    </div>
  );
}
