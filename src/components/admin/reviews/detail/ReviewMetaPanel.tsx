"use client";

import Link from "next/link";
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { Button }            from "@/src/components/ui/Button";
import { Tooltip }           from "@/src/components/ui/Tooltip";
import { ReviewStatusBadge } from "./ReviewStatusBadge";
import { StarRating }        from "@/src/components/ui/StarRating";
import type { ReviewSummary, ModerateReviewPayload } from "@/src/types/review.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewMetaPanelProps {
  review:     ReviewSummary;
  onModerate: (review: ReviewSummary, action: ModerateReviewPayload["action"]) => void;
  className?: string;
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

function Divider() {
  return <div className="border-t border-secondary-100 my-3" />;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-secondary-400 shrink-0">{label}</span>
      <span className="text-xs text-secondary-600 text-right">{children}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewMetaPanel — sidebar panel for review detail page.
 * Shows moderation actions, product info, customer info, order info,
 * metadata, and moderation history.
 */
export function ReviewMetaPanel({ review, onModerate, className = "" }: ReviewMetaPanelProps) {
  const { trangThai } = review;

  return (
    <div
      className={[
        "bg-white rounded-2xl border border-secondary-100 shadow-sm p-4",
        "max-h-[calc(100vh-160px)] overflow-y-auto",
        className,
      ].join(" ")}
    >
      <p className="text-sm font-semibold text-secondary-800 border-b border-secondary-100 pb-3 mb-3">
        Thông tin đánh giá
      </p>

      {/* ── Trạng thái ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-secondary-500">Trạng thái</span>
          <ReviewStatusBadge status={trangThai} size="sm" />
        </div>

        {/* ── Moderation actions ── */}
        <div className="flex flex-col gap-2">
          {trangThai === "Pending" && (
            <>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center"
                leftIcon={<CheckCircleIcon className="w-4 h-4" aria-hidden="true" />}
                onClick={() => onModerate(review, "approve")}
              >
                Duyệt đánh giá
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="w-full justify-center"
                leftIcon={<XCircleIcon className="w-4 h-4" aria-hidden="true" />}
                onClick={() => onModerate(review, "reject")}
              >
                Từ chối
              </Button>
            </>
          )}

          {trangThai === "Approved" && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              leftIcon={<EyeSlashIcon className="w-4 h-4" aria-hidden="true" />}
              onClick={() => onModerate(review, "hide")}
            >
              Ẩn đánh giá
            </Button>
          )}

          {trangThai === "Hidden" && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full justify-center"
              leftIcon={<EyeIcon className="w-4 h-4" aria-hidden="true" />}
              onClick={() => onModerate(review, "unhide")}
            >
              Hiện lại
            </Button>
          )}

          {trangThai === "Rejected" && (
            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center"
              leftIcon={<CheckCircleIcon className="w-4 h-4" aria-hidden="true" />}
              onClick={() => onModerate(review, "approve")}
            >
              Duyệt lại
            </Button>
          )}
        </div>
      </div>

      <Divider />

      {/* ── Sản phẩm ── */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-secondary-600">Sản phẩm</p>
        <div className="flex items-start gap-2">
          {review.anhPhienBan && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={review.anhPhienBan}
              alt={review.tenPhienBan}
              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-secondary-100"
            />
          )}
          <div className="min-w-0">
            <Tooltip
              content={`${review.tenSanPham} — ${review.tenPhienBan}`}
              placement="top"
              anchorToContent
            >
              <Link
                href={`/products/${review.sanPhamId ?? review.phienBanId}`}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline block truncate"
              >
                {review.tenSanPham}
              </Link>
            </Tooltip>
            <p className="text-xs text-secondary-500 truncate mt-0.5">{review.tenPhienBan}</p>
            {review.skuPhienBan && (
              <p className="text-xs text-secondary-400 font-mono truncate">{review.skuPhienBan}</p>
            )}
          </div>
        </div>
      </div>

      <Divider />

      {/* ── Khách hàng ── */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-secondary-600">Khách hàng</p>
        <Link
          href={`/customers/${review.khachHangId}`}
          className="text-sm text-secondary-800 hover:text-primary-700 font-medium"
        >
          {review.khachHangTen}
        </Link>
      </div>

      <Divider />

      {/* ── Đơn hàng ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
          <span className="text-xs font-medium text-green-700">Mua hàng đã xác nhận</span>
        </div>
        <Tooltip content={`Xem đơn hàng ${review.maDonHang}`} placement="top">
          <Link
            href={`/orders/${review.maDonHang}`}
            className="font-mono text-xs text-primary-600 hover:text-primary-700 hover:underline"
          >
            {review.maDonHang}
          </Link>
        </Tooltip>
      </div>

      <Divider />

      {/* ── Metadata ── */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-secondary-600">Thông tin</p>
        <MetaRow label="Rating">
          <StarRating value={review.rating} size="sm" showValue />
        </MetaRow>
        <MetaRow label="Nguồn">
          <span className="px-1.5 py-0.5 rounded bg-secondary-100 text-secondary-600">
            {review.nguon}
          </span>
        </MetaRow>
        <MetaRow label="Lượt hữu ích">
          {review.helpfulCount}
        </MetaRow>
        <MetaRow label="Ngày tạo">
          <span className="flex items-center gap-1">
            <CalendarDaysIcon className="w-3 h-3" />
            {formatDate(review.createdAt)}
          </span>
        </MetaRow>
        <MetaRow label="Cập nhật">
          {formatDate(review.updatedAt)}
        </MetaRow>
      </div>

      {/* ── Lịch sử kiểm duyệt ── */}
      {trangThai !== "Pending" && (
        <>
          <Divider />
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-secondary-600">Lịch sử kiểm duyệt</p>
            {review.nguoiDuyetTen && (
              <MetaRow label="Duyệt bởi">
                {review.nguoiDuyetMa ? (
                  <Link
                    href={`/employees/${review.nguoiDuyetMa}`}
                    className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                  >
                    {review.nguoiDuyetTen}
                  </Link>
                ) : (
                  <span className="font-medium">{review.nguoiDuyetTen}</span>
                )}
              </MetaRow>
            )}
            {review.duyetTai && (
              <MetaRow label="Thời điểm">
                {formatDate(review.duyetTai)}
              </MetaRow>
            )}
            {trangThai === "Rejected" && review.lyDoTuChoi && (
              <div className="mt-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2">
                <p className="text-xs text-amber-700 font-medium mb-0.5">Lý do từ chối:</p>
                <p className="text-xs text-amber-800">{review.lyDoTuChoi}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
