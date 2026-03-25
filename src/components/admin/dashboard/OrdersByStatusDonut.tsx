"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrdersByStatusDonutProps {
  data: { status: string; count: number }[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#10b981",
  cancelled: "#ef4444",
  returned: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  returned: "Hoàn trả",
};

const DEFAULT_COLOR = "#94a3b8";

// ─── Custom centre label ───────────────────────────────────────────────────────

interface CentreProps {
  cx: number;
  cy: number;
  total: number;
}

function CentreLabel({ cx, cy, total }: CentreProps) {
  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-secondary-400 text-xs"
        style={{ fontSize: "12px", fill: "#94a3b8" }}
      >
        Tổng
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: "24px", fontWeight: 700, fill: "#1e293b" }}
      >
        {total.toLocaleString("vi-VN")}
      </text>
    </g>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersByStatusDonut({ data }: OrdersByStatusDonutProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      {/* Card header */}
      <h2 className="text-sm font-semibold text-secondary-800 mb-4">
        Đơn hàng theo trạng thái
      </h2>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            label={({ cx, cy }) => (
              <CentreLabel cx={cx as number} cy={cy as number} total={total} />
            )}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.status}
                fill={STATUS_COLORS[entry.status] ?? DEFAULT_COLOR}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const count = typeof value === "number" ? value : 0;
              const statusKey = typeof name === "string" ? name : String(name ?? "");

              return [
                count.toLocaleString("vi-VN") + " đơn",
                STATUS_LABELS[statusKey] ?? statusKey,
              ];
            }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {data.map((entry) => (
          <div key={entry.status} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor:
                  STATUS_COLORS[entry.status] ?? DEFAULT_COLOR,
              }}
              aria-hidden="true"
            />
            <span className="text-xs text-secondary-600">
              {STATUS_LABELS[entry.status] ?? entry.status}
            </span>
            <span className="text-xs font-semibold text-secondary-800">
              {entry.count.toLocaleString("vi-VN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
