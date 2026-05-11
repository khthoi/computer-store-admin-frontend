"use client";

import { useRef, type KeyboardEvent } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Select } from "@/src/components/ui/Select";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductGeneralData {
  name: string;
  sku: string;
  brand: string;
  category: string;
  shortDescription: string;
  status: "published" | "draft" | "archived";
  tags: string[];
}

export interface ProductGeneralFormProps {
  value: ProductGeneralData;
  onChange: (v: ProductGeneralData) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BRAND_OPTIONS = [
  { value: "asus", label: "ASUS" },
  { value: "msi", label: "MSI" },
  { value: "gigabyte", label: "Gigabyte" },
  { value: "intel", label: "Intel" },
  { value: "amd", label: "AMD" },
  { value: "nvidia", label: "NVIDIA" },
  { value: "samsung", label: "Samsung" },
  { value: "western-digital", label: "Western Digital" },
  { value: "seagate", label: "Seagate" },
  { value: "corsair", label: "Corsair" },
  { value: "g-skill", label: "G.Skill" },
  { value: "nzxt", label: "NZXT" },
  { value: "be-quiet", label: "be quiet!" },
  { value: "seasonic", label: "Seasonic" },
  { value: "cooler-master", label: "Cooler Master" },
];

const CATEGORY_OPTIONS = [
  { value: "cpu", label: "CPU / Vi xử lý" },
  { value: "gpu", label: "GPU / Card đồ họa" },
  { value: "mainboard", label: "Mainboard" },
  { value: "ram", label: "RAM" },
  { value: "ssd", label: "SSD" },
  { value: "hdd", label: "HDD" },
  { value: "psu", label: "Nguồn máy tính" },
  { value: "case", label: "Vỏ máy tính" },
  { value: "cooling", label: "Tản nhiệt" },
  { value: "monitor", label: "Màn hình" },
  { value: "keyboard", label: "Bàn phím" },
  { value: "mouse", label: "Chuột" },
  { value: "headset", label: "Tai nghe" },
];

const STATUS_OPTIONS = [
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
  { value: "archived", label: "Đã lưu trữ" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductGeneralForm({ value, onChange }: ProductGeneralFormProps) {
  const tagInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof ProductGeneralData>(
    key: K,
    val: ProductGeneralData[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  function handleTagKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const raw = tagInputRef.current?.value.trim();
      if (!raw) return;
      const newTag = raw.toLowerCase();
      if (!value.tags.includes(newTag)) {
        set("tags", [...value.tags, newTag]);
      }
      if (tagInputRef.current) tagInputRef.current.value = "";
    }
  }

  function removeTag(tag: string) {
    set("tags", value.tags.filter((t) => t !== tag));
  }

  return (
    <div className="space-y-5">
      {/* Product name */}
      <Input
        label="Tên sản phẩm"
        required
        value={value.name}
        onChange={(e) => set("name", e.target.value)}
        placeholder="Nhập tên sản phẩm…"
      />

      {/* SKU */}
      <Input
        label="SKU"
        value={value.sku}
        onChange={(e) => set("sku", e.target.value)}
        className="font-mono"
        placeholder="VD: GPU-RTX4090-OC-24G"
      />

      {/* Brand */}
      <Select
        label="Thương hiệu"
        options={BRAND_OPTIONS}
        value={value.brand}
        onChange={(v) => set("brand", v as string)}
        placeholder="Chọn thương hiệu…"
        searchable
      />

      {/* Category */}
      <Select
        label="Danh mục"
        options={CATEGORY_OPTIONS}
        value={value.category}
        onChange={(v) => set("category", v as string)}
        placeholder="Chọn danh mục…"
        searchable
      />

      {/* Short description */}
      <Textarea
        label="Mô tả ngắn"
        rows={3}
        value={value.shortDescription}
        onChange={(e) => set("shortDescription", e.target.value)}
        placeholder="Mô tả ngắn gọn về sản phẩm…"
        maxCount={300}
        showCharCount
      />

      {/* Status */}
      <Select
        label="Trạng thái"
        options={STATUS_OPTIONS}
        value={value.status}
        onChange={(v) =>
          set("status", v as "published" | "draft" | "archived")
        }
      />

      {/* Tags */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary-700">
          Tags
        </label>

        {/* Existing tags */}
        {value.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-medium border border-primary-200"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Xóa tag ${tag}`}
                  onClick={() => removeTag(tag)}
                  className="rounded-full hover:bg-primary-100 p-0.5 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        <input
          ref={tagInputRef}
          type="text"
          placeholder="Nhập tag rồi nhấn Enter…"
          onKeyDown={handleTagKeyDown}
          className="w-full h-10 px-3 text-sm rounded border border-secondary-300 bg-white text-secondary-700
                     placeholder:text-secondary-400 focus:outline-none focus:ring-2
                     focus:border-primary-500 focus:ring-primary-500/15"
        />
        <p className="text-xs text-secondary-400">
          Nhấn Enter để thêm tag mới
        </p>
      </div>
    </div>
  );
}
