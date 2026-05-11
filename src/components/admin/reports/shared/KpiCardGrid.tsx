"use client";

import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { KpiCard } from "@/src/types/report.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(value: number, unit: KpiCard["unit"]): string {
  switch (unit) {
    case "vnd":
      return new Intl.NumberFormat("vi-VN", {
        style:    "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);
    case "percent":
      return value.toFixed(1) + "%";
    case "days":
      return value.toFixed(1) + " ngày";
    default:
      return value.toLocaleString("vi-VN");
  }
}

/** Full value shown in tooltip — raw integer with unit label */
function fullValueTooltip(value: number, unit: KpiCard["unit"]): string {
  switch (unit) {
    case "vnd":
      return value.toLocaleString("vi-VN") + " ₫";
    case "percent":
      return value.toFixed(2) + " phần trăm (%)";
    case "days":
      return value.toFixed(2) + " ngày";
    default:
      return value.toLocaleString("vi-VN") + " đơn vị";
  }
}

/** Trend description for the change badge tooltip */
function changeTrendTooltip(change: number, trend: KpiCard["trend"]): string {
  const abs = Math.abs(change).toFixed(1) + "%";
  switch (trend) {
    case "up":
      return `Tăng ${abs} so với kỳ trước`;
    case "down":
      return `Giảm ${abs} so với kỳ trước`;
    default:
      return "Không thay đổi so với kỳ trước";
  }
}

// ─── Single card ─────────────────────────────────────────────────────────────

function KpiCardItem({ card }: { card: KpiCard }) {
  const isUp   = card.trend === "up";
  const isDown = card.trend === "down";

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm flex flex-col gap-2">

      {/* Label — tooltip shows full text when truncated */}
      <Tooltip content={card.label} placement="top" anchorToContent>
        <p className="text-xs font-medium text-secondary-500 truncate">
          {card.label}
        </p>
      </Tooltip>

      <div className="flex items-end justify-between gap-2 mt-auto">

        {/* Value — tooltip shows full raw number */}
        <Tooltip content={fullValueTooltip(card.value, card.unit)} placement="bottom">
          <p className="text-xl font-bold text-secondary-900 leading-tight tabular-nums truncate">
            {formatValue(card.value, card.unit)}
          </p>
        </Tooltip>

        {/* Change badge — tooltip shows trend vs previous period */}
        <Tooltip content={changeTrendTooltip(card.change, card.trend)} placement="top">
          <div
            className={[
              "inline-flex items-center gap-0.5 text-xs font-semibold shrink-0 mb-0.5 cursor-default",
              isUp   ? "text-success-600" : isDown ? "text-error-600" : "text-secondary-400",
            ].join(" ")}
          >
            {isUp   && <ArrowUpIcon   className="w-3.5 h-3.5" aria-hidden="true" />}
            {isDown && <ArrowDownIcon className="w-3.5 h-3.5" aria-hidden="true" />}
            {!isUp && !isDown && <MinusIcon className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>{Math.abs(card.change).toFixed(1)}%</span>
          </div>
        </Tooltip>

      </div>
    </div>
  );
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

interface KpiCardGridProps {
  cards: KpiCard[];
}

export function KpiCardGrid({ cards }: KpiCardGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <KpiCardItem key={card.label} card={card} />
      ))}
    </div>
  );
}
