"use client";

import type { BannerFormData } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BannerPreviewPanelProps {
  data: Partial<BannerFormData>;
}

// ─── Aspect ratio per position ────────────────────────────────────────────────

function getAspectClass(position?: string): string {
  switch (position) {
    case "homepage_hero":
    case "homepage_hero_slider":
      return "aspect-[32/10]";
    case "homepage_small":
      return "aspect-[16/9]";
    case "side_banner":
      return "aspect-[1/3]";
    case "promotions_banner":
      return "aspect-[16/7]";
    default:
      return "aspect-[16/7]";
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BannerPreviewPanel({ data }: BannerPreviewPanelProps) {
  const {
    imageUrl, overlayText, overlaySubtext,
    ctaLabel, badge, badgeColor, badgeTextColor, position,
  } = data;

  const aspectClass = getAspectClass(position);
  const showCta = position !== "homepage_small" && position !== "side_banner";
  const showBadge = position === "promotions_banner";
  const hasOverlay = Boolean(overlayText || overlaySubtext || (showCta && ctaLabel));

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-500">Xem trước</p>

      <div className={`relative w-full ${aspectClass} overflow-hidden rounded-xl bg-secondary-100 border border-secondary-200`}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={overlayText ?? "Banner preview"} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5">
            <div className="h-8 w-8 rounded-full bg-secondary-200 flex items-center justify-center">
              <span className="text-secondary-400 text-lg">🖼</span>
            </div>
            <p className="text-xs text-secondary-400">Chưa có ảnh</p>
          </div>
        )}

        {/* Badge (promotions only) */}
        {showBadge && badge && (
          <div
            className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm"
            style={{ backgroundColor: badgeColor ?? "#ef4444", color: badgeTextColor ?? "#ffffff" }}
          >
            {badge}
          </div>
        )}

        {/* Overlay content */}
        {hasOverlay && imageUrl && (
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 py-4">
            {overlayText && (
              <p className="text-white font-bold text-base leading-tight drop-shadow line-clamp-2">
                {overlayText}
              </p>
            )}
            {overlaySubtext && (
              <p className="mt-0.5 text-white/85 text-xs drop-shadow line-clamp-1">
                {overlaySubtext}
              </p>
            )}
            {showCta && ctaLabel && (
              <span className="mt-2 inline-block self-start rounded-lg bg-white px-3 py-1 text-xs font-semibold text-secondary-900 shadow">
                {ctaLabel}
              </span>
            )}
          </div>
        )}

        {/* Slider dots indicator */}
        {position === "homepage_hero_slider" && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {[0,1,2].map((i) => (
              <span key={i} className={`block h-1.5 rounded-full transition-all ${i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Context note */}
      <p className="text-[11px] text-secondary-400 text-center">
        {position === "homepage_hero" && "Hiển thị full-width phía trên trang chủ"}
        {position === "homepage_hero_slider" && "1 trong nhiều slides của hero carousel"}
        {position === "homepage_small" && "1 trong 4 ô nhỏ bên dưới hero (không có CTA)"}
        {position === "side_banner" && "Banner dọc ở cột bên, xuất hiện trên nhiều trang"}
        {position === "promotions_banner" && "Banner trang /promotions — hỗ trợ kéo thả layout"}
        {!position && "Chọn vị trí để xem preview chính xác hơn"}
      </p>
    </div>
  );
}
