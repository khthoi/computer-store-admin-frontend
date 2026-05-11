"use client";

import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductSEOData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  canonicalUrl?: string;
}

export interface ProductSEOFormProps {
  value: ProductSEOData;
  onChange: (v: ProductSEOData) => void;
  productName?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductSEOForm({ value, onChange, productName }: ProductSEOFormProps) {
  function set<K extends keyof ProductSEOData>(
    key: K,
    val: ProductSEOData[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  function handleAutoSlug() {
    if (!productName) return;
    set("slug", slugify(productName));
  }

  const titleLength = value.metaTitle.length;
  const descLength = value.metaDescription.length;
  const titleOverLimit = titleLength > 60;
  const descOverLimit = descLength > 160;

  const previewTitle = truncate(value.metaTitle || productName || "Tiêu đề trang", 60);
  const previewDesc = truncate(
    value.metaDescription || "Mô tả trang sẽ xuất hiện ở đây…",
    160
  );
  const previewSlug = value.slug
    ? `techstore.vn/san-pham/${value.slug}`
    : "techstore.vn/san-pham/slug-san-pham";

  return (
    <div className="space-y-5">
      {/* Meta Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-secondary-700">
            Meta Title
          </label>
          <span
            className={[
              "text-xs tabular-nums",
              titleOverLimit ? "text-error-600 font-medium" : "text-secondary-400",
            ].join(" ")}
          >
            {titleLength}/60
          </span>
        </div>
        <input
          type="text"
          value={value.metaTitle}
          onChange={(e) => set("metaTitle", e.target.value)}
          placeholder="Tiêu đề xuất hiện trên trang kết quả tìm kiếm…"
          className={[
            "w-full h-10 px-3 text-sm rounded border bg-white text-secondary-700",
            "placeholder:text-secondary-400 transition-colors duration-150",
            "focus:outline-none focus:ring-2",
            titleOverLimit
              ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
              : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/15",
          ].join(" ")}
        />
        {titleOverLimit && (
          <p className="text-xs text-error-600">
            Tiêu đề vượt quá 60 ký tự — Google có thể cắt bớt
          </p>
        )}
      </div>

      {/* Meta Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-secondary-700">
            Meta Description
          </label>
          <span
            className={[
              "text-xs tabular-nums",
              descOverLimit ? "text-error-600 font-medium" : "text-secondary-400",
            ].join(" ")}
          >
            {descLength}/160
          </span>
        </div>
        <textarea
          rows={3}
          value={value.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder="Mô tả xuất hiện dưới tiêu đề trong kết quả tìm kiếm…"
          className={[
            "w-full px-3 py-2.5 text-sm rounded border bg-white text-secondary-700 resize-y",
            "placeholder:text-secondary-400 transition-colors duration-150 min-h-[80px]",
            "focus:outline-none focus:ring-2",
            descOverLimit
              ? "border-error-400 focus:border-error-500 focus:ring-error-500/15"
              : "border-secondary-300 focus:border-primary-500 focus:ring-primary-500/15",
          ].join(" ")}
        />
        {descOverLimit && (
          <p className="text-xs text-error-600">
            Mô tả vượt quá 160 ký tự — Google có thể cắt bớt
          </p>
        )}
      </div>

      {/* URL Slug */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-secondary-700">
          URL Slug
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={value.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="url-san-pham-cua-ban"
            className="flex-1 h-10 px-3 text-sm font-mono rounded border border-secondary-300 bg-white text-secondary-700
                       placeholder:text-secondary-400 focus:outline-none focus:ring-2
                       focus:border-primary-500 focus:ring-primary-500/15"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAutoSlug}
            disabled={!productName}
            title={!productName ? "Cần tên sản phẩm để tự động tạo slug" : undefined}
          >
            Tự động tạo
          </Button>
        </div>
        <p className="text-xs text-secondary-400">
          techstore.vn/san-pham/{value.slug || "…"}
        </p>
      </div>

      {/* Canonical URL */}
      <Input
        label="Canonical URL"
        value={value.canonicalUrl ?? ""}
        onChange={(e) => set("canonicalUrl", e.target.value)}
        placeholder="https://…"
        helperText="Để trống nếu không có URL canonical riêng"
      />

      {/* SERP Preview */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-secondary-700">
          Xem trước kết quả tìm kiếm
        </p>
        <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 space-y-0.5">
          <p className="text-sm text-green-700 truncate">{previewSlug}</p>
          <p
            className="text-base font-medium text-blue-700 truncate hover:underline cursor-pointer"
            title={value.metaTitle}
          >
            {previewTitle}
          </p>
          <p className="text-sm text-secondary-500 line-clamp-2">{previewDesc}</p>
        </div>
      </div>
    </div>
  );
}
