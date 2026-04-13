"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { DataTable }             from "@/src/components/admin/DataTable";
import type { ColumnDef }        from "@/src/components/admin/DataTable";
import { Button }                from "@/src/components/ui/Button";
import { StarRating }            from "@/src/components/ui/StarRating";
import { Tooltip }               from "@/src/components/ui/Tooltip";
import { useToast }              from "@/src/components/ui/Toast";
import { ReviewListToolbar, DEFAULT_REVIEW_FILTERS } from "./ReviewListToolbar";
import type { ReviewFilters }    from "@/src/types/review.types";
import { ReviewStatusBadge }     from "./ReviewStatusBadge";
import { ReviewModerationModal } from "./ReviewModerationModal";
import { ReviewBulkModerateModal } from "./ReviewBulkModerateModal";
import {
  getReviews,
  getReviewStats,
  moderateReview,
} from "@/src/services/review.service";
import type {
  ReviewSummary,
  ReviewStats,
  ModerateReviewPayload,
} from "@/src/types/review.types";

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatItem({
  label,
  value,
  valueClass = "",
}: {
  label:       string;
  value:       React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex-1 bg-white rounded-xl border border-secondary-100 shadow-sm px-5 py-4 min-w-[110px]">
      <p className="text-xs text-secondary-500 mb-1">{label}</p>
      <div className={["text-2xl font-bold tracking-tight text-secondary-900", valueClass].join(" ")}>
        {value}
      </div>
    </div>
  );
}

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

// ─── Toast messages ───────────────────────────────────────────────────────────

