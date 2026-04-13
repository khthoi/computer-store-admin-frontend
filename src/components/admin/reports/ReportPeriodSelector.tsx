import type { ReportPeriod } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportPeriodSelectorProps {
  value:    ReportPeriod;
  onChange: (p: ReportPeriod) => void;
}

const PERIODS: ReportPeriod[] = ["7d", "30d", "90d", "1y"];

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportPeriodSelector({ value, onChange }: ReportPeriodSelectorProps) {
  return (
    <div className="flex items-center gap-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={[
            "px-3 py-1.5 rounded text-xs font-medium transition-colors",
            value === p
              ? "bg-violet-100 text-violet-700"
              : "text-secondary-500 hover:bg-secondary-100",
          ].join(" ")}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
