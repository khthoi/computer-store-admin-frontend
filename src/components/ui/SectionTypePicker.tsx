"use client";

import {
  FolderIcon,
  TagIcon,
  BuildingStorefrontIcon,
  HandRaisedIcon,
  SparklesIcon,
  FireIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { HomepageSectionType } from "@/src/types/homepage.types";

// ─── Type config ──────────────────────────────────────────────────────────────

interface TypeOption {
  value: HomepageSectionType;
  label: string;
  description: string;
  info: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;        // Tailwind bg class for icon bg (active)
  iconColor: string;    // Tailwind text class for icon (active)
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: "category",
    label: "Danh mục",
    description: "Lọc SP theo danh mục",
    info: "Lấy sản phẩm từ một hoặc nhiều danh mục đã chọn, bao gồm cả danh mục con. Sắp xếp theo tiêu chí bạn chỉ định (mới nhất, bán chạy, giá…). Phù hợp để làm nổi bật một ngành hàng cụ thể.",
    icon: FolderIcon,
    color: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    value: "promotion",
    label: "Khuyến mãi",
    description: "SP thuộc chương trình KM",
    info: "Hiển thị các sản phẩm nằm trong phạm vi áp dụng của một chương trình khuyến mãi cụ thể. Yêu cầu chọn đúng chương trình đang hoạt động. Phù hợp cho banner flash sale hoặc ưu đãi có thời hạn.",
    icon: TagIcon,
    color: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    value: "brand",
    label: "Thương hiệu",
    description: "Lọc SP theo hãng sản xuất",
    info: "Lấy sản phẩm của một hoặc nhiều thương hiệu đã chọn, sắp xếp theo tiêu chí bạn chỉ định. Phù hợp để tạo showcase cho từng hãng hoặc làm nổi bật đối tác thương hiệu.",
    icon: BuildingStorefrontIcon,
    color: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    value: "manual",
    label: "Thủ công",
    description: "Chọn tay từng sản phẩm",
    info: "Bạn tự chọn và sắp xếp từng sản phẩm hiển thị bằng cách kéo thả. Không phụ thuộc vào bộ lọc tự động. Phù hợp cho bộ sưu tập đặc biệt, hàng featured hoặc khi cần kiểm soát chính xác danh sách.",
    icon: HandRaisedIcon,
    color: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    value: "new_arrivals",
    label: "Hàng mới",
    description: "Tự động: mới nhập gần đây",
    info: "Hệ thống tự động lấy các sản phẩm được thêm vào gần đây nhất, sắp xếp theo ngày tạo giảm dần. Có thể giới hạn trong một hoặc nhiều danh mục cụ thể; để trống = toàn bộ cửa hàng.",
    icon: SparklesIcon,
    color: "bg-sky-50",
    iconColor: "text-sky-600",
  },
  {
    value: "best_selling",
    label: "Bán chạy",
    description: "Tự động: doanh số cao nhất",
    info: "Hệ thống tự động xếp hạng sản phẩm theo tổng số lượng đã bán, tính từ toàn bộ lịch sử đơn hàng. Có thể giới hạn trong một hoặc nhiều danh mục; để trống = toàn bộ cửa hàng.",
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
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p
                    className={[
                      "text-sm font-semibold",
                      active ? "text-primary-700" : "text-secondary-800",
                    ].join(" ")}
                  >
                    {opt.label}
                  </p>
                  <Tooltip
                    content={opt.info}
                    placement="top"
                    multiline
                    maxWidth="260px"
                    delay={100}
                  >
                    <span
                      role="img"
                      aria-label="Thông tin chi tiết"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 cursor-default text-secondary-400 hover:text-secondary-600"
                    >
                      <InformationCircleIcon className="h-4 w-4" />
                    </span>
                  </Tooltip>
                </div>
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
