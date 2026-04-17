"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/src/components/ui/Alert";
import { Select } from "@/src/components/ui/Select";
import {
  getDanhMucOptions,
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
  DanhMucOption,
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

export interface SourceConfigEditorProps {
  type: HomepageSectionType;
  config: SourceConfig;
  onChange: (config: SourceConfig) => void;
}

export function SourceConfigEditor({ type, config, onChange }: SourceConfigEditorProps) {
  const [danhMucOpts, setDanhMucOpts] = useState<DanhMucOption[]>([]);
  const [thuongHieuOpts, setThuongHieuOpts] = useState<ThuongHieuOption[]>([]);
  const [khuyenMaiOpts, setKhuyenMaiOpts] = useState<KhuyenMaiOption[]>([]);

  useEffect(() => {
    getDanhMucOptions().then(setDanhMucOpts);
    getThuongHieuOptions().then(setThuongHieuOpts);
    getKhuyenMaiOptions().then(setKhuyenMaiOpts);
  }, []);

  // ── category ──────────────────────────────────────────────────────────────
  if (type === "category") {
    const cfg = (config ?? { danhMucIds: [], sortBy: "newest" }) as CategorySourceConfig;

    return (
      <div className="flex flex-col gap-4">
        <Select
          label="Danh mục"
          required
          options={danhMucOpts.map((d) => ({
            value: String(d.value),
            label: d.label,
            description: d.description,
          }))}
          value={(cfg.danhMucIds ?? []).map(String)}
          onChange={(v) => {
            const ids = (Array.isArray(v) ? v : [v]).map(Number).filter(Boolean);
            onChange({ ...cfg, danhMucIds: ids });
          }}
          multiple
          searchable
          placeholder="Chọn một hoặc nhiều danh mục…"
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
        <Select
          label="Giới hạn trong danh mục (tuỳ chọn)"
          options={danhMucOpts.map((d) => ({
            value: String(d.value),
            label: d.label,
            description: d.description,
          }))}
          value={(cfg.danhMucIds ?? []).map(String)}
          onChange={(v) => {
            const ids = (Array.isArray(v) ? v : [v]).map(Number).filter(Boolean);
            onChange({ ...cfg, danhMucIds: ids.length ? ids : undefined });
          }}
          multiple
          searchable
          clearable
          placeholder="Để trống = lấy từ toàn bộ cửa hàng"
          helperText="Chỉ định danh mục nếu muốn giới hạn phạm vi tìm kiếm"
        />
      </div>
    );
  }

  return null;
}
