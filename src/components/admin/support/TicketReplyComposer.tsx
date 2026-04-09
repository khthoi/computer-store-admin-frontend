"use client";

import { useRef, useState, useEffect } from "react";
import {
  ArrowPathIcon,
  LockClosedIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PaperClipIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Button }    from "@/src/components/ui/Button";
import { useToast }  from "@/src/components/ui/Toast";
import type { TicketStatus } from "@/src/types/ticket.types";

// ─── Types ─────────────────────────────────────────────────────────────────────

type TabType = "reply" | "note";

interface AttachmentPreview {
  id:         string;
  file:       File;
  previewUrl?: string;
  name:       string;
  size:       number;
}

interface TicketReplyComposerProps {
  ticketStatus: TicketStatus;
  onSend: (
    text:        string,
    type:        "Reply" | "InternalNote",
    nextStatus?: TicketStatus,
    files?:      File[]
  ) => Promise<void>;
  isSending?: boolean;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024)              return `${bytes}B`;
  if (bytes < 1024 * 1024)       return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_COUNT = 5;
const IMAGE_MIME     = /^image\//;

// ─── Component ─────────────────────────────────────────────────────────────────

/**
 * TicketReplyComposer — two-tab composer (Reply / Ghi chú nội bộ) with
 * quick status-change actions and file attachment support.
 */
export function TicketReplyComposer({
  ticketStatus,
  onSend,
  isSending = false,
}: TicketReplyComposerProps) {
  const { showToast } = useToast();
  const [tab,         setTab]         = useState<TabType>("reply");
  const [text,        setText]        = useState("");
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke all object URLs on unmount
  useEffect(() => {
    return () => {
      attachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isOpen  = ticketStatus !== "Dong";
  const canSend = (text.trim().length > 0 || attachments.length > 0) && !isSending;

  // ── File handling ────────────────────────────────────────────────────────────

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Reset input so the same file can be re-selected
    e.target.value = "";

    const totalAfter = attachments.length + files.length;
    if (totalAfter > MAX_FILE_COUNT) {
      showToast(`Tối đa ${MAX_FILE_COUNT} file mỗi lần gửi.`, "error");
      return;
    }

    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      showToast(`File vượt quá 10MB: ${oversized.map((f) => f.name).join(", ")}`, "error");
      return;
    }

    const previews: AttachmentPreview[] = files.map((file) => ({
      id:         `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: IMAGE_MIME.test(file.type) ? URL.createObjectURL(file) : undefined,
      name:       file.name,
      size:       file.size,
    }));

    setAttachments((prev) => [...prev, ...previews]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  }

  // ── Send ─────────────────────────────────────────────────────────────────────

  async function handleSend(nextStatus?: TicketStatus) {
    if (!canSend) return;
    const files = attachments.map((a) => a.file);
    await onSend(text.trim(), tab === "reply" ? "Reply" : "InternalNote", nextStatus, files);

    // Clear after success
    setText("");
    attachments.forEach((a) => { if (a.previewUrl) URL.revokeObjectURL(a.previewUrl); });
    setAttachments([]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  return (
    <div className="border border-secondary-200 rounded-2xl bg-white overflow-hidden">
      {/* ── Tabs ── */}
      <div className="flex border-b border-secondary-100">
        <TabButton
          active={tab === "reply"}
          onClick={() => setTab("reply")}
          label="Trả lời"
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

      {/* ── Attachment preview strip ── */}
      {attachments.length > 0 && (
        <div className={["flex flex-wrap gap-2 px-4 pt-3", tab === "note" ? "bg-amber-50/40" : ""].join(" ")}>
          {attachments.map((att) =>
            att.previewUrl ? (
              /* Image thumbnail */
              <div key={att.id} className="relative group w-16 h-16 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.previewUrl}
                  alt={att.name}
                  className="w-16 h-16 rounded-lg object-cover border border-secondary-200"
                />
                <button
                  type="button"
                  aria-label={`Xóa ${att.name}`}
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-700 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ) : (
              /* Non-image chip */
              <div
                key={att.id}
                className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-secondary-100 text-secondary-700 text-xs max-w-[180px]"
              >
                <PaperClipIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{att.name}</span>
                <span className="text-secondary-400 shrink-0">{formatFileSize(att.size)}</span>
                <button
                  type="button"
                  aria-label={`Xóa ${att.name}`}
                  onClick={() => removeAttachment(att.id)}
                  className="shrink-0 rounded p-0.5 hover:bg-secondary-200 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            )
          )}
        </div>
      )}

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
        />
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-secondary-100">
        <div className="flex items-center gap-2">
          {/* Attach file */}
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.zip,.txt"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              title={`Đính kèm file (tối đa ${MAX_FILE_COUNT} file, 10MB/file)`}
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || attachments.length >= MAX_FILE_COUNT}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PaperClipIcon className="w-4 h-4" aria-hidden="true" />
            </button>
          </>

          {/* Status shortcuts — only on Reply tab */}
          {tab === "reply" && isOpen && (
            <>
              <div className="w-px h-4 bg-secondary-200" />
              <button
                type="button"
                disabled={!canSend}
                onClick={() => handleSend("DaGiaiQuyet")}
                className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircleIcon className="w-4 h-4" aria-hidden="true" />
                Gửi &amp; giải quyết
              </button>
              <span className="text-secondary-200">|</span>
              <button
                type="button"
                disabled={!canSend}
                onClick={() => handleSend("Dong")}
                className="inline-flex items-center gap-1 text-xs text-secondary-500 hover:text-secondary-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <XCircleIcon className="w-4 h-4" aria-hidden="true" />
                Gửi &amp; đóng
              </button>
            </>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!canSend}
          onClick={() => handleSend()}
          leftIcon={
            isSending ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : undefined
          }
        >
          {isSending ? "Đang gửi..." : tab === "reply" ? "Gửi trả lời" : "Lưu ghi chú"}
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
  active:   boolean;
  onClick:  () => void;
  label:    string;
  icon:     React.ReactNode;
  accent?:  "amber";
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
