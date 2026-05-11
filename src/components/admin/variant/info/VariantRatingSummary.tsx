import { StarRating }  from "@/src/components/ui/StarRating";
import { ProgressBar } from "@/src/components/ui/ProgressBar";
import type { VariantReviewStats } from "@/src/types/product.types";

// ─── Component ────────────────────────────────────────────────────────────────

interface VariantRatingSummaryProps {
  stats: VariantReviewStats;
}

const STAR_LEVELS = ["5", "4", "3", "2", "1"] as const;

export function VariantRatingSummary({ stats }: VariantRatingSummaryProps) {
  const total = Math.max(stats.tongDanhGia, 1); // avoid divide-by-zero

  return (
    <div className="flex items-start gap-8 rounded-xl border border-secondary-100 bg-secondary-50 px-5 py-4">
      {/* ── Left: average score ── */}
      <div className="flex shrink-0 flex-col items-center gap-1.5 min-w-[80px]">
        <span className="text-5xl font-bold leading-none tracking-tight text-secondary-900">
          {stats.tbRating.toFixed(1)}
        </span>
        <StarRating
          value={Math.round(stats.tbRating) as 1 | 2 | 3 | 4 | 5}
          size="sm"
        />
        <span className="text-xs text-secondary-400">
          {stats.tongDanhGia} đánh giá
        </span>
      </div>

      {/* Divider */}
      <div className="w-px self-stretch bg-secondary-200 shrink-0" />

      {/* ── Right: distribution bars ── */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {STAR_LEVELS.map((star) => {
          const count = stats.phanBoRating[star];
          const pct   = Math.round((count / total) * 100);
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="w-5 shrink-0 text-right text-xs text-secondary-500 tabular-nums">
                {star}★
              </span>
              <div className="flex-1">
                <ProgressBar
                  value={pct}
                  max={100}
                  size="xs"
                  variant={star === "5" || star === "4" ? "success" : star === "3" ? "warning" : "error"}
                  animated={false}
                />
              </div>
              <span className="w-6 shrink-0 text-xs text-secondary-400 tabular-nums text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
