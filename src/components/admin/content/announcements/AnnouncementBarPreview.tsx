"use client";

import type { AnnouncementBarFormData } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AnnouncementBarPreviewProps {
  data: Partial<AnnouncementBarFormData>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML tags so plain text is safe to render inside the marquee */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AnnouncementBarPreview — live preview of the announcement bar.
 *
 * - Static mode: renders content via dangerouslySetInnerHTML (supports basic HTML)
 * - Marquee mode: strips HTML tags first so raw tag strings don't appear on screen
 */
export function AnnouncementBarPreview({ data }: AnnouncementBarPreviewProps) {
  const { content = "", backgroundColor, textColor, showCloseButton, isScrolling } = data;

  const bg = backgroundColor || "#1d4ed8";
  const fg = textColor || "#ffffff";

  const plainText = stripHtml(content) || "Nội dung thông báo sẽ hiển thị ở đây...";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">Xem trước</p>

      <div
        className="relative flex w-full items-center justify-center overflow-hidden rounded-lg px-6 py-2.5 text-sm font-medium"
        style={{ backgroundColor: bg, color: fg }}
      >
        {isScrolling ? (
          /* Marquee — always plain text to avoid rendering raw HTML tags */
          <div className="w-full overflow-hidden whitespace-nowrap">
            <span
              className="inline-block"
              style={{ animation: "marquee 14s linear infinite" }}
            >
              {plainText}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{plainText}
            </span>
          </div>
        ) : (
          /* Static — renders basic HTML (bold, links) via innerHTML */
          <span
            className="bar-content text-center"
            dangerouslySetInnerHTML={{
              __html: content.trim() || "Nội dung thông báo sẽ hiển thị ở đây...",
            }}
          />
        )}

        {/* Close button */}
        {showCloseButton && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded opacity-70 hover:opacity-100"
            style={{ color: fg }}
            aria-label="Đóng"
            tabIndex={-1}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      <p className="text-center text-[11px] text-secondary-400">
        {data.position === "bottom" ? "Hiển thị ở cuối trang" : "Hiển thị ở đầu trang"}
        {isScrolling && " · Chạy chữ"}
      </p>
    </div>
  );
}
