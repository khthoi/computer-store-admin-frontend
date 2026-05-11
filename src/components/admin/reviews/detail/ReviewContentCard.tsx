import Link               from "next/link";
import { StarRating }       from "@/src/components/ui/StarRating";
import { ReviewStatusBadge } from "../moderation/ReviewStatusBadge";
import type { ReviewDetail } from "@/src/types/review.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewContentCard — displays the original customer review (rating, title,
 * body). This is intentionally NOT a chat bubble — it's a dedicated card.
 */
export function ReviewContentCard({ review }: { review: ReviewDetail }) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm p-5 space-y-3 shrink-0">
      {/* Header row: rating + badges */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <StarRating value={review.rating} size="md" showValue />
        <div className="flex items-center gap-2 flex-wrap">
          <ReviewStatusBadge status={review.trangThai} size="sm" />
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-500 border border-secondary-200">
            {review.nguon}
          </span>
        </div>
      </div>

      {/* Title */}
      {review.tieuDe && (
        <h2 className="text-base font-semibold text-secondary-900 leading-snug">
          {review.tieuDe}
        </h2>
      )}

      {/* Body */}
      {review.noiDung && (
        <p className="text-sm text-secondary-700 leading-relaxed whitespace-pre-wrap">
          {review.noiDung}
        </p>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-secondary-100 flex items-center justify-between text-xs text-secondary-400">
        <span>
          Khách hàng:{" "}
          <Link
            href={`/customers/${review.khachHangId}`}
            className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            {review.khachHangTen}
          </Link>
        </span>
        <span>{formatDate(review.createdAt)}</span>
      </div>
    </div>
  );
}
