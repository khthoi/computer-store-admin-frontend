"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { InventoryReport } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StockHealthDonutProps {
  buckets: InventoryReport["stockHealthBuckets"];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const VARIANT_COLOR: Record<string, string> = {
  success: "#10b981",
  warning: "#f59e0b",
  error:   "#ef4444",
  default: "#94a3b8",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StockHealthDonut({ buckets }: StockHealthDonutProps) {
  const total = buckets.reduce((s, b) => s + b.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-secondary-800 mb-4">
        Phân bổ sức khỏe tồn kho
      </h3>

      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={buckets}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
          >
            {buckets.map((b, i) => (
              <Cell key={i} fill={VARIANT_COLOR[b.variant] ?? "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const count = typeof value === "number" ? value : 0;
              const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : "0";
              return [`${count} SKU (${pct}%)`, String(name)];
            }}
            contentStyle={{
              borderRadius: "8px",
              border:       "1px solid #e2e8f0",
              fontSize:     "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="space-y-2 mt-1">
        {buckets.map((b, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: VARIANT_COLOR[b.variant] ?? "#94a3b8" }}
                aria-hidden="true"
              />
              <span className="text-secondary-600 truncate">{b.label}</span>
            </div>
            <span className="font-semibold text-secondary-800 tabular-nums shrink-0">
              {b.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
