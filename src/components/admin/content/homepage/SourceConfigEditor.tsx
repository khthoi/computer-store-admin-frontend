"use client";

import { useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Alert } from "@/src/components/ui/Alert";
import { Select } from "@/src/components/ui/Select";
import { CategoryTreeSelect, buildNodeMap } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import { getAdminCategoryNodeTree } from "@/src/services/category.service";
import {
  getThuongHieuOptions,
  getKhuyenMaiOptions,
} from "@/src/services/homepage.service";
import type {
  HomepageSectionType,
  SourceConfig,
  CategorySourceConfig,
  PromotionSourceConfig,
  BrandSourceConfig,
  AutoSourceConfig,
  SectionSortBy,
  ThuongHieuOption,
  KhuyenMaiOption,
} from "@/src/types/homepage.types";

// ─── Sort options ─────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "newest",        label: "Mới nhất",         description: "Ngày nhập gần nhất" },
  { value: "best_selling",  label: "Bán chạy nhất",    description: "Doanh số tích lũy" },
  { value: "highest_rated", label: "Đánh giá cao nhất",description: "Điểm TB cao nhất" },
  { value: "price_asc",     label: "Giá tăng dần",     description: "Thấp → Cao" },
  { value: "price_desc",    label: "Giá giảm dần",     description: "Cao → Thấp" },
];

// ─── Component ────────────────────────────────────────────────────────────────

