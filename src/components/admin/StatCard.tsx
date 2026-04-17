import type { ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/solid";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  title: string;
  /** Formatted value string (e.g. "1.234.567 ₫", "4,821", "98.6%") */
  value: string | number;
  /** Percentage change — positive = growth, negative = decline */
  changePercent?: number;
  /** Context label for the change (e.g. "vs last month") */
  changeLabel?: string;
  /** Icon rendered in the top-right of the card */
  icon?: ReactNode;
  /** Array of historical data points to render as a sparkline */
  sparklineData?: number[];
  /** @default "default" */
  variant?: "default" | "primary" | "success" | "warning" | "error";
  isLoading?: boolean;
  className?: string;
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const VARIANT: Record<
  NonNullable<StatCardProps["variant"]>,
  { icon: string; accent: string }
> = {
  default:  { icon: "bg-secondary-100 text-secondary-600", accent: "bg-secondary-600" },
  primary:  { icon: "bg-primary-100 text-primary-600",     accent: "bg-primary-600" },
  success:  { icon: "bg-success-100 text-success-600",     accent: "bg-success-600" },
  warning:  { icon: "bg-warning-100 text-warning-600",     accent: "bg-warning-500" },
  error:    { icon: "bg-error-100 text-error-600",         accent: "bg-error-600" },
};

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  if (data.length < 2) return null;

  const W = 80;
  const H = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      aria-hidden="true"
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        className={isPositive ? "stroke-success-500" : "stroke-error-400"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={["rounded bg-secondary-200 animate-pulse", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * StatCard — KPI metric card with value, change indicator, icon, and sparkline.
 *
 * ```tsx
 * <StatCard
 *   title="Total Revenue"
 *   value={formatVND(12500000)}
 *   changePercent={12.4}
 *   changeLabel="vs last month"
 *   icon={<CurrencyDollarIcon className="w-5 h-5" />}
 *   sparklineData={[820, 932, 901, 934, 1290, 1330, 1320]}
 *   variant="primary"
 * />
 * ```
 */
export function StatCard({
  title,
  value,
  changePercent,
  changeLabel = "vs last period",
  icon,
  sparklineData,
  variant = "default",
  isLoading = false,
  className = "",
}: StatCardProps) {
  const styles = VARIANT[variant];
  const hasChange = changePercent !== undefined;
  const isPositive = (changePercent ?? 0) >= 0;
  const absChange = Math.abs(changePercent ?? 0).toFixed(1);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label={`Loading ${title}`}
        className={[
          "flex flex-col gap-4 rounded-xl border border-secondary-200 bg-white p-5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="flex items-start justify-between">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-10 w-10 rounded-lg" />
        </div>
        <Shimmer className="h-8 w-36" />
        <Shimmer className="h-4 w-24" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  return (
    <article
      className={[
        "relative flex flex-col gap-3 overflow-hidden rounded-xl border border-secondary-200 bg-white p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 pl-2">
        <p className="text-sm font-medium text-secondary-500">{title}</p>
        {icon && (
          <span
            className={[
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              styles.icon,
            ].join(" ")}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="pl-2">
        <p className="text-2xl font-bold tracking-tight text-secondary-900">
          {value}
        </p>
      </div>

      {/* Change + sparkline row */}
      <div className="flex items-end justify-between gap-2 pl-2">
        {hasChange && (
          <div className="flex flex-col gap-0.5">
            <div
              className={[
                "flex items-center gap-1 text-sm font-semibold",
                isPositive ? "text-success-600" : "text-error-600",
              ].join(" ")}
              aria-label={`${isPositive ? "Increased" : "Decreased"} by ${absChange}%`}
            >
              {isPositive ? (
                <ArrowUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ArrowDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              {absChange}%
            </div>
            <p className="text-xs text-secondary-400">{changeLabel}</p>
          </div>
        )}

        {sparklineData && sparklineData.length >= 2 && (
          <div className="shrink-0 opacity-70">
            <Sparkline data={sparklineData} isPositive={isPositive} />
          </div>
        )}
      </div>
    </article>
  );
}

/*
 * ─── Prop Table ───────────────────────────────────────────────────────────────
 *
 * Name           Type                                        Default       Description
 * ──────────────────────────────────────────────────────────────────────────────
 * title          string                                      required      Metric label
 * value          string | number                             required      Formatted display value
 * changePercent  number                                      —             % change (positive = up)
 * changeLabel    string                                      "vs last …"   Context for change %
 * icon           ReactNode                                   —             Icon in top-right
 * sparklineData  number[]                                    —             Historical data points
 * variant        "default"|"primary"|"success"|"warning"|…  "default"     Accent color
 * isLoading      boolean                                     false         Show skeleton
 * className      string                                      ""            Extra classes on card
 */
