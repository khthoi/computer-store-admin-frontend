"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  EyeSlashIcon,
  XCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Modal }          from "@/src/components/ui/Modal";
import { Button }         from "@/src/components/ui/Button";
import { Tooltip }        from "@/src/components/ui/Tooltip";
import { DropdownAction } from "@/src/components/ui/DropdownAction";
import type { DropdownActionItem } from "@/src/components/ui/DropdownAction";
import { StarRating }     from "@/src/components/ui/StarRating";
import { Textarea } from "../../ui";
import type { ReviewSummary, ModerateReviewPayload } from "@/src/types/review.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewModerationModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  /** Pre-selected action (e.g. "approve" when clicking Duyệt in the table).
   *  The user can still switch via the in-modal DropdownAction. */
  action:    ModerateReviewPayload["action"] | null;
  review:    Pick<
    ReviewSummary,
    | "reviewId" | "phienBanId"
    | "tieuDe"   | "noiDung"
    | "khachHangTen" | "rating"
    | "tenSanPham"   | "tenPhienBan" | "anhPhienBan"
  > | null;
  onConfirm: (reviewId: number, action: ModerateReviewPayload["action"], lyDo?: string) => Promise<void>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ACTION_CONFIG: Record<
  ModerateReviewPayload["action"],
  { title: string; description: string; confirmLabel: string; confirmVariant: "primary" | "danger" | "secondary" | "warning" | "success" }
