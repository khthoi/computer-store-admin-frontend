"use client";

import { useState, useEffect }  from "react";
import Link                     from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { KpiCardGrid }          from "../KpiCardGrid";
import { ReportPeriodSelector } from "../ReportPeriodSelector";
import { PromotionRoiTable }    from "../PromotionRoiTable";
import { DataTable }            from "../DataTable";
import { Badge }                from "@/src/components/ui/Badge";
import { Skeleton }             from "@/src/components/ui/Skeleton";
import { Tooltip as UiTooltip } from "@/src/components/ui/Tooltip";
import { getPromotionReport }   from "@/src/services/report.service";
import type { PromotionReport, ReportPeriod } from "@/src/types/report.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  coupon:       "Mã giảm giá",
  flash_sale:   "Flash sale",
  point_reward: "Điểm thưởng",
};

const DISCOUNT_TYPE_COLORS: Record<string, string> = {
  coupon:       "#7c3aed",
  flash_sale:   "#f59e0b",
  point_reward: "#06b6d4",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface PromotionReportClientProps {
  initialData: PromotionReport;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionReportClient({ initialData }: PromotionReportClientProps) {
  const [period,  setPeriod]  = useState<ReportPeriod>("30d");
  const [data,    setData]    = useState<PromotionReport>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPromotionReport(period).then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [period]);

  const flashRows = data.flashSaleConversion.map((f) => ({
    name: (
      <UiTooltip content={f.name} placement="top" anchorToContent>
        <Link
          href={`/promotions/flash-sales/${f.saleId}`}
          className="block max-w-[200px] truncate font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          {f.name}
        </Link>
      </UiTooltip>
    ),
    viewCount: <span className="tabular-nums">{f.viewCount.toLocaleString("vi-VN")}</span>,
    orderCount: <span className="tabular-nums">{f.orderCount.toLocaleString("vi-VN")}</span>,
    conversion: (
      <Badge
        variant={f.conversionRate > 5 ? "success" : f.conversionRate >= 2 ? "warning" : "error"}
        size="sm"
      >
        {f.conversionRate.toFixed(1)}%
      </Badge>
    ),
    revenue: <span className="tabular-nums">{vnd(f.revenue)}</span>,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Báo cáo Khuyến mãi</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Hiệu quả chương trình, ROI và tỉ lệ chuyển đổi flash sale</p>
        </div>
        <ReportPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? <PromotionSkeleton /> : (
        <>
          <KpiCardGrid cards={[
            data.kpis.totalPromotions,
            data.kpis.couponUsageRate,
            data.kpis.avgDiscountDepth,
            data.kpis.incrementalRevenue,
          ]} />

          {/* ROI table */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-secondary-800">Hiệu quả theo chương trình</h2>
            <PromotionRoiTable data={data.promotionEffectiveness} />
          </div>

          {/* Discount by type donut + flash sale table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donut */}
            <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-secondary-800 mb-4">Tổng giảm giá theo loại</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.discountByType}
                    dataKey="total"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {data.discountByType.map((d, i) => (
                      <Cell key={i} fill={DISCOUNT_TYPE_COLORS[d.type] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, name) => [
                      vnd(Number(v)),
                      DISCOUNT_TYPE_LABELS[String(name)] ?? String(name),
                    ]}
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                {data.discountByType.map((d) => (
                  <div key={d.type} className="flex items-center gap-1.5">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: DISCOUNT_TYPE_COLORS[d.type] ?? "#94a3b8" }}
                      aria-hidden="true"
                    />
                    <span className="text-xs text-secondary-600">
                      {DISCOUNT_TYPE_LABELS[d.type] ?? d.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Flash sale conversion */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-secondary-800">Tỉ lệ chuyển đổi Flash Sale</h3>
              <DataTable
                columns={[
                  { key: "name",       label: "Tên"           },
                  { key: "viewCount",  label: "Lượt xem",     align: "right" },
                  { key: "orderCount", label: "Đơn hàng",     align: "right" },
                  { key: "conversion", label: "Tỉ lệ",        align: "center" },
                  { key: "revenue",    label: "Doanh thu",    align: "right" },
                ]}
                rows={flashRows}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function vnd(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
}

function PromotionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton variant="rect" className="h-56 rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="rect" className="h-72 rounded-2xl" />
        <Skeleton variant="rect" className="h-72 rounded-2xl" />
      </div>
    </div>
  );
}
