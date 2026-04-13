import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { ProgressBarVariant } from "@/src/components/ui/ProgressBar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewRatingBarProps {
  distribution: { star: number; count: number }[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function starVariant(star: number): ProgressBarVariant {
  if (star >= 4) return "success";
  if (star === 3) return "warning";
  return "error";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewRatingBar({ distribution }: ReviewRatingBarProps) {
  const sorted = [...distribution].sort((a, b) => b.star - a.star);
  const total  = sorted.reduce((s, d) => s + d.count, 0);

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-secondary-800 mb-4">Phân bổ đánh giá sao</h3>
      <div className="space-y-3">
        {sorted.map((d) => {
          const pct = total > 0 ? Math.round((d.count / total) * 100) : 0;
          return (
            <div key={d.star} className="flex items-center gap-3">
              <span className="text-xs font-medium text-secondary-600 w-8 shrink-0 text-right">
                {d.star}★
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={pct}
                  max={100}
                  variant={starVariant(d.star)}
                  size="sm"
                  animated
                />
              </div>
              <span className="text-xs text-secondary-500 w-16 shrink-0 text-right tabular-nums">
                {d.count} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
