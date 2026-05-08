"use client";

import { useState, useEffect, useCallback } from "react";
import { ReviewDetailView } from "./ReviewDetailView";
import { useToast }         from "@/src/components/ui/Toast";
import {
  getReviewDetail,
  moderateReview,
  addReviewMessage,
} from "@/src/services/review.service";
import type { ReviewDetail, ModerateReviewPayload } from "@/src/types/review.types";

// ─── Toast messages ───────────────────────────────────────────────────────────

const MODERATE_SUCCESS_MSG: Record<ModerateReviewPayload["action"], string> = {
  approve: "Đánh giá đã được duyệt",
  reject:  "Đánh giá đã bị từ chối",
  hide:    "Đánh giá đã được ẩn",
  unhide:  "Đánh giá đã được hiện lại",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-36 rounded-2xl bg-secondary-100" />
        <div className="h-64 rounded-2xl bg-secondary-100" />
        <div className="h-24 rounded-2xl bg-secondary-100" />
      </div>
      <div className="h-80 rounded-2xl bg-secondary-100" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewDetailClient — data fetching wrapper for the review detail page.
 * Provides silent refresh (no skeleton flash) after moderation or reply.
 */
export function ReviewDetailClient({ reviewId }: { reviewId: number }) {
  const { showToast } = useToast();

  const [review,    setReview]    = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const loadReview = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getReviewDetail(reviewId);
      setReview(data);
    } catch {
      showToast("Không thể tải chi tiết đánh giá", "error");
    } finally {
      setIsLoading(false);
    }
  }, [reviewId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function silentRefresh() {
    try {
      const data = await getReviewDetail(reviewId);
      setReview(data);
    } catch {
      // silent — don't show error for background refresh
    }
  }

  useEffect(() => { loadReview(); }, [loadReview]);

  async function handleSend(text: string, type: "Reply" | "InternalNote") {
    setIsSending(true);
    try {
      await addReviewMessage({ reviewId, noiDung: text, messageType: type });
      await silentRefresh();
      showToast(
        type === "InternalNote" ? "Đã thêm ghi chú nội bộ" : "Phản hồi đã được gửi",
        "success"
      );
    } catch {
      showToast("Không thể gửi phản hồi", "error");
    } finally {
      setIsSending(false);
    }
  }

  async function handleModerate(
    rId:    number,
    action: ModerateReviewPayload["action"],
    lyDo?:  string
  ) {
    await moderateReview({ reviewId: rId, action, lyDoTuChoi: lyDo });
    await silentRefresh();
    showToast(MODERATE_SUCCESS_MSG[action], "success");
  }

  if (isLoading || !review) {
    return <Skeleton />;
  }

  return (
    <ReviewDetailView
      review={review}
      isSending={isSending}
      onSend={handleSend}
      onModerate={handleModerate}
    />
  );
}
