"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesPoint } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SimpleAreaChartProps {
  data:       TimeSeriesPoint[];
  color?:     string;
  height?:    number;
  valueUnit?: "vnd" | "count";
  title?:     string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SimpleAreaChart({
  data,
  color     = "#7c3aed",
  height    = 200,
  valueUnit = "count",
  title,
}: SimpleAreaChartProps) {
  const gradientId = `areaGradient-${color.replace("#", "")}`;

  const yFormatter = (v: number) =>
    valueUnit === "vnd"
      ? (v / 1_000_000).toFixed(1) + "M"
      : v.toLocaleString("vi-VN");

  const tooltipFormatter = (v: unknown): [string, string] => {
    const num = typeof v === "number" ? v : Number(v);
    return valueUnit === "vnd"
      ? [num.toLocaleString("vi-VN") + "₫", title ?? "Giá trị"]
      : [num.toLocaleString("vi-VN"), title ?? "Giá trị"];
  };

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {title && (
        <h3 className="text-sm font-semibold text-secondary-800 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("vi-VN", {
                day:   "2-digit",
                month: "2-digit",
              })
            }
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={yFormatter}
            width={52}
          />
          <Tooltip
            formatter={tooltipFormatter}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("vi-VN", {
                day:   "2-digit",
                month: "2-digit",
                year:  "numeric",
              })
            }
            contentStyle={{
              borderRadius: "8px",
              border:       "1px solid #e2e8f0",
              fontSize:     "12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
