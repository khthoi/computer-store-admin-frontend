"use client";

import { useState }              from "react";
import { ReviewContentCard }     from "./ReviewContentCard";
import { ReviewTimeline }        from "./ReviewTimeline";
import { ReviewReplyComposer }   from "./ReviewReplyComposer";
import { ReviewMetaPanel }       from "./ReviewMetaPanel";
import { ReviewModerationModal } from "./ReviewModerationModal";
import type {
  ReviewDetail,
  ReviewSummary,
  ModerateReviewPayload,
} from "@/src/types/review.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewDetailViewProps {
  review:     ReviewDetail;
  isSending:  boolean;
  onSend:     (text: string, type: "Reply" | "InternalNote") => Promise<void>;
  onModerate: (reviewId: number, action: ModerateReviewPayload["action"], lyDo?: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewDetailView — two-column layout for review detail page.
 * Left: review content card + message timeline + reply composer.
 * Right: sticky meta panel with moderation actions.
 */
export function ReviewDetailView({
  review,
  isSending,
  onSend,
  onModerate,
}: ReviewDetailViewProps) {
  // Local modal state — only used for single-review actions from MetaPanel
  const [moderateAction, setModerateAction] = useState<ModerateReviewPayload["action"] | null>(null);

  function openModerate(
    _: ReviewSummary,
    action: ModerateReviewPayload["action"]
  ) {
    setModerateAction(action);
  }

  async function handleModalConfirm(
    reviewId: number,
    action: ModerateReviewPayload["action"],
    lyDo?: string
  ) {
    await onModerate(reviewId, action, lyDo);
    setModerateAction(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 h-full">
        {/* ── Left: review + conversation ──────────────────────────────────── */}
        <div className="flex flex-col gap-4 min-w-0 min-h-0">
          {/* Review content card */}
          <ReviewContentCard review={review} />

          {/* Message thread */}
          <ReviewTimeline messages={review.messages} />

          {/* Reply composer */}
          <ReviewReplyComposer
            reviewId={review.reviewId}
            onSend={onSend}
            isSending={isSending}
          />
        </div>

        {/* ── Right: meta panel ────────────────────────────────────────────── */}
        <ReviewMetaPanel
          review={review}
          onModerate={openModerate}
        />
      </div>

      {/* ── Single moderation modal ───────────────────────────────────────── */}
      <ReviewModerationModal
        isOpen={moderateAction !== null}
        onClose={() => setModerateAction(null)}
        action={moderateAction}
        review={review}
        onConfirm={handleModalConfirm}
      />
    </>
  );
}

