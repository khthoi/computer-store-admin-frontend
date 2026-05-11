import Link from "next/link";
import { Cog6ToothIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import type { ReviewMessage } from "@/src/types/review.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Sender name link ─────────────────────────────────────────────────────────

function SenderLink({
  name,
  href,
  className = "",
}: {
  name: string;
  href?: string;
  className?: string;
}) {
  if (!href) {
    return <span className={className}>{name}</span>;
  }
  return (
    <Link href={href} className={["hover:underline", className].filter(Boolean).join(" ")}>
      {name}
    </Link>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, url }: { name: string; url?: string }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={url} alt={name} className="w-8 h-8 rounded-full object-cover shrink-0" />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-secondary-200 shrink-0 flex items-center justify-center text-xs font-semibold text-secondary-600">
      {getInitials(name)}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewMessageBubble — renders a single message in the review thread.
 * Supports: SystemLog pill, InternalNote amber bubble, NhanVien/KhachHang bubbles.
 */
export function ReviewMessageBubble({ message }: { message: ReviewMessage }) {
  const { senderType, messageType } = message;

  // ── System log ──────────────────────────────────────────────────────────────
  if (senderType === "HeThong" || messageType === "SystemLog") {
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
  if (messageType === "InternalNote") {
    return (
      <div className="flex items-start gap-2 flex-row-reverse">
        <Avatar name={message.senderName} url={message.senderAvatar} />
        <div className="flex flex-col gap-1 max-w-[70%] items-end">
          <SenderLink
            name={message.senderName}
            href={message.senderCode ? `/employees/${message.senderCode}` : undefined}
            className="text-xs font-medium text-secondary-500"
          />
          <div className="px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-amber-50 border border-amber-200 text-amber-900">
            <div className="flex items-center gap-1.5 mb-1 text-amber-600 text-xs font-semibold">
              <LockClosedIcon className="w-3 h-3" aria-hidden="true" />
              Ghi chú nội bộ
            </div>
            {message.noiDungTinNhan}
          </div>
          <span className="text-xs text-secondary-400">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  // ── Regular message (NhanVien / KhachHang) ───────────────────────────────────
  const isStaff = senderType === "NhanVien";
  const senderHref = isStaff
    ? (message.senderCode ? `/employees/${message.senderCode}` : undefined)
    : (message.senderId   ? `/customers/${message.senderId}`   : undefined);

  return (
    <div className={["flex items-start gap-2", isStaff ? "flex-row-reverse" : "flex-row"].join(" ")}>
      <Avatar name={message.senderName} url={message.senderAvatar} />
      <div className={["flex flex-col gap-1 max-w-[70%]", isStaff ? "items-end" : "items-start"].join(" ")}>
        <SenderLink
          name={message.senderName}
          href={senderHref}
          className="text-xs font-medium text-secondary-500"
        />
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
        <span className="text-xs text-secondary-400">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
}
