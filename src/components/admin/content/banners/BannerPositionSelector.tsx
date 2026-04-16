"use client";

import type { BannerPosition } from "@/src/types/content.types";

// ─── Config ───────────────────────────────────────────────────────────────────

interface PositionOption {
  value: BannerPosition;
  label: string;
  description: string;
  size: string;
  hasCta: boolean;
  group: string;
  /** Mini SVG diagram showing the layout context */
  diagram: React.ReactNode;
}

// Tiny inline layout diagrams (pure SVG, no deps)
const HomepageHeroDiagram = () => (
  <svg viewBox="0 0 80 30" className="w-full h-full" aria-hidden>
    <rect x="0" y="0" width="80" height="18" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="0" y="20" width="19" height="10" rx="1" fill="currentColor" opacity="0.35" />
    <rect x="21" y="20" width="19" height="10" rx="1" fill="currentColor" opacity="0.35" />
    <rect x="42" y="20" width="19" height="10" rx="1" fill="currentColor" opacity="0.35" />
    <rect x="63" y="20" width="17" height="10" rx="1" fill="currentColor" opacity="0.35" />
  </svg>
);

const HomepageSliderDiagram = () => (
  <svg viewBox="0 0 80 30" className="w-full h-full" aria-hidden>
    <rect x="0" y="0" width="80" height="18" rx="1" fill="currentColor" opacity="0.35" />
    <rect x="8" y="4" width="64" height="10" rx="1" fill="currentColor" opacity="0.8" />
    <circle cx="35" cy="25" r="2" fill="currentColor" opacity="0.8" />
    <circle cx="40" cy="25" r="2" fill="currentColor" opacity="0.35" />
    <circle cx="45" cy="25" r="2" fill="currentColor" opacity="0.35" />
    <polygon points="5,9 10,7 10,11" fill="currentColor" opacity="0.6" />
    <polygon points="75,9 70,7 70,11" fill="currentColor" opacity="0.6" />
  </svg>
);

const HomepageSmallDiagram = () => (
  <svg viewBox="0 0 80 30" className="w-full h-full" aria-hidden>
    <rect x="0" y="0" width="80" height="8" rx="1" fill="currentColor" opacity="0.25" />
    <rect x="0" y="10" width="19" height="20" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="21" y="10" width="19" height="20" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="42" y="10" width="19" height="20" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="63" y="10" width="17" height="20" rx="1" fill="currentColor" opacity="0.8" />
  </svg>
);

const SideBannerDiagram = () => (
  <svg viewBox="0 0 80 30" className="w-full h-full" aria-hidden>
    <rect x="0" y="0" width="8" height="30" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="10" y="0" width="60" height="30" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="72" y="0" width="8" height="30" rx="1" fill="currentColor" opacity="0.8" />
  </svg>
);

const PromotionsBannerDiagram = () => (
  <svg viewBox="0 0 80 30" className="w-full h-full" aria-hidden>
    <rect x="0" y="0" width="80" height="8" rx="1" fill="currentColor" opacity="0.5" />
    <rect x="0" y="10" width="38" height="20" rx="1" fill="currentColor" opacity="0.8" />
    <rect x="40" y="10" width="18" height="20" rx="1" fill="currentColor" opacity="0.7" />
    <rect x="60" y="10" width="20" height="20" rx="1" fill="currentColor" opacity="0.6" />
  </svg>
);

const POSITION_OPTIONS: PositionOption[] = [
  {
    value: "homepage_hero",
    label: "Hero trang chủ",
    description: "1 banner toàn chiều rộng phía trên trang chủ. Có overlay text và nút CTA.",
    size: "1920 × 600px",
    hasCta: true,
    group: "Trang chủ",
    diagram: <HomepageHeroDiagram />,
  },
  {
    value: "homepage_hero_slider",
    label: "Hero Slider",
    description: "Nhiều banner tạo thành slideshow. Kích thước bằng hero, có mũi tên và dots điều hướng.",
    size: "1920 × 600px",
    hasCta: true,
    group: "Trang chủ",
    diagram: <HomepageSliderDiagram />,
  },
  {
    value: "homepage_small",
    label: "4 banner nhỏ",
    description: "4 ô banner ngang hàng bên dưới hero. Không có nút CTA — chỉ ảnh + link.",
    size: "480 × 270px",
    hasCta: false,
    group: "Trang chủ",
    diagram: <HomepageSmallDiagram />,
  },
  {
    value: "side_banner",
    label: "Side Banner",
    description: "Banner dọc hiển thị ở cột bên trái/phải, xuất hiện trên hầu hết các trang.",
    size: "200 × 600px",
    hasCta: false,
    group: "Toàn trang",
    diagram: <SideBannerDiagram />,
  },
  {
    value: "promotions_banner",
    label: "Banner trang Khuyến mãi",
    description: "Banner trang /promotions. Hỗ trợ badge tuỳ màu, CTA button, và kéo thả để sắp xếp layout.",
    size: "Linh hoạt (1–4 cột)",
    hasCta: true,
    group: "Trang Khuyến mãi",
    diagram: <PromotionsBannerDiagram />,
  },
];

// Group by context
const GROUPS = ["Trang chủ", "Toàn trang", "Trang Khuyến mãi"];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BannerPositionSelectorProps {
  value: BannerPosition;
  onChange: (position: BannerPosition) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BannerPositionSelector({ value, onChange }: BannerPositionSelectorProps) {
  return (
    <div className="space-y-3">
      {GROUPS.map((group) => {
        const opts = POSITION_OPTIONS.filter((o) => o.group === group);
        return (
          <div key={group}>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-400">{group}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {opts.map((opt) => {
                const active = value === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={[
                      "flex gap-3 rounded-xl border p-3 text-left transition-all",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
                      active
                        ? "border-primary-500 bg-primary-50 ring-1 ring-primary-400"
                        : "border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50",
                    ].join(" ")}
                  >
                    {/* Diagram */}
                    <div className={`w-20 shrink-0 rounded-md p-1.5 ${active ? "bg-primary-100 text-primary-600" : "bg-secondary-100 text-secondary-400"}`}>
                      {opt.diagram}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-semibold ${active ? "text-primary-700" : "text-secondary-800"}`}>
                          {opt.label}
                        </span>
                        {opt.hasCta && (
                          <span className="rounded-full bg-success-100 px-1.5 py-0.5 text-[10px] font-medium text-success-700">CTA</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-secondary-500 leading-snug">{opt.description}</p>
                      <p className="mt-1 text-[10px] font-mono text-secondary-400">{opt.size}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
