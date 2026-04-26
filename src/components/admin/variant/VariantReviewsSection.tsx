"use client";

import { useState, useMemo } from "react";
import { StarIcon } from "@heroicons/react/24/outline";
import { useToast }              from "@/src/components/ui/Toast";
import { Select }                from "@/src/components/ui/Select";
import { ReviewModerationModal } from "@/src/components/admin/reviews/ReviewModerationModal";
import { Pagination }            from "@/src/components/navigation/Pagination";
import { VariantRatingSummary }  from "./VariantRatingSummary";
import { VariantReviewCard }     from "./VariantReviewCard";
import { moderateReview }        from "@/src/services/review.service";
import type { ReviewSummary, ReviewStatus, ModerateReviewPayload } from "@/src/types/review.types";
import type { VariantReviewStats } from "@/src/types/product.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildStats(reviews: ReviewSummary[]): VariantReviewStats {
  const phanBoRating = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  let sumRating = 0;
  let daDuyet = 0, choDuyet = 0, tuChoi = 0, daAn = 0;

  for (const r of reviews) {
    phanBoRating[String(r.rating) as keyof typeof phanBoRating]++;
    sumRating += r.rating;
    if (r.trangThai === "Approved") daDuyet++;
    else if (r.trangThai === "Pending")  choDuyet++;
    else if (r.trangThai === "Rejected") tuChoi++;
    else if (r.trangThai === "Hidden")   daAn++;
  }

  const total = reviews.length;
  return {
    tongDanhGia:  total,
    daDuyet,
    choDuyet,
    tuChoi,
    daAn,
    tbRating:     total > 0 ? Math.round((sumRating / total) * 10) / 10 : 0,
    phanBoRating,
  };
}

// ─── Filter config ────────────────────────────────────────────────────────────

type StatusFilter = ReviewStatus | "all";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all",      label: "Tất cả"    },
  { value: "Pending",  label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt"  },
  { value: "Rejected", label: "Từ chối"   },
  { value: "Hidden",   label: "Đã ẩn"     },
];

const RATING_OPTIONS: { value: "1"|"2"|"3"|"4"|"5"; label: string }[] = [
  { value: "5", label: "★★★★★  5 sao" },
  { value: "4", label: "★★★★☆  4 sao" },
  { value: "3", label: "★★★☆☆  3 sao" },
  { value: "2", label: "★★☆☆☆  2 sao" },
  { value: "1", label: "★☆☆☆☆  1 sao" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantReviewsSectionProps {
  variantId: string;
  reviews:   ReviewSummary[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantReviewsSection({ reviews: initialReviews }: VariantReviewsSectionProps) {
  const { showToast } = useToast();

  // ── List state ────────────────────────────────────────────────────────────
  const [reviews,      setReviews]      = useState<ReviewSummary[]>(initialReviews);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<"" | "1" | "2" | "3" | "4" | "5">("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const PAGE_SIZE = 5;

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalTarget, setModalTarget] = useState<ReviewSummary | null>(null);
  const [modalAction, setModalAction] = useState<ModerateReviewPayload["action"] | null>(null);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => buildStats(reviews), [reviews]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (statusFilter !== "all" && r.trangThai !== statusFilter) return false;
      if (ratingFilter && String(r.rating) !== ratingFilter)       return false;
      return true;
    });
  }, [reviews, statusFilter, ratingFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage    = Math.min(currentPage, totalPages);
  const paginated   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // ── Open modal ────────────────────────────────────────────────────────────
  function openModerate(review: ReviewSummary) {
    setModalTarget(review);
    setModalAction("approve");
  }

  // ── Moderation confirm ────────────────────────────────────────────────────
  async function handleModerateDone(
    reviewId: number,
    action:   ModerateReviewPayload["action"],
    lyDo?:    string
  ) {
    await moderateReview({ reviewId, action, lyDoTuChoi: lyDo });

    const TOAST: Record<ModerateReviewPayload["action"], string> = {
      approve: "Đã duyệt đánh giá",
      reject:  "Đã từ chối đánh giá",
      hide:    "Đã ẩn đánh giá",
      unhide:  "Đã hiện lại đánh giá",
    };
    showToast(TOAST[action], "success");

    // Update local state to reflect new status
    const nextStatus: Record<ModerateReviewPayload["action"], ReviewStatus> = {
      approve: "Approved",
      reject:  "Rejected",
      hide:    "Hidden",
      unhide:  "Approved",
    };
    setReviews((prev) =>
      prev.map((r) =>
        r.reviewId === reviewId ? { ...r, trangThai: nextStatus[action] } : r
      )
    );

    setModalTarget(null);
    setModalAction(null);
  }

  // ── Tab badge counts ──────────────────────────────────────────────────────
  const tabCounts: Record<StatusFilter, number> = {
    all:      reviews.length,
    Pending:  stats.choDuyet,
    Approved: stats.daDuyet,
    Rejected: stats.tuChoi,
    Hidden:   stats.daAn,
  };

  return (
    <section className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <StarIcon className="w-5 h-5 text-amber-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-secondary-900">
          Đánh giá khách hàng
        </h2>
        <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary-100 px-1.5 text-xs font-semibold text-secondary-600">
          {reviews.length}
        </span>
      </div>

      {/* ── Rating summary ── */}
      {reviews.length > 0 && <VariantRatingSummary stats={stats} />}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-secondary-200 bg-secondary-50 p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => { setStatusFilter(tab.value); setCurrentPage(1); }}
              className={[
                "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                statusFilter === tab.value
                  ? "bg-white text-secondary-900 shadow-sm"
                  : "text-secondary-500 hover:text-secondary-700",
              ].join(" ")}
            >
              {tab.label}
              {tabCounts[tab.value] > 0 && (
                <span className={[
                  "inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] tabular-nums",
                  statusFilter === tab.value
                    ? "bg-secondary-100 text-secondary-700"
                    : "bg-secondary-200 text-secondary-500",
                ].join(" ")}>
                  {tabCounts[tab.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Rating Select (UI component) */}
        <div className="w-45 shrink-0">
          <Select
            placeholder="Tất cả sao"
            options={RATING_OPTIONS}
            value={ratingFilter}
            onChange={(v) => { setRatingFilter((v ?? "") as typeof ratingFilter); setCurrentPage(1); }}
            clearable
            size="sm"
          />
        </div>
      </div>

      {/* ── Review list ── */}
      {filtered.length > 0 ? (
        <>
          <div className="space-y-3">
            {paginated.map((review) => (
              <VariantReviewCard
                key={review.reviewId}
                review={review}
                onOpenModerate={openModerate}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-secondary-400">
                {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đánh giá
              </p>
              <Pagination
                size="sm"
                page={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary-200 py-12 text-center">
          <StarIcon className="mb-2 h-8 w-8 text-secondary-300" aria-hidden="true" />
          <p className="text-sm font-medium text-secondary-500">Không có đánh giá nào</p>
          <p className="mt-0.5 text-xs text-secondary-400">
            {statusFilter !== "all" || ratingFilter
              ? "Thử bỏ bộ lọc để xem tất cả đánh giá"
              : "Chưa có đánh giá nào cho phiên bản sản phẩm này"}
          </p>
        </div>
      )}

      {/* ── Moderation modal ── */}
      <ReviewModerationModal
        isOpen={modalTarget !== null}
        onClose={() => { setModalTarget(null); setModalAction(null); }}
        action={modalAction}
        review={modalTarget}
        onConfirm={handleModerateDone}
      />
    </section>
  );
}
