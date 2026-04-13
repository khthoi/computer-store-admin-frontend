"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Period = "7d" | "30d" | "90d";

const PERIOD_DAYS: Record<Period, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

export interface RevenueLineChartProps {
  data: { date: string; revenue: number }[];
  defaultPeriod?: Period;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RevenueLineChart({
  data,
  defaultPeriod = "30d",
}: RevenueLineChartProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);

  const filteredData = data.slice(-PERIOD_DAYS[period]);

  const PERIODS: Period[] = ["7d", "30d", "90d"];

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-secondary-800">Doanh thu</h2>
        <div className="flex items-center gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={[
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                period === p
                  ? "bg-violet-100 text-violet-700"
                  : "text-secondary-500 hover:bg-secondary-100",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <LineChart
          data={filteredData}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })
            }
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v / 1_000_000).toFixed(1) + "M"}
            width={48}
          />
          <Tooltip
            formatter={(v) => [
              Number(v).toLocaleString("vi-VN") + "₫",
              "Doanh thu",
            ]}
            labelFormatter={(label) =>
              new Date(label).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            }
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#7c3aed"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#7c3aed" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
