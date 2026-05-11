import { PaperClipIcon, LockClosedIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import type { TicketMessage, TicketAttachment } from "@/src/types/ticket.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TicketMessageBubbleProps {
  message:       TicketMessage;
  onImageClick?: (imageKey: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)$/i;

function isImageFile(fileName: string): boolean {
  return IMAGE_EXTS.test(fileName);
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day:    "2-digit",
    month:  "2-digit",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TicketMessageBubble — renders a single message in the ticket thread.
 *
 * Attachments (images + files) are rendered OUTSIDE the text bubble so they
 * don't inherit the bubble's background/text colour.
 */
export function TicketMessageBubble({
  message,
  onImageClick,
}: TicketMessageBubbleProps) {
  const { senderType, loaiTinNhan } = message;
  const hasText = message.noiDungTinNhan.trim().length > 0;

  // ── System log ──────────────────────────────────────────────────────────────
  if (senderType === "HeThong" || loaiTinNhan === "SystemLog") {
    return (
      <div className="flex justify-center my-1">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-100 text-secondary-500 text-xs">
          <Cog6ToothIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          {message.noiDungTinNhan}
          <span className="text-secondary-400 ml-1">{formatTime(message.createdAt)}</span>
        </span>
      </div>
    );
  }

  // ── Internal note ────────────────────────────────────────────────────────────
  if (loaiTinNhan === "InternalNote") {
    return (
      <div className="flex items-start gap-2 flex-row-reverse">
        <Avatar name={message.senderName} url={message.senderAvatar} />
        <div className="flex flex-col gap-1 max-w-[70%] items-end">
          <p className="text-xs font-medium text-secondary-500">{message.senderName}</p>

          {/* Bubble — text only */}
          {hasText && (
            <div className="px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-amber-50 border border-amber-200 text-amber-900">
              <div className="flex items-center gap-1.5 mb-1 text-amber-600 text-xs font-semibold">
                <LockClosedIcon className="w-3 h-3" aria-hidden="true" />
                Ghi chú nội bộ
              </div>
              {message.noiDungTinNhan}
            </div>
          )}

          {/* Attachments — outside bubble */}
          <MessageAttachments
            attachments={message.attachments}
            onImageClick={onImageClick}
          />

          <span className="text-xs text-secondary-400">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  // ── Regular message (KhachHang / NhanVien) ───────────────────────────────────
  const isStaff = senderType === "NhanVien";

  return (
    <div className={["flex items-start gap-2", isStaff ? "flex-row-reverse" : "flex-row"].join(" ")}>
      <Avatar name={message.senderName} url={message.senderAvatar} />

      <div className={["flex flex-col gap-1 max-w-[70%]", isStaff ? "items-end" : "items-start"].join(" ")}>
        <p className="text-xs font-medium text-secondary-500">{message.senderName}</p>

        {/* Bubble — text only */}
        {hasText && (
          <div
            className={[
              "px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
              isStaff
                ? "bg-primary-600 text-white rounded-2xl rounded-tr-sm"
                : "bg-secondary-100 text-secondary-800 rounded-2xl rounded-tl-sm",
            ].join(" ")}
          >
            {message.noiDungTinNhan}
          </div>
        )}

        {/* Attachments — outside bubble */}
        <MessageAttachments
          attachments={message.attachments}
          onImageClick={onImageClick}
        />

        <span className="text-xs text-secondary-400">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      <img src={url} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-secondary-200 shrink-0 flex items-center justify-center text-xs font-semibold text-secondary-600">
      {getInitials(name)}
    </div>
  );
}

// ─── MessageAttachments ───────────────────────────────────────────────────────
//
// Rendered OUTSIDE the text bubble. Images show as a thumbnail grid;
// other files show as chip links. Both use neutral colours since they sit
// on the thread background, not on a coloured bubble.

function MessageAttachments({
  attachments,
  onImageClick,
}: {
  attachments:   TicketAttachment[];
  onImageClick?: (id: string) => void;
}) {
  if (!attachments || attachments.length === 0) return null;

  const imageAtts  = attachments.filter((a) => isImageFile(a.fileName));
  const fileAtts   = attachments.filter((a) => !isImageFile(a.fileName));
  const visibleImgs = imageAtts.slice(0, 4);
  const overflow   = imageAtts.length - 4;

  return (
    <div className="flex flex-col gap-1.5 w-fit">
      {/* ── Image grid — column count matches image count (max 3) ── */}
      {imageAtts.length > 0 && (
        <div
          className="grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${Math.min(visibleImgs.length, 3)}, 80px)` }}
        >
          {visibleImgs.map((att, idx) => {
            const isOverflowSlot = idx === 3 && overflow > 0;
            return (
              <div key={att.attachmentId} className="relative w-20 h-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.fileUrl}
                  alt={att.fileName}
                  className="w-20 h-20 rounded-xl object-cover cursor-pointer transition-opacity hover:opacity-85 ring-2 ring-transparent hover:ring-primary-400"
                  onClick={() => onImageClick?.(String(att.attachmentId))}
                />
                {isOverflowSlot && (
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55 cursor-pointer text-white font-bold text-sm"
                    onClick={() => onImageClick?.(String(att.attachmentId))}
                  >
                    +{overflow + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Non-image file chips ── */}
      {fileAtts.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {fileAtts.map((att) => (
            <a
              key={att.attachmentId}
              href={att.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary-100 text-secondary-700 text-xs hover:bg-secondary-200 transition-colors"
            >
              <PaperClipIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="max-w-[160px] truncate">{att.fileName}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
