"use client";

import { useState, useEffect } from "react";
import Link                     from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { KpiCardGrid }          from "../KpiCardGrid";
import { ReportPeriodSelector } from "../ReportPeriodSelector";
import { DataTable }            from "../DataTable";
import { TopProductsBarChart }  from "@/src/components/admin/dashboard/TopProductsBarChart";
import { OrdersByStatusDonut }  from "@/src/components/admin/dashboard/OrdersByStatusDonut";
import { Skeleton }             from "@/src/components/ui/Skeleton";
import { Tooltip as UiTooltip } from "@/src/components/ui/Tooltip";
import { getRevenueReport }     from "@/src/services/report.service";
import type { RevenueReport, ReportPeriod } from "@/src/types/report.types";

// ─── Channel config ───────────────────────────────────────────────────────────

const CHANNEL_LABELS: Record<string, string> = {
  website:  "Website",
  mobile:   "Mobile App",
  reseller: "Đại lý",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueReportClientProps {
  initialData: RevenueReport;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueReportClient({ initialData }: RevenueReportClientProps) {
  const [period,    setPeriod]    = useState<ReportPeriod>("30d");
  const [data,      setData]      = useState<RevenueReport>(initialData);
  const [loading,   setLoading]   = useState(false);
  const [chartMode, setChartMode] = useState<"gmv" | "net">("gmv");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getRevenueReport(period).then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [period]);

  const chartData = data.gmvSeries.map((p, i) => ({
    date:       p.date,
    GMV:        p.value,
    "Thuần":    data.netRevenueSeries[i]?.value ?? 0,
  }));

  const categoryBarData = data.revenueByCategory.map((c) => ({
    productId: c.category,
    name:      c.category,
    unitsSold: 0,
    revenue:   c.revenue,
  }));

  const channelDonutData = data.revenueByChannel.map((c) => ({
    status: c.channel,
    count:  c.revenue,
  }));

  const couponRows = data.topCoupons.map((c) => ({
    code: (
      <UiTooltip content={`Xem chi tiết mã ${c.code}`} placement="top">
        <Link
          href={`/promotions/coupons/${c.couponId}`}
          className="inline-block max-w-[140px] truncate font-mono font-semibold text-violet-700 hover:text-violet-900 hover:underline"
        >
          {c.code}
        </Link>
      </UiTooltip>
    ),
    usageCount:         <span className="tabular-nums">{c.usageCount.toLocaleString("vi-VN")}</span>,
    discountTotal:      <span className="tabular-nums text-error-600">{vnd(c.discountTotal)}</span>,
    incrementalRevenue: <span className="tabular-nums text-success-600">{vnd(c.incrementalRevenue)}</span>,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Báo cáo Doanh thu</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Phân tích GMV, doanh thu thuần và các nguồn doanh thu</p>
        </div>
        <ReportPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? <RevenueReportSkeleton /> : (
        <>
          {/* KPIs */}
          <KpiCardGrid cards={[
            data.kpis.gmv,
            data.kpis.netRevenue,
            data.kpis.avgOrderValue,
            data.kpis.returnRate,
          ]} />

          {/* Dual-line revenue chart */}
          <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-secondary-800">Xu hướng doanh thu</h2>
              <div className="flex items-center gap-1">
                {(["gmv", "net"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setChartMode(m)}
                    className={[
                      "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                      chartMode === m
                        ? "bg-violet-100 text-violet-700"
                        : "text-secondary-500 hover:bg-secondary-100",
                    ].join(" ")}
                  >
                    {m === "gmv" ? "GMV" : "Doanh thu thuần"}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v / 1_000_000).toFixed(1) + "M"}
                  width={52}
                />
                <Tooltip
                  formatter={(v, name) => [Number(v).toLocaleString("vi-VN") + "₫", String(name)]}
                  labelFormatter={(l) => new Date(l).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                {chartMode === "gmv" ? (
                  <Line type="monotone" dataKey="GMV" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                ) : (
                  <Line type="monotone" dataKey="Thuần" stroke="#0ea5e9" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category + Channel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsBarChart data={categoryBarData} />
            <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-secondary-800 mb-4">Doanh thu theo kênh</h2>
              <OrdersByStatusDonut
                data={channelDonutData.map((d) => ({
                  status: d.status,
                  count:  Math.round(d.count / 1_000_000),
                }))}
              />
            </div>
          </div>

          {/* Top coupons */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-secondary-800">Top mã giảm giá</h2>
            <DataTable
              columns={[
                { key: "code",               label: "Mã"                 },
                { key: "usageCount",         label: "Lượt dùng", align: "right" },
                { key: "discountTotal",      label: "Tổng giảm",  align: "right" },
                { key: "incrementalRevenue", label: "DT tăng thêm", align: "right" },
              ]}
              rows={couponRows}
            />
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

function RevenueReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton variant="rect" className="h-72 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="rect" className="h-80 rounded-2xl" />
        <Skeleton variant="rect" className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
