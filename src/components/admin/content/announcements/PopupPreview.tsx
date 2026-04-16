"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import type { PopupFormData, PopupPosition } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopupPreviewData = Partial<
  Pick<PopupFormData, "position" | "title" | "body" | "imageUrl" | "ctaLabel" | "showCloseButton">
>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const POSITION_LABEL: Record<PopupPosition, string> = {
  center:       "Giữa màn hình",
  top_left:     "Góc trên trái",
  top_right:    "Góc trên phải",
  bottom_left:  "Góc dưới trái",
  bottom_right: "Góc dưới phải",
};

/**
 * Returns Tailwind flex-alignment classes so the popup card floats at the
 * correct corner/centre inside the preview viewport box.
 */
function viewportAlign(pos: PopupPosition): string {
  switch (pos) {
    case "top_left":     return "items-start justify-start";
    case "top_right":    return "items-start justify-end";
    case "bottom_left":  return "items-end   justify-start";
    case "bottom_right": return "items-end   justify-end";
    default:             return "items-center justify-center";
  }
}

// ─── PopupPreview ─────────────────────────────────────────────────────────────

/**
 * PopupPreview — a scaled-down "browser viewport" mockup that shows exactly
 * how the popup will look to end users.
 *
 * - Renders HTML body via dangerouslySetInnerHTML (same as the real popup).
 * - Positions the popup card at the chosen corner / centre.
 * - Shows close button and CTA button when configured.
 *
 * ```tsx
 * <PopupPreview data={form} />
 * ```
 */
export function PopupPreview({ data }: { data: PopupPreviewData }) {
  const pos: PopupPosition = data.position ?? "center";
  const isCenter = pos === "center";
  const hasPadding = !isCenter;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">
        Xem trước popup
      </p>

      {/* ── Viewport mockup ── */}
      <div
        className={[
          "relative flex overflow-hidden rounded-xl border border-secondary-200 bg-secondary-100",
          viewportAlign(pos),
          hasPadding ? "p-3" : "",
        ].filter(Boolean).join(" ")}
        style={{ aspectRatio: "16 / 9", minHeight: "220px" }}
        aria-label="Xem trước popup"
      >
        {/* Simulated page content lines */}
        <div className="pointer-events-none absolute inset-0 space-y-2.5 p-6 opacity-15">
          {[3 / 4, 1, 5 / 6, 2 / 3, 11 / 12, 3 / 5].map((w, i) => (
            <div key={i} className="h-2.5 rounded bg-secondary-500" style={{ width: `${w * 100}%` }} />
          ))}
        </div>

        {/* Semi-transparent overlay (only for centre popup) */}
        {isCenter && (
          <div className="pointer-events-none absolute inset-0 bg-black/35" />
        )}

        {/* ── Popup card ── */}
        <div
          className={[
            "relative z-10 w-full overflow-hidden bg-white shadow-2xl",
            isCenter ? "mx-auto max-w-[52%] rounded-xl" : "max-w-[44%] rounded-lg",
          ].join(" ")}
        >
          {/* Optional image */}
          {data.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.imageUrl}
              alt=""
              className="max-h-20 w-full object-cover"
              draggable={false}
            />
          )}

          {/* Content area */}
          <div className="space-y-2 p-3">
            {data.title && (
              <h3 className="text-[13px] font-bold leading-snug text-secondary-900">
                {data.title}
              </h3>
            )}

            {data.body?.trim() ? (
              <div
                className="rte-preview line-clamp-5 text-[11px] leading-relaxed text-secondary-600"
                dangerouslySetInnerHTML={{ __html: data.body }}
              />
            ) : (
              <p className="text-[11px] italic text-secondary-300">
                Nội dung popup hiển thị ở đây...
              </p>
            )}

            {data.ctaLabel && (
              <button
                type="button"
                tabIndex={-1}
                className="w-full rounded-lg bg-primary-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm"
              >
                {data.ctaLabel}
              </button>
            )}
          </div>

          {/* Close button */}
          {data.showCloseButton !== false && (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm"
            >
              <XMarkIcon className="h-3 w-3" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Position label */}
      <p className="text-center text-[11px] text-secondary-400">
        Vị trí: <span className="font-medium text-secondary-600">{POSITION_LABEL[pos]}</span>
      </p>
    </div>
  );
}