const MODERATE_TOAST: Record<ModerateReviewPayload["action"], string> = {
  approve: "Đánh giá đã được duyệt",
  reject:  "Đánh giá đã bị từ chối",
  hide:    "Đánh giá đã được ẩn",
  unhide:  "Đánh giá đã được hiện lại",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewsListClient() {
  const { showToast } = useToast();

  // ── Data ───────────────────────────────────────────────────────────────────
  const [reviews,   setReviews]   = useState<ReviewSummary[]>([]);
  const [stats,     setStats]     = useState<ReviewStats | null>(null);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // ── Pagination + filters ───────────────────────────────────────────────────
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters,  setFilters]  = useState<ReviewFilters>(DEFAULT_REVIEW_FILTERS);

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<string[]>([]);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [moderateTarget, setModerateTarget] = useState<ReviewSummary | null>(null);
  const [moderateAction, setModerateAction] = useState<ModerateReviewPayload["action"] | null>(null);
  const [showBulkModal,  setShowBulkModal]  = useState(false);
  const [bulkAction,     setBulkAction]     = useState<"approve" | "reject">("approve");

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [paged, reviewStats] = await Promise.all([
        getReviews({
          page,
          limit:       pageSize,
          search:      filters.search || undefined,
          trangThai:   filters.trangThai || undefined,
          rating:      filters.rating ? Number(filters.rating) : undefined,
          dateFrom:    filters.dateRange.from?.toISOString() || undefined,
          dateTo:      filters.dateRange.to?.toISOString()   || undefined,
          chuaTraLoi:  filters.chuaTraLoi || undefined,
        }),
        getReviewStats(),
      ]);
      setReviews(paged.data);
      setTotal(paged.total);
      setStats(reviewStats);
    } catch {
      showToast("Lỗi tải danh sách đánh giá", "error");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  function handleFilterChange(v: ReviewFilters) {
    setFilters(v);
    setPage(1);
    setSelected([]);
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
  }

  // ── Single moderation ──────────────────────────────────────────────────────

  function openModerate(review: ReviewSummary, action: ModerateReviewPayload["action"]) {
    setModerateTarget(review);
    setModerateAction(action);
  }

  async function handleModerateDone(
    reviewId: number,
    action:   ModerateReviewPayload["action"],
    lyDo?:    string
  ) {
    await moderateReview({ reviewId, action, lyDoTuChoi: lyDo });
    showToast(MODERATE_TOAST[action], "success");
    setModerateTarget(null);
    setModerateAction(null);
    await loadData();
  }

  // ── Bulk moderation ────────────────────────────────────────────────────────

  function openBulk(action: "approve" | "reject") {
    setBulkAction(action);
    setShowBulkModal(true);
  }

  async function handleBulkModerateOne(reviewId: number, lyDo?: string) {
    await moderateReview({ reviewId, action: bulkAction, lyDoTuChoi: lyDo });
  }

  async function handleBulkDone(result: { successIds: number[]; failedIds: number[]; action: string }) {
    setSelected([]);
    await loadData();
    const actionLabel = result.action === "approve" ? "duyệt" : "từ chối";
    if (result.failedIds.length === 0) {
      showToast(`Đã ${actionLabel} ${result.successIds.length} đánh giá`, "success");
    } else {
      showToast(
        `Hoàn tất: ${result.successIds.length} thành công, ${result.failedIds.length} thất bại`,
        "error"
      );
    }
  }

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: ColumnDef<ReviewSummary & Record<string, unknown>>[] = [
    {
      key:    "tenPhienBan",
      header: "Sản phẩm",
      width:  "220px",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          {row.anhPhienBan && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.anhPhienBan as string}
              alt={row.tenPhienBan as string}
              className="w-8 h-8 rounded object-cover shrink-0 border border-secondary-100"
            />
          )}
          <div className="min-w-0">
            <Tooltip content={`${row.tenPhienBan as string} — ${row.tenSanPham as string}`} placement="top" anchorToContent>
              <Link
                href={`/products/${row.phienBanId}`}
                className="text-sm font-medium text-secondary-800 hover:text-primary-700 truncate max-w-[160px] block"
              >
                {row.tenPhienBan as string}
              </Link>
            </Tooltip>
            <p className="text-xs text-secondary-400 truncate max-w-[160px]">
              {row.tenSanPham as string}
            </p>
          </div>
        </div>
      ),
    },
    {
      key:    "khachHangTen",
      header: "Khách hàng",
      width:  "160px",
      render: (_, row) => (
        <div>
          <Tooltip content={row.khachHangTen as string} placement="top">
            <Link
              href={`/customers/${row.khachHangId}`}
              className="text-sm text-secondary-800 hover:text-primary-700"
            >
              {row.khachHangTen as string}
            </Link>
          </Tooltip>
          <p className="text-xs text-secondary-400 font-mono mt-0.5">
            {row.maDonHang as string}
          </p>
        </div>
      ),
    },
    {
      key:    "rating",
      header: "Đánh giá",
      render: (_, row) => (
        <div className="space-y-0.5">
          <StarRating value={row.rating as ReviewSummary["rating"]} size="sm" />
          {row.tieuDe && (
            <Tooltip content={row.tieuDe as string} placement="top" anchorToContent>
              <p className="text-xs font-semibold text-secondary-800 truncate max-w-[240px]">
                {row.tieuDe as string}
              </p>
            </Tooltip>
          )}
          {row.noiDung && (
            <Tooltip content={row.noiDung as string} placement="top" anchorToContent>
              <p className="text-xs text-secondary-500 line-clamp-2 max-w-[240px]">
                {row.noiDung as string}
              </p>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key:    "trangThai",
      header: "Trạng thái",
      width:  "120px",
      align:  "center",
      render: (_, row) => (
        <ReviewStatusBadge status={row.trangThai as ReviewSummary["trangThai"]} size="sm" />
      ),
    },
    {
      key:    "daPhanHoi",
      header: "Phản hồi",
      width:  "80px",
      align:  "center",
      render: (_, row) =>
        row.daPhanHoi ? (
          <ChatBubbleLeftIcon className="w-4 h-4 text-primary-500 mx-auto" aria-hidden="true" />
        ) : (
          <span className="text-secondary-300 text-xs">—</span>
        ),
    },
    {
      key:    "createdAt",
      header: "Ngày tạo",
      width:  "120px",
      align:  "center",
      render: (_, row) => (
        <span className="text-xs text-secondary-500">
          {formatDate(row.createdAt as string)}
        </span>
      ),
    },
    {
      key:    "_actions",
      header: "",
      width:  "120px",
      align:  "center",
      render: (_, row) => (
        <div className="flex items-center gap-1 justify-center">
          {row.trangThai === "Pending" && (
            <button
              type="button"
              onClick={() => openModerate(row as unknown as ReviewSummary, "approve")}
              className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 transition-colors"
            >
              Duyệt
            </button>
          )}
          <Link
            href={`/reviews/${row.reviewId}`}
            className="text-xs px-2 py-1 rounded bg-secondary-50 text-secondary-600 hover:bg-secondary-100 border border-secondary-200 transition-colors"
          >
            Chi tiết
          </Link>
        </div>
      ),
    },
  ];

  // ── Derived values for bulk modal ──────────────────────────────────────────
  const selectedNumbers = selected.map(Number);
  const selectedSummaries = reviews
    .filter((r) => selectedNumbers.includes(r.reviewId))
    .map((r) => ({
      reviewId:     r.reviewId,
      tieuDe:       r.tieuDe,
      khachHangTen: r.khachHangTen,
      rating:       r.rating,
    }));

  return (
    <div className="space-y-6">
      {/* ── Stats ───────────────────────────────────────────────────────────── */}
      {stats && (
        <div className="flex flex-wrap gap-4">
          <StatItem label="Tổng đánh giá" value={stats.tong} />
          <StatItem
            label="Chờ duyệt"
            value={stats.choDuyet}
            valueClass={stats.choDuyet > 0 ? "text-amber-600" : ""}
          />
          <StatItem label="Đã duyệt"    value={stats.daDuyet} />
          <StatItem label="Từ chối"     value={stats.tuChoi}  />
          <StatItem label="Đã ẩn"       value={stats.an}      />
          <StatItem
            label="TB Rating"
            value={
              <span className="flex items-center gap-1.5">
                <StarRating value={Math.round(stats.tbRating) as ReviewSummary["rating"]} size="sm" />
                <span className="text-lg">{stats.tbRating.toFixed(1)}</span>
              </span>
            }
          />
          <StatItem
            label="Chưa trả lời"
            value={stats.chuaTraLoi}
            valueClass={stats.chuaTraLoi > 0 ? "text-amber-600" : ""}
          />
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <ReviewListToolbar value={filters} onChange={handleFilterChange} />

      {/* ── Bulk action bar ───────────────────────────────────────────────── */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-primary-50 border border-primary-100 rounded-xl text-sm">
          <span className="text-primary-700 font-medium">
            Đã chọn {selected.length} đánh giá
          </span>
          <Button variant="primary" size="sm" onClick={() => openBulk("approve")}>
            Duyệt hàng loạt
          </Button>
          <Button variant="danger" size="sm" onClick={() => openBulk("reject")}>
            Từ chối
          </Button>
          <button
            type="button"
            className="ml-auto text-xs text-secondary-400 hover:text-secondary-600"
            onClick={() => setSelected([])}
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <DataTable
        columns={columns}
        data={reviews as (ReviewSummary & Record<string, unknown>)[]}
        keyField="reviewId"
        isLoading={isLoading}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        searchQuery={filters.search}
        onSearchChange={(q) => handleFilterChange({ ...filters, search: q })}
        searchPlaceholder="Tìm tiêu đề, khách hàng, sản phẩm..."
        page={page}
        pageSize={pageSize}
        totalRows={total}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy đánh giá nào"
      />

      {/* ── Single moderation modal ─────────────────────────────────────── */}
      <ReviewModerationModal
        isOpen={moderateAction !== null && moderateTarget !== null}
        onClose={() => { setModerateTarget(null); setModerateAction(null); }}
        action={moderateAction}
        review={moderateTarget}
        onConfirm={handleModerateDone}
      />

      {/* ── Bulk moderate modal ─────────────────────────────────────────── */}
      <ReviewBulkModerateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        action={bulkAction}
        reviewIds={selectedNumbers}
        reviewSummaries={selectedSummaries}
        onModerateOne={handleBulkModerateOne}
        onDone={handleBulkDone}
      />
    </div>
  );
}
