"use client";

import type { SectionLayout } from "@/src/types/homepage.types";

// ─── Layout config ────────────────────────────────────────────────────────────

interface LayoutOption {
  value: SectionLayout;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function CarouselIcon() {
  return (
    <svg viewBox="0 0 80 36" className="w-full h-full" fill="none">
      <rect x="2"  y="6" width="18" height="24" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="24" y="6" width="18" height="24" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="46" y="6" width="18" height="24" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="68" y="10" width="10" height="16" rx="2" fill="currentColor" opacity="0.3" />
      <path d="M75 18 L71 14 M75 18 L71 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Grid3Icon() {
  return (
    <svg viewBox="0 0 80 36" className="w-full h-full" fill="none">
      <rect x="2"  y="4" width="23" height="28" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="29" y="4" width="23" height="28" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="56" y="4" width="22" height="28" rx="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function Grid4Icon() {
  return (
    <svg viewBox="0 0 80 36" className="w-full h-full" fill="none">
      <rect x="2"  y="4" width="17" height="28" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="22" y="4" width="17" height="28" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="42" y="4" width="17" height="28" rx="2" fill="currentColor" opacity="0.8" />
      <rect x="62" y="4" width="16" height="28" rx="2" fill="currentColor" opacity="0.8" />
    </svg>
  );
}

function Grid6Icon() {
  return (
    <svg viewBox="0 0 80 52" className="w-full h-full" fill="none">
      {/* Row 1 */}
      <rect x="2"  y="2"  width="11" height="22" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="16" y="2"  width="11" height="22" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="30" y="2"  width="11" height="22" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="44" y="2"  width="11" height="22" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="58" y="2"  width="11" height="22" rx="1.5" fill="currentColor" opacity="0.8" />
      <rect x="67" y="2"  width="11" height="22" rx="1.5" fill="currentColor" opacity="0.3" />
      {/* Row 2 */}
      <rect x="2"  y="28" width="11" height="22" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="16" y="28" width="11" height="22" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="30" y="28" width="11" height="22" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="44" y="28" width="11" height="22" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="58" y="28" width="11" height="22" rx="1.5" fill="currentColor" opacity="0.5" />
      <rect x="67" y="28" width="11" height="22" rx="1.5" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    value: "carousel",
    label: "Carousel",
    description: "Scroll ngang",
    icon: <CarouselIcon />,
  },
  {
    value: "grid_3",
    label: "Grid 3",
    description: "3 cột cố định",
    icon: <Grid3Icon />,
  },
  {
    value: "grid_4",
    label: "Grid 4",
    description: "4 cột cố định",
    icon: <Grid4Icon />,
  },
  {
    value: "grid_6",
    label: "Grid 6",
    description: "6 cột compact",
    icon: <Grid6Icon />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface LayoutPickerProps {
  value: SectionLayout;
  onChange: (layout: SectionLayout) => void;
  label?: string;
}

export function LayoutPicker({ value, onChange, label = "Layout hiển thị" }: LayoutPickerProps) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-medium text-secondary-700">{label}</p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {LAYOUT_OPTIONS.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                active
                  ? "border-primary-400 bg-primary-50 text-primary-600"
                  : "border-secondary-200 text-secondary-400 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-600",
              ].join(" ")}
            >
              <div className="h-9 w-full">{opt.icon}</div>
              <div className="text-center">
                <p className={`text-xs font-semibold ${active ? "text-primary-700" : "text-secondary-700"}`}>
                  {opt.label}
                </p>
                <p className="text-[10px] text-secondary-400">{opt.description}</p>
              </div>
              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
