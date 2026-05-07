"use client";

import type { AnnouncementBarFormData } from "@/src/types/content.types";

export interface AnnouncementBarPreviewProps {
  data: Partial<AnnouncementBarFormData>;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

export function AnnouncementBarPreview({ data }: AnnouncementBarPreviewProps) {
  const { content = "", backgroundColor, textColor, showCloseButton, isScrolling } = data;

  const bg = backgroundColor || "#1d4ed8";
  const fg = textColor || "#ffffff";
  const plainText = stripHtml(content) || "Nội dung thông báo sẽ hiển thị ở đây...";

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">Xem trước</p>

      <div
        className="relative flex w-full items-center overflow-hidden rounded-lg py-2.5 text-sm font-medium"
        style={{
          backgroundColor: bg,
          color: fg,
          paddingLeft: isScrolling ? 0 : "1.5rem",
          paddingRight: isScrolling ? 0 : "1.5rem",
        }}
      >
        {isScrolling ? (
          /* Marquee — 6 copies in a 200%-wide container; each copy is exactly 1/3 of
             the visible area so precisely 3 copies are on-screen at all times, evenly
             spaced. The keyframe moves -50% (= 100% of visible area = 3 copy-widths)
             for a seamless right-to-left loop. */
          <div className="w-full overflow-hidden">
            <div
              style={{
                display: "flex",
                width: "200%",
                animation: "marquee 16s linear infinite",
                willChange: "transform",
              }}
            >
              {Array.from({ length: 6 }, (_, i) => (
                <span
                  key={i}
                  className="flex items-center justify-center whitespace-nowrap text-center"
                  style={{ flex: "0 0 16.6667%" }}
                  aria-hidden={i >= 3 ? "true" : undefined}
                >
                  {plainText}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Static — renders basic HTML (bold, links) */
          <span
            className="bar-content text-center"
            dangerouslySetInnerHTML={{
              __html: content.trim() || "Nội dung thông báo sẽ hiển thị ở đây...",
            }}
          />
        )}

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
