"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type Granularity = "daily" | "weekly";

interface CustomerDataPoint {
  date: string;
  newCustomers: number;
  returningCustomers: number;
}

interface CustomerAcquisitionChartProps {
  data: CustomerDataPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns an ISO week number (1–53) for a given date.
 * Uses the ISO 8601 standard: weeks start on Monday.
 */
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function aggregateWeekly(data: CustomerDataPoint[]): CustomerDataPoint[] {
  const weekMap = new Map<string, CustomerDataPoint>();

  for (const point of data) {
    const d = new Date(point.date);
    const week = getISOWeek(d);
    const year = d.getFullYear();
    const key = `${year}-W${String(week).padStart(2, "0")}`;

    if (weekMap.has(key)) {
      const existing = weekMap.get(key)!;
      weekMap.set(key, {
        date: existing.date, // keep the first date of the week
        newCustomers: existing.newCustomers + point.newCustomers,
        returningCustomers:
          existing.returningCustomers + point.returningCustomers,
      });
    } else {
      weekMap.set(key, { ...point });
    }
  }

  return Array.from(weekMap.values());
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * CustomerAcquisitionChart — area chart showing new vs returning customers.
 * Supports daily / weekly granularity toggle.
 */
export function CustomerAcquisitionChart({
  data,
}: CustomerAcquisitionChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("daily");

  const chartData = useMemo(
    () => (granularity === "weekly" ? aggregateWeekly(data) : data),
    [data, granularity]
  );

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm p-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-secondary-800">
          Khách hàng mới vs Quay lại
        </h3>

        {/* Granularity toggle */}
        <div className="flex items-center rounded-lg border border-secondary-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setGranularity("daily")}
            className={[
              "px-3 py-1.5 text-xs font-medium transition-colors",
              granularity === "daily"
                ? "bg-primary-600 text-white"
                : "bg-white text-secondary-600 hover:bg-secondary-50",
            ].join(" ")}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => setGranularity("weekly")}
            className={[
              "px-3 py-1.5 text-xs font-medium transition-colors",
              granularity === "weekly"
                ? "bg-primary-600 text-white"
                : "bg-white text-secondary-600 hover:bg-secondary-50",
            ].join(" ")}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradReturning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
              })
            }
          />

          <YAxis
            tick={{ fontSize: 11, fill: "#64748b" }}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              fontSize: 12,
            }}
            cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
          />

          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            formatter={(value: string) =>
              value === "newCustomers" ? "Khách mới" : "Quay lại"
            }
          />

          <Area
            type="monotone"
            dataKey="newCustomers"
            name="newCustomers"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#gradNew)"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="returningCustomers"
            name="returningCustomers"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#gradReturning)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
