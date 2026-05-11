import Link from "next/link";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { StarRating }       from "@/src/components/ui/StarRating";
import { Tooltip }          from "@/src/components/ui/Tooltip";
import { Button }           from "@/src/components/ui/Button";
import { ReviewStatusBadge } from "@/src/components/admin/reviews/moderation/ReviewStatusBadge";
import type { ReviewSummary } from "@/src/types/review.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantReviewCardProps {
  review:           ReviewSummary;
  onOpenModerate?:  (review: ReviewSummary) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantReviewCard({ review, onOpenModerate }: VariantReviewCardProps) {
  return (
    <div className="rounded-xl border border-secondary-100 bg-white p-4 shadow-sm space-y-3">
      {/* ── Header: avatar + customer + status + date ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Initials avatar */}
          <div
            className="h-8 w-8 shrink-0 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold"
            aria-hidden="true"
          >
            {initials(review.khachHangTen)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-800 truncate">
              {review.khachHangTen}
            </p>
            <p className="text-xs text-secondary-400 font-mono">
              {review.maDonHang}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ReviewStatusBadge status={review.trangThai} size="sm" />
          <span className="text-xs text-secondary-400 whitespace-nowrap">
            {formatDate(review.createdAt)}
          </span>
        </div>
      </div>

      {/* ── Rating row ── */}
      <div className="flex items-center gap-2">
        <StarRating value={review.rating} size="sm" />
        {review.daPhanHoi && (
          <Tooltip content="Đã có phản hồi từ nhân viên" placement="top">
            <ChatBubbleLeftIcon
              className="w-4 h-4 text-primary-500 cursor-default"
              aria-label="Đã có phản hồi"
            />
          </Tooltip>
        )}
      </div>

      {/* ── Content: title + body ── */}
      {(review.tieuDe || review.noiDung) && (
        <div className="space-y-1">
          {review.tieuDe && (
            <p className="text-sm font-semibold text-secondary-800">
              {review.tieuDe}
            </p>
          )}
          {review.noiDung && (
            <p className="text-sm text-secondary-600 whitespace-pre-line leading-relaxed">
              {review.noiDung}
            </p>
          )}
        </div>
      )}

      {/* ── Rejection reason ── */}
      {review.trangThai === "Rejected" && review.lyDoTuChoi && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          <span className="font-medium">Lý do từ chối:</span> {review.lyDoTuChoi}
        </p>
      )}

      {/* ── Footer: actions ── */}
      <div className="flex items-center gap-2 pt-1 border-t border-secondary-50">
        {review.trangThai === "Pending" && onOpenModerate && (
          <Button
            variant="primary"
            size="xs"
            onClick={() => onOpenModerate(review)}
          >
            Duyệt
          </Button>
        )}
        <Link
          href={`/reviews/${review.reviewId}`}
          className="inline-flex items-center h-7 px-2.5 text-xs rounded-lg border border-secondary-200 bg-secondary-50 text-secondary-600 hover:bg-secondary-100 transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  );
}
