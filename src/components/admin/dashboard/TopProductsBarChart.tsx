"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Metric = "units" | "revenue";

export interface TopProductsBarChartProps {
  data: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TopProductsBarChart({ data }: TopProductsBarChartProps) {
  const [metric, setMetric] = useState<Metric>("units");

  const dataKey = metric === "units" ? "unitsSold" : "revenue";

  const xTickFormatter =
    metric === "units"
      ? (v?: number) => (v ?? 0).toLocaleString("vi-VN")
      : (v?: number) => ((v ?? 0) / 1_000_000).toFixed(1) + "M";

  const tooltipFormatter =
    metric === "units"
      ? (v: unknown): [string, string] => {
          const num =
            typeof v === "number"
              ? v
              : Number.isFinite(Number(v))
                ? Number(v)
                : 0;
          return [num.toLocaleString("vi-VN") + " sản phẩm", "Số lượng"];
        }
      : (v: unknown): [string, string] => {
          const num =
            typeof v === "number"
              ? v
              : Number.isFinite(Number(v))
                ? Number(v)
                : 0;
          return [num.toLocaleString("vi-VN") + "₫", "Doanh thu"];
        };

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-secondary-800">
          Sản phẩm bán chạy
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMetric("units")}
            className={[
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              metric === "units"
                ? "bg-violet-100 text-violet-700"
                : "text-secondary-500 hover:bg-secondary-100",
            ].join(" ")}
          >
            Số lượng
          </button>
          <button
            type="button"
            onClick={() => setMetric("revenue")}
            className={[
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              metric === "revenue"
                ? "bg-violet-100 text-violet-700"
                : "text-secondary-500 hover:bg-secondary-100",
            ].join(" ")}
          >
            Doanh thu
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={xTickFormatter}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={160}
            tick={{ fontSize: 12, fill: "#475569" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(v) => tooltipFormatter(v)}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Bar dataKey={dataKey} fill="#7c3aed" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.productId}
                cursor="pointer"
                onClick={() => {
                  // stub — real impl would navigate
                  console.log("Navigate to product:", entry.productId);
                }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
