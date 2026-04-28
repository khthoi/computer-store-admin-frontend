"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { StarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useToast }              from "@/src/components/ui/Toast";
import { Select }                from "@/src/components/ui/Select";
import { ReviewModerationModal } from "@/src/components/admin/reviews/ReviewModerationModal";
import { Pagination }            from "@/src/components/navigation/Pagination";
import { VariantRatingSummary }  from "./VariantRatingSummary";
import { VariantReviewCard }     from "./VariantReviewCard";
import { getVariantReviews }     from "@/src/services/product.service";
import { moderateReview }        from "@/src/services/review.service";
import type { ReviewSummary, ReviewStatus, ModerateReviewPayload } from "@/src/types/review.types";
import type { VariantReviewStats } from "@/src/types/product.types";

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

const PAGE_SIZE = 6;

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantReviewsSectionProps {
  variantId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantReviewsSection({ variantId }: VariantReviewsSectionProps) {
  const { showToast } = useToast();

  // ── Server data ───────────────────────────────────────────────────────────
  const [reviews,    setReviews]    = useState<ReviewSummary[]>([]);
  const [stats,      setStats]      = useState<VariantReviewStats | null>(null);
  const [total,      setTotal]      = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading,    setLoading]    = useState(true);

  // ── Filter / pagination state ─────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<"" | "1" | "2" | "3" | "4" | "5">("");
  const [currentPage,  setCurrentPage]  = useState(1);

  // ── Modal state ───────────────────────────────────────────────────────────
  const [modalTarget, setModalTarget] = useState<ReviewSummary | null>(null);
  const [modalAction, setModalAction] = useState<ModerateReviewPayload["action"] | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const prevFilterKey = useRef(JSON.stringify({ statusFilter: "all", ratingFilter: "" }));

  const fetchReviews = useCallback(async (page: number, status: StatusFilter, rating: string) => {
    setLoading(true);
    try {
      const result = await getVariantReviews(variantId, {
        page,
        limit: PAGE_SIZE,
        status: status !== "all" ? status : undefined,
        rating: rating ? Number(rating) : undefined,
      });
      setReviews(result.data);
      setStats(result.stats);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch {
      showToast("Không thể tải đánh giá. Vui lòng thử lại.", "error");
    } finally {
      setLoading(false);
    }
  }, [variantId, showToast]);

  // Initial load
  useEffect(() => {
    void fetchReviews(1, "all", "");
  }, [fetchReviews]);

  // Re-fetch when filters or page change
  useEffect(() => {
    const filterKey = JSON.stringify({ statusFilter, ratingFilter });
    const isFilterChange = filterKey !== prevFilterKey.current;
    prevFilterKey.current = filterKey;

    const page = isFilterChange ? 1 : currentPage;
    if (isFilterChange) setCurrentPage(1);

    void fetchReviews(page, statusFilter, ratingFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, ratingFilter, currentPage]);

  // ── Tab badge counts from stats ───────────────────────────────────────────
  const tabCounts: Record<StatusFilter, number> = useMemo(() => ({
    all:      stats?.tongDanhGia ?? 0,
    Pending:  stats?.choDuyet    ?? 0,
    Approved: stats?.daDuyet     ?? 0,
    Rejected: stats?.tuChoi      ?? 0,
    Hidden:   stats?.daAn        ?? 0,
  }), [stats]);

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
    setModalTarget(null);
    setModalAction(null);

    // Refetch current page to reflect updated status
    void fetchReviews(currentPage, statusFilter, ratingFilter);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        <StarIcon className="w-5 h-5 text-amber-400" aria-hidden="true" />
        <h2 className="text-base font-semibold text-secondary-900">
          Đánh giá khách hàng
        </h2>
        {stats && (
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-secondary-100 px-1.5 text-xs font-semibold text-secondary-600">
            {stats.tongDanhGia}
          </span>
        )}
      </div>

      {/* ── Rating summary ── */}
      {stats && stats.tongDanhGia > 0 && <VariantRatingSummary stats={stats} />}

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex items-center gap-1 rounded-lg border border-secondary-200 bg-secondary-50 p-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
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

        {/* Rating Select */}
        <div className="w-45 shrink-0">
          <Select
            placeholder="Tất cả sao"
            options={RATING_OPTIONS}
            value={ratingFilter}
            onChange={(v) => setRatingFilter((v ?? "") as typeof ratingFilter)}
            clearable
            size="sm"
          />
        </div>
      </div>

      {/* ── Review list ── */}
      <div className="relative min-h-[120px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <ArrowPathIcon className="w-5 h-5 animate-spin text-primary-600" aria-hidden="true" />
          </div>
        )}

        {!loading && reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-secondary-200 py-12 text-center">
            <StarIcon className="mb-2 h-8 w-8 text-secondary-300" aria-hidden="true" />
            <p className="text-sm font-medium text-secondary-500">Không có đánh giá nào</p>
            <p className="mt-0.5 text-xs text-secondary-400">
              {statusFilter !== "all" || ratingFilter
                ? "Thử bỏ bộ lọc để xem tất cả đánh giá"
                : "Chưa có đánh giá nào cho phiên bản sản phẩm này"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <VariantReviewCard
                key={review.reviewId}
                review={review}
                onOpenModerate={openModerate}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-secondary-400">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, total)} / {total} đánh giá
          </p>
          <Pagination
            size="sm"
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
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