function CategoryTreeMultiSelect({
  value,
  onChange,
  categories,
  label,
  placeholder,
  helperText,
}: {
  value: number[];
  onChange: (ids: number[]) => void;
  categories: CategoryNode[];
  label: string;
  placeholder: string;
  helperText?: string;
}) {
  const [pickerKey, setPickerKey] = useState(0);
  const nodeMap = useMemo(() => buildNodeMap(categories), [categories]);
  const selectedIds = value.map(String);

  function add(id: string) {
    const nextId = Number(id);
    if (!nextId || value.includes(nextId)) return;
    onChange([...value, nextId]);
    setPickerKey((current) => current + 1);
  }

  function remove(id: number) {
    onChange(value.filter((item) => item !== id));
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => {
            const node = nodeMap.get(id);
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full border border-primary-200 bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700"
              >
                {node?.label ?? id}
                <button
                  type="button"
                  onClick={() => remove(Number(id))}
                  className="flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-primary-200"
                  aria-label={`Xóa danh mục ${node?.label ?? id}`}
                >
                  <XMarkIcon className="size-2.5" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <CategoryTreeSelect
        key={pickerKey}
        label={label}
        categories={categories}
        value={undefined}
        onChange={(id) => add(id)}
        placeholder={placeholder}
        helperText={helperText}
      />
    </div>
  );
}

export interface SourceConfigEditorProps {
  type: HomepageSectionType;
  config: SourceConfig;
  onChange: (config: SourceConfig) => void;
}

export function SourceConfigEditor({ type, config, onChange }: SourceConfigEditorProps) {
  const [thuongHieuOpts, setThuongHieuOpts] = useState<ThuongHieuOption[]>([]);
  const [khuyenMaiOpts, setKhuyenMaiOpts] = useState<KhuyenMaiOption[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);

  useEffect(() => {
    getThuongHieuOptions().then(setThuongHieuOpts);
    getKhuyenMaiOptions().then(setKhuyenMaiOpts);
    getAdminCategoryNodeTree().then(setCategoryTree).catch(() => setCategoryTree([]));
  }, []);

  // ── category ──────────────────────────────────────────────────────────────
  if (type === "category") {
    const cfg = (config ?? { danhMucIds: [], sortBy: "newest" }) as CategorySourceConfig;

    return (
      <div className="flex flex-col gap-4">
        <CategoryTreeMultiSelect
          label="Danh mục"
          value={cfg.danhMucIds ?? []}
          onChange={(ids) => onChange({ ...cfg, danhMucIds: ids })}
          categories={categoryTree}
          placeholder="Thêm danh mục theo cây…"
          helperText="Sản phẩm sẽ lấy từ tất cả danh mục được chọn"
        />
        <Select
          label="Sắp xếp theo"
          options={SORT_OPTIONS}
          value={cfg.sortBy ?? "newest"}
          onChange={(v) =>
            onChange({ ...cfg, sortBy: (Array.isArray(v) ? v[0] : v) as SectionSortBy })
          }
        />
      </div>
    );
  }

  // ── promotion ─────────────────────────────────────────────────────────────
  if (type === "promotion") {
    const cfg = (config ?? { khuyenMaiId: undefined }) as PromotionSourceConfig;

    return (
      <div className="flex flex-col gap-4">
        <Alert variant="info">
          Sản phẩm hiển thị sẽ là các mặt hàng được áp dụng trong chương trình khuyến mãi đã chọn.
        </Alert>
        <Select
          label="Chương trình khuyến mãi"
          required
          options={khuyenMaiOpts.map((k) => ({
            value: String(k.value),
            label: k.label,
            description: k.description,
          }))}
          value={cfg.khuyenMaiId !== undefined ? String(cfg.khuyenMaiId) : undefined}
          onChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            onChange({ ...cfg, khuyenMaiId: val ? Number(val) : 0 });
          }}
          searchable
          placeholder="Chọn chương trình khuyến mãi…"
        />
      </div>
    );
  }

  // ── brand ─────────────────────────────────────────────────────────────────
  if (type === "brand") {
    const cfg = (config ?? { thuongHieuIds: [], sortBy: "newest" }) as BrandSourceConfig;

    return (
      <div className="flex flex-col gap-4">
        <Select
          label="Thương hiệu"
          required
          options={thuongHieuOpts.map((t) => ({
            value: String(t.value),
            label: t.label,
            description: t.description,
          }))}
          value={(cfg.thuongHieuIds ?? []).map(String)}
          onChange={(v) => {
            const ids = (Array.isArray(v) ? v : [v]).map(Number).filter(Boolean);
            onChange({ ...cfg, thuongHieuIds: ids });
          }}
          multiple
          searchable
          placeholder="Chọn một hoặc nhiều thương hiệu…"
        />
        <Select
          label="Sắp xếp theo"
          options={SORT_OPTIONS}
          value={cfg.sortBy ?? "newest"}
          onChange={(v) =>
            onChange({ ...cfg, sortBy: (Array.isArray(v) ? v[0] : v) as SectionSortBy })
          }
        />
      </div>
    );
  }

  // ── manual ────────────────────────────────────────────────────────────────
  if (type === "manual") {
    return (
      <Alert variant="info">
        Ở chế độ thủ công, bạn tự chọn từng sản phẩm hiển thị và kéo thả để sắp xếp thứ tự.
        Nhấn <strong>+ Thêm sản phẩm</strong> bên dưới để bắt đầu.
      </Alert>
    );
  }

  // ── new_arrivals / best_selling ───────────────────────────────────────────
  if (type === "new_arrivals" || type === "best_selling") {
    const cfg = (config ?? { danhMucIds: [] }) as AutoSourceConfig;
    const label =
      type === "new_arrivals"
        ? "Hệ thống tự động lấy các sản phẩm mới nhập kho gần đây."
        : "Hệ thống tự động lấy các sản phẩm có doanh số cao nhất.";

    return (
      <div className="flex flex-col gap-4">
        <Alert variant="info">{label}</Alert>
        <CategoryTreeMultiSelect
          label="Giới hạn trong danh mục (tuỳ chọn)"
          value={cfg.danhMucIds ?? []}
          onChange={(ids) => onChange({ ...cfg, danhMucIds: ids.length ? ids : undefined })}
          categories={categoryTree}
          placeholder="Thêm danh mục để giới hạn phạm vi…"
          helperText="Chỉ định danh mục nếu muốn giới hạn phạm vi tìm kiếm"
        />
      </div>
    );
  }

  return null;
}