> = {
  approve: {
    title:          "Duyệt đánh giá",
    description:    "Đánh giá sẽ được hiển thị công khai trên trang sản phẩm.",
    confirmLabel:   "Duyệt",
    confirmVariant: "success",
  },
  reject: {
    title:          "Từ chối đánh giá",
    description:    "Đánh giá sẽ không được hiển thị. Vui lòng nhập lý do từ chối.",
    confirmLabel:   "Từ chối",
    confirmVariant: "danger",
  },
  hide: {
    title:          "Ẩn đánh giá",
    description:    "Đánh giá sẽ bị ẩn khỏi trang sản phẩm nhưng vẫn được lưu trong hệ thống.",
    confirmLabel:   "Ẩn đánh giá",
    confirmVariant: "warning",
  },
  unhide: {
    title:          "Hiện lại đánh giá",
    description:    "Đánh giá sẽ được hiển thị trở lại trên trang sản phẩm.",
    confirmLabel:   "Hiện lại",
    confirmVariant: "success",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewModerationModal({
  isOpen,
  onClose,
  action,
  review,
  onConfirm,
}: ReviewModerationModalProps) {
  const [currentAction, setCurrentAction] = useState<ModerateReviewPayload["action"] | null>(null);
  const [lyDo,          setLyDo]          = useState("");
  const [lyDoError,     setLyDoError]     = useState("");
  const [isLoading,     setIsLoading]     = useState(false);

  // Seed / reset state whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setCurrentAction(action);
    setLyDo("");
    setLyDoError("");
    setIsLoading(false);
  }, [isOpen, action]);

  if (!review) return null;

  const config = currentAction ? ACTION_CONFIG[currentAction] : null;

  // ── DropdownAction items ───────────────────────────────────────────────────
  const actionItems: DropdownActionItem[] = [
    {
      key:         "approve",
      label:       "Duyệt",
      description: "Hiển thị công khai trên trang sản phẩm",
      variant:     "success",
      icon:        <CheckCircleIcon className="w-4 h-4" />,
      onClick:     () => { setCurrentAction("approve"); setLyDo(""); setLyDoError(""); },
    },
    {
      key:         "hide",
      label:       "Ẩn",
      description: "Ẩn khỏi trang sản phẩm, vẫn lưu trong hệ thống",
      variant:     "warning",
      icon:        <EyeSlashIcon className="w-4 h-4" />,
      onClick:     () => { setCurrentAction("hide"); setLyDo(""); setLyDoError(""); },
    },
    {
      key:         "reject",
      label:       "Từ chối",
      description: "Không hiển thị, yêu cầu nhập lý do",
      variant:     "danger",
      icon:        <XCircleIcon className="w-4 h-4" />,
      onClick:     () => { setCurrentAction("reject"); setLyDo(""); setLyDoError(""); },
    },
  ];

  // ── Confirm handler ────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!currentAction) return;
    if (currentAction === "reject" && lyDo.trim().length < 10) {
      setLyDoError("Lý do từ chối phải có ít nhất 10 ký tự.");
      return;
    }
    setIsLoading(true);
    try {
      await onConfirm(
        review!.reviewId,
        currentAction,
        currentAction === "reject" ? lyDo.trim() : undefined
      );
      onClose();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config?.title ?? "Kiểm duyệt đánh giá"}
      size="xl"
      animated
      closeOnBackdrop={!isLoading}
      closeOnEscape={!isLoading}
      hideCloseButton={isLoading}
      footer={
        <div className="flex items-center gap-2 w-full">
          {/* Action selector — left-aligned */}
          <DropdownAction
            items={actionItems}
            label={config ? config.confirmLabel : "Chọn hành động"}
            size="sm"
            placement="top-start"
            disabled={isLoading}
          />

          <div className="flex-1" />

          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Huỷ
          </Button>
          <Button
            variant={config?.confirmVariant ?? "primary"}
            size="sm"
            onClick={handleConfirm}
            disabled={!currentAction || isLoading}
            leftIcon={isLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : undefined}
          >
            {isLoading ? "Đang xử lý..." : (config?.confirmLabel ?? "Xác nhận")}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* ── Review preview card ────────────────────────────────────────── */}
        <div className="rounded-xl bg-secondary-50 border border-secondary-100 px-4 py-3 space-y-3">
          {/* Product info */}
          <div className="flex items-center gap-3">
            {review.anhPhienBan && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={review.anhPhienBan}
                alt={review.tenPhienBan}
                className="w-12 h-12 rounded-lg object-cover border border-secondary-200 shrink-0"
              />
            )}
            <div className="min-w-0">
              <Tooltip content={`${review.tenPhienBan} — ${review.tenSanPham}`} placement="top">
                <Link
                  href={`/products/${review.phienBanId}`}
                  className="text-sm font-semibold text-secondary-800 hover:text-primary-700 truncate block"
                >
                  {review.tenPhienBan}
                </Link>
              </Tooltip>
              <p className="text-xs text-secondary-400 truncate">{review.tenSanPham}</p>
            </div>
          </div>

          {/* Rating + customer */}
          <div className="flex items-center gap-2">
            <StarRating value={review.rating} size="sm" />
            <span className="text-xs text-secondary-500">{review.khachHangTen}</span>
          </div>

          {/* Title + body */}
          {review.tieuDe && (
            <p className="text-sm font-semibold text-secondary-800">{review.tieuDe}</p>
          )}
          {review.noiDung && (
            <p className="text-sm text-secondary-600 whitespace-pre-line leading-relaxed">
              {review.noiDung}
            </p>
          )}
        </div>

        {/* ── Selected action description ────────────────────────────────── */}
        {config && (
          <p className="text-sm text-secondary-500">{config.description}</p>
        )}

        {/* ── Reject reason — only when "Từ chối" is selected ───────────── */}
        {currentAction === "reject" && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-secondary-700">
              Lý do từ chối <span className="text-red-500">*</span>
            </label>
            <Textarea
              rows={3}
              value={lyDo}
              onChange={(e) => { setLyDo(e.target.value); setLyDoError(""); }}
              showCharCount
              maxCharCount={300}
              placeholder="Nhập lý do từ chối (tối thiểu 10 ký tự)..."
              className={[
                "w-full resize-none rounded-xl px-3 py-2.5 text-sm text-secondary-800",
                "border focus:outline-none focus:ring-2 focus:ring-primary-500/20",
                lyDoError
                  ? "border-red-400 focus:border-red-400"
                  : "border-secondary-200 focus:border-primary-400",
              ].join(" ")}
            />
            {lyDoError && (
              <p className="text-xs text-red-500">{lyDoError}</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
