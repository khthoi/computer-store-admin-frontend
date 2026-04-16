"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import type { SeoMeta } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeoPanelProps {
  value: SeoMeta;
  onChange: (seo: SeoMeta) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SeoPanel — collapsible SEO metadata editor.
 * Shared by StaticPage form and Article form.
 */
export function SeoPanel({ value, onChange }: SeoPanelProps) {
  const [expanded, setExpanded] = useState(false);

  function set<K extends keyof SeoMeta>(key: K, val: SeoMeta[K]) {
    onChange({ ...value, [key]: val });
  }

  const titleLen = value.title?.length ?? 0;
  const descLen = value.description?.length ?? 0;

  return (
    <div className="rounded-xl border border-secondary-200 bg-white overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-secondary-50 transition-colors"
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-secondary-700">SEO & Metadata</span>
          {!expanded && (
            <span className="text-xs text-secondary-400">
              {value.title ? value.title : "Nhấn để mở rộng và chỉnh sửa SEO"}
            </span>
          )}
        </div>
        {expanded ? (
          <ChevronUpIcon className="h-4 w-4 text-secondary-500" />
        ) : (
          <ChevronDownIcon className="h-4 w-4 text-secondary-500" />
        )}
      </button>

      {/* Fields */}
      {expanded && (
        <div className="border-t border-secondary-100 px-5 py-4 space-y-4">
          {/* Meta title */}
          <div>
            <Input
              label="Meta title"
              value={value.title ?? ""}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Tiêu đề SEO (nên dưới 60 ký tự)"
              maxLength={80}
            />
            <p className={`mt-1 text-right text-xs ${titleLen > 60 ? "text-warning-600" : "text-secondary-400"}`}>
              {titleLen}/60
            </p>
          </div>

          {/* Meta description */}
          <div>
            <Textarea
              label="Meta description"
              value={value.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Mô tả ngắn gọn (nên 120–160 ký tự)"
              rows={3}
            />
            <p className={`mt-1 text-right text-xs ${descLen > 160 ? "text-warning-600" : "text-secondary-400"}`}>
              {descLen}/160
            </p>
          </div>

          {/* Keywords */}
          <Input
            label="Keywords"
            value={value.keywords ?? ""}
            onChange={(e) => set("keywords", e.target.value)}
            placeholder="Từ khóa cách nhau bởi dấu phẩy"
          />

          {/* Canonical URL */}
          <Input
            label="Canonical URL"
            value={value.canonicalUrl ?? ""}
            onChange={(e) => set("canonicalUrl", e.target.value)}
            placeholder="https://pcstore.vn/page"
          />

          {/* OG Image */}
          <Input
            label="OG Image URL"
            value={value.ogImage ?? ""}
            onChange={(e) => set("ogImage", e.target.value)}
            placeholder="URL ảnh chia sẻ mạng xã hội (1200×628px)"
          />

          {/* noIndex */}
          <div className="flex items-center gap-3">
            <Toggle
              checked={value.noIndex ?? false}
              onChange={(e) => set("noIndex", e.target.checked)}
            />
            <div>
              <p className="text-sm text-secondary-700">Ẩn khỏi công cụ tìm kiếm (noindex)</p>
              <p className="text-xs text-secondary-400">Bật khi không muốn Google index trang này</p>
            </div>
          </div>

          {/* SERP preview */}
          {(value.title || value.description) && (
            <div className="rounded-lg bg-secondary-50 border border-secondary-100 p-3">
              <p className="text-xs font-medium text-secondary-500 mb-2 uppercase tracking-wide">Xem trước SERP</p>
              <p className="text-[15px] text-blue-700 font-medium leading-tight truncate">
                {value.title || "Tiêu đề trang"}
              </p>
              <p className="text-[13px] text-green-700 truncate">pcstore.vn{value.canonicalUrl ? ` › ${value.canonicalUrl}` : ""}</p>
              <p className="text-[13px] text-secondary-600 line-clamp-2 mt-0.5">
                {value.description || "Mô tả trang sẽ xuất hiện ở đây..."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
