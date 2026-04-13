"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ProductPerformanceReport } from "@/src/types/report.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const VARIANT_COLORS = [
  "#7c3aed", // violet
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ef4444", // red
  "#8b5cf6", // purple
];

type Metric = "units" | "revenue";

type ProductRow = ProductPerformanceReport["topByRevenue"][number];

// ─── Custom Y-axis tick (clickable product name) ──────────────────────────────

interface CustomTickProps {
  x?:       number;
  y?:       number;
  payload?: { value: string };
  productIdMap: Record<string, string>;
  onNavigate: (productId: string) => void;
}

function CustomYTick({ x = 0, y = 0, payload, productIdMap, onNavigate }: CustomTickProps) {
  if (!payload) return null;
  const productId = productIdMap[payload.value];
  const label = payload.value.length > 26 ? payload.value.slice(0, 25) + "…" : payload.value;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={4}
        textAnchor="end"
        fontSize={12}
        fill={productId ? "#7c3aed" : "#475569"}
        style={{
          cursor:         productId ? "pointer" : "default",
          textDecoration: productId ? "underline" : "none",
          userSelect:     "none",
        }}
        onClick={() => productId && onNavigate(productId)}
      >
        {label}
      </text>
    </g>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?:  boolean;
  payload?: { fill: string; value: number; dataKey: string }[];
  label?:   string;
  data:     ProductRow[];
  metric:   Metric;
}

function CustomTooltip({ active, payload, label, data, metric }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;

  const product = data.find((p) => p.name === label);

  return (
    <div className="bg-white border border-secondary-200 rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[220px]">
      <p className="font-semibold text-secondary-800 border-b border-secondary-100 pb-2 leading-snug">
        {label}
      </p>
      {payload.map((entry, i) => {
        const variant = product?.variants[i];
        if (!variant || entry.value === 0) return null;
        const display =
          metric === "units"
            ? entry.value.toLocaleString("vi-VN") + " sản phẩm"
            : new Intl.NumberFormat("vi-VN", {
                style:    "currency",
                currency: "VND",
                maximumFractionDigits: 0,
              }).format(entry.value);
        return (
          <div key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: entry.fill }}
                aria-hidden="true"
              />
              <span className="text-secondary-600 truncate">{variant.name}</span>
            </div>
            <span className="font-semibold text-secondary-800 tabular-nums shrink-0">{display}</span>
          </div>
        );
      })}
      {product && (
        <p className="text-secondary-400 border-t border-secondary-100 pt-2">
          Tổng:{" "}
          <span className="font-semibold text-secondary-700 tabular-nums">
            {metric === "units"
              ? product.unitsSold.toLocaleString("vi-VN") + " sản phẩm"
              : new Intl.NumberFormat("vi-VN", {
                  style: "currency", currency: "VND", maximumFractionDigits: 0,
                }).format(product.revenue)}
          </span>
        </p>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductStackedBarChartProps {
  data: ProductRow[];
}

export function ProductStackedBarChart({ data }: ProductStackedBarChartProps) {
  const router = useRouter();
  const [metric, setMetric] = useState<Metric>("units");

  // Max number of variants across all products
  const maxVariants = Math.max(...data.map((p) => p.variants.length), 1);

  // Map product name → productId for Y-axis clicks
  const productIdMap: Record<string, string> = {};
  data.forEach((p) => { productIdMap[p.name] = p.productId; });

  // Build recharts data rows
  const chartData = data.map((p) => {
    const row: Record<string, unknown> = { name: p.name };
    p.variants.forEach((v, i) => {
      if (metric === "units") {
        row[`v${i}`] = v.unitsSold;
      } else {
        // Distribute revenue proportionally by variant unitsSold
        const share = p.unitsSold > 0 ? v.unitsSold / p.unitsSold : 0;
        row[`v${i}`] = Math.round(p.revenue * share);
      }
    });
    return row;
  });

  const xFormatter =
    metric === "units"
      ? (v: number) => v.toLocaleString("vi-VN")
      : (v: number) => (v / 1_000_000).toFixed(0) + "M";

  const chartHeight = Math.max(320, data.length * 54);

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-secondary-800">Sản phẩm bán chạy</h2>
        <div className="flex items-center gap-1">
          {(["units", "revenue"] as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={[
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                metric === m
                  ? "bg-violet-100 text-violet-700"
                  : "text-secondary-500 hover:bg-secondary-100",
              ].join(" ")}
            >
              {m === "units" ? "Số lượng" : "Doanh thu"}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-secondary-400 mb-4">
        Nhấn tên sản phẩm để xem chi tiết · Màu sắc phân biệt phiên bản
      </p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={xFormatter}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={200}
            tickLine={false}
            axisLine={false}
            tick={
              <CustomYTick
                productIdMap={productIdMap}
                onNavigate={(id) => router.push(`/products/${id}`)}
              />
            }
          />
          <Tooltip
            content={
              <CustomTooltip data={data} metric={metric} />
            }
            cursor={{ fill: "#f1f5f9" }}
          />
          {Array.from({ length: maxVariants }, (_, i) => (
            <Bar
              key={i}
              dataKey={`v${i}`}
              stackId="stack"
              fill={VARIANT_COLORS[i % VARIANT_COLORS.length]}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Color legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-secondary-100 pt-3">
        {Array.from({ length: maxVariants }, (_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: VARIANT_COLORS[i % VARIANT_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-secondary-500">Phiên bản {i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
