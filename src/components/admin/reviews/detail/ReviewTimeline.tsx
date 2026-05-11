import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { ReviewMessageBubble } from "./ReviewMessageBubble";
import type { ReviewMessage } from "@/src/types/review.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewTimelineProps {
  messages: ReviewMessage[];
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewTimeline — scrollable list of ReviewMessageBubble items.
 */
export function ReviewTimeline({ messages }: ReviewTimelineProps) {
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10 text-secondary-400 border border-secondary-100 rounded-2xl bg-secondary-50/30">
        <ChatBubbleLeftEllipsisIcon className="w-8 h-8" aria-hidden="true" />
        <p className="text-sm">Chưa có phản hồi nào</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto border border-secondary-100 rounded-2xl px-3 py-3 bg-secondary-50/30 space-y-3">
      {messages.map((msg) => (
        <ReviewMessageBubble key={msg.messageId} message={msg} />
      ))}
    </div>
  );
}
