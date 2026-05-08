"use client";

import { useRef, useState } from "react";
import {
  ArrowPathIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = "reply" | "note";

interface ReviewReplyComposerProps {
  reviewId:  number;
  onSend:    (text: string, type: "Reply" | "InternalNote") => Promise<void>;
  isSending: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewReplyComposer — two-tab composer for review thread replies.
 * Tab 1: "Trả lời khách" (public Reply)
 * Tab 2: "Ghi chú nội bộ" (InternalNote, staff-only)
 */
export function ReviewReplyComposer({
  reviewId: _reviewId,
  onSend,
  isSending,
}: ReviewReplyComposerProps) {
  const [tab,  setTab]  = useState<TabType>("reply");
  const [text, setText] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MIN_LENGTH = 6;
  const trimmed   = text.trim();
  const canSend   = trimmed.length >= MIN_LENGTH && !isSending;

  async function handleSend() {
    if (!canSend) return;
    await onSend(text.trim(), tab === "reply" ? "Reply" : "InternalNote");
    setText("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
    <div className="border border-secondary-200 rounded-2xl bg-white overflow-hidden shrink-0">
      {/* ── Tabs ── */}
      <div className="flex border-b border-secondary-100">
        <TabButton
          active={tab === "reply"}
          onClick={() => setTab("reply")}
          label="Trả lời khách"
          icon={<PaperAirplaneIcon className="w-3.5 h-3.5" />}
        />
        <TabButton
          active={tab === "note"}
          onClick={() => setTab("note")}
          label="Ghi chú nội bộ"
          icon={<LockClosedIcon className="w-3.5 h-3.5" />}
          accent="amber"
        />
      </div>

      {/* ── Textarea ── */}
      <div className={tab === "note" ? "bg-amber-50/40" : ""}>
        <textarea
          ref={textareaRef}
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            tab === "reply"
              ? "Nhập nội dung trả lời khách hàng..."
              : "Ghi chú nội bộ (chỉ nhân viên thấy)..."
          }
          disabled={isSending}
          className="w-full resize-none px-4 py-3 text-sm text-secondary-800 placeholder:text-secondary-400 bg-transparent focus:outline-none disabled:opacity-60"
          style={{ minHeight: "80px", maxHeight: "200px" }}
        />
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-secondary-100">
        <span className={[
          "text-xs tabular-nums",
          trimmed.length > 0 && trimmed.length < MIN_LENGTH
            ? "text-amber-600"
            : "text-secondary-400",
        ].join(" ")}>
          {trimmed.length > 0 && trimmed.length < MIN_LENGTH
            ? `Cần ít nhất ${MIN_LENGTH} ký tự (còn thiếu ${MIN_LENGTH - trimmed.length})`
            : `${text.length} ký tự`}
        </span>

        <Button
          variant="primary"
          size="sm"
          disabled={!canSend}
          onClick={handleSend}
          leftIcon={
            isSending ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : undefined
          }
        >
          {isSending
            ? "Đang gửi..."
            : tab === "reply"
              ? "Gửi trả lời"
              : "Lưu ghi chú"}
        </Button>
      </div>
    </div>
  );
}

// ─── TabButton ─────────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  label,
  icon,
  accent,
}: {
  active:  boolean;
  onClick: () => void;
  label:   string;
  icon:    React.ReactNode;
  accent?: "amber";
}) {
  const activeColor = accent === "amber"
    ? "text-amber-700 border-amber-500 bg-amber-50/60"
    : "text-primary-700 border-primary-500 bg-primary-50/60";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors",
        active
          ? activeColor
          : "text-secondary-500 border-transparent hover:text-secondary-700",
      ].join(" ")}
    >
      {icon}
      {label}
    </button>
  );
}
