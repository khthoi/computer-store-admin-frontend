"use client";

import {
  FolderIcon,
  TagIcon,
  BuildingStorefrontIcon,
  HandRaisedIcon,
  SparklesIcon,
  FireIcon,
} from "@heroicons/react/24/outline";
import type { HomepageSectionType } from "@/src/types/homepage.types";

// ─── Type config ──────────────────────────────────────────────────────────────

interface TypeOption {
  value: HomepageSectionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;        // Tailwind bg class for icon bg (active)
  iconColor: string;    // Tailwind text class for icon (active)
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: "category",
    label: "Danh mục",
    description: "Lọc SP theo danh mục",
    icon: FolderIcon,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    value: "promotion",
    label: "Khuyến mãi",
    description: "SP thuộc chương trình KM",
    icon: TagIcon,
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    value: "brand",
    label: "Thương hiệu",
    description: "Lọc SP theo hãng sản xuất",
    icon: BuildingStorefrontIcon,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    value: "manual",
    label: "Thủ công",
    description: "Chọn tay từng sản phẩm",
    icon: HandRaisedIcon,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    value: "new_arrivals",
    label: "Hàng mới",
    description: "Tự động: mới nhập gần đây",
    icon: SparklesIcon,
    color: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    value: "best_selling",
    label: "Bán chạy",
    description: "Tự động: doanh số cao nhất",
    icon: FireIcon,
    color: "bg-rose-50",
    iconColor: "text-rose-600",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export interface SectionTypePickerProps {
  value: HomepageSectionType;
  onChange: (type: HomepageSectionType) => void;
  label?: string;
}

export function SectionTypePicker({
  value,
  onChange,
  label = "Loại nguồn sản phẩm",
}: SectionTypePickerProps) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-medium text-secondary-700">{label}</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {TYPE_OPTIONS.map((opt) => {
          const active = value === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={[
                "flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all",
                active
                  ? "border-primary-400 bg-primary-50"
                  : "border-secondary-200 hover:border-secondary-300 hover:bg-secondary-50",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active ? opt.color : "bg-secondary-100",
                ].join(" ")}
              >
                <Icon
                  className={[
                    "h-5 w-5 transition-colors",
                    active ? opt.iconColor : "text-secondary-400",
                  ].join(" ")}
                />
              </div>
              <div className="min-w-0">
                <p
                  className={[
                    "text-sm font-semibold",
                    active ? "text-primary-700" : "text-secondary-800",
                  ].join(" ")}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-secondary-400">
                  {opt.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Export config for external use (e.g. badge rendering in section list)
export { TYPE_OPTIONS };
export type { TypeOption };
