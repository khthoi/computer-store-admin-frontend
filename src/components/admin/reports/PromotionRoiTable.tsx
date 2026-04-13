"use client";

import Link              from "next/link";
import { Badge }         from "@/src/components/ui/Badge";
import { Tooltip }       from "@/src/components/ui/Tooltip";
import { DataTable }     from "./DataTable";
import type { PromotionReport } from "@/src/types/report.types";
import type { BadgeVariant }    from "@/src/components/ui/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PromotionRoiTableProps {
  data: PromotionReport["promotionEffectiveness"];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  coupon:       "Mã giảm giá",
  flash_sale:   "Flash sale",
  point_reward: "Điểm thưởng",
};

/** Route to the correct detail page based on promotion type */
function promotionHref(id: string, type: string): string {
  switch (type) {
    case "coupon":       return `/promotions/coupons/${id}`;
    case "flash_sale":   return `/promotions/flash-sales/${id}`;
    case "point_reward": return `/promotions/earn-rules/${id}`;
    default:             return `/promotions/${id}`;
  }
}

function roiBadge(roi: number) {
  const variant: BadgeVariant = roi > 1 ? "success" : roi >= 0.5 ? "warning" : "error";
  return <Badge variant={variant} size="sm">{roi.toFixed(2)}x</Badge>;
}

const vnd = (v: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency", currency: "VND", maximumFractionDigits: 0,
  }).format(v);

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionRoiTable({ data }: PromotionRoiTableProps) {
  const columns = [
    { key: "name",               label: "Tên chương trình"                     },
    { key: "type",               label: "Loại"                                 },
    { key: "usageCount",         label: "Lượt dùng",      align: "right" as const },
    { key: "discountTotal",      label: "Tổng giảm giá",  align: "right" as const },
    { key: "incrementalRevenue", label: "DT tăng thêm",   align: "right" as const },
    { key: "roi",                label: "ROI",             align: "center" as const },
  ];

  const rows = data.map((p) => ({
    name: (
      <Tooltip content={p.name} placement="top">
        <Link
          href={promotionHref(p.promotionId, p.type)}
          className="block max-w-[200px] truncate font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          {p.name}
        </Link>
      </Tooltip>
    ),
    type:               <span className="text-secondary-500 text-xs">{TYPE_LABELS[p.type] ?? p.type}</span>,
    usageCount:         <span className="tabular-nums">{p.usageCount.toLocaleString("vi-VN")}</span>,
    discountTotal:      <span className="tabular-nums text-error-600">{vnd(p.discountTotal)}</span>,
    incrementalRevenue: <span className="tabular-nums text-success-600">{vnd(p.incrementalRevenue)}</span>,
    roi:                roiBadge(p.roi),
  }));

  return (
    <DataTable
      columns={columns}
      rows={rows}
      emptyMessage="Không có dữ liệu khuyến mãi"
    />
  );
}
