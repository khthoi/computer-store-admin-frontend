"use client";

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

interface ResolutionTimeChartProps {
  data:   { date: string; hours: number }[];
  height?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResolutionTimeChart({ data, height = 220 }: ResolutionTimeChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-secondary-800 mb-4">
        Thời gian xử lý trung bình (giờ)
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) =>
              new Date(v).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
            }
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v + "h"}
            width={40}
          />
          <Tooltip
            formatter={(v) => [Number(v).toFixed(1) + " giờ", "Thời gian XL"]}
            labelFormatter={(l) =>
              new Date(l).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
            }
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#f59e0b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
