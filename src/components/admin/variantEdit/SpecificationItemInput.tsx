"use client";

import { FunnelIcon } from "@heroicons/react/24/outline";
import { SpecificationItemEditor } from "@/src/components/admin/variant/SpecificationItemEditor";
import type { SpecificationItem } from "@/src/types/product.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_TYPE_STYLE: Record<string, { label: string; cls: string }> = {
  text:    { label: "text",   cls: "bg-secondary-100 text-secondary-500" },
  number:  { label: "number", cls: "bg-blue-50 text-blue-600" },
  enum:    { label: "enum",   cls: "bg-violet-50 text-violet-600" },
  boolean: { label: "bool",   cls: "bg-amber-50 text-amber-600" },
};

const WIDGET_LABEL: Record<string, string> = {
  checkbox:       "checkbox",
  range:          "range",
  toggle:         "toggle",
  select:         "select",
  "combo-select": "combo‑select",
};

// ─── SpecificationItemInput ───────────────────────────────────────────────────

interface SpecificationItemInputProps {
  item: SpecificationItem;
  onChange: (item: SpecificationItem) => void;
}

export function SpecificationItemInput({ item, onChange }: SpecificationItemInputProps) {
  const dtStyle = item.kieuDuLieu ? DATA_TYPE_STYLE[item.kieuDuLieu] : null;

  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 py-3 border-b border-secondary-100 last:border-0">
      {/* ── Cột trái: metadata thuộc tính (read-only) ─────────────────── */}
      <div className="pt-1 flex flex-col gap-1">
        {/* Thứ tự + tên + bắt buộc */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          {item.thuTuHienThi != null && (
            <span className="shrink-0 rounded bg-secondary-100 px-1 font-mono text-[10px] text-secondary-400 leading-4">
              #{item.thuTuHienThi}
            </span>
          )}
          <span className="text-xs font-semibold text-secondary-700">{item.typeLabel}</span>
          {item.batBuoc && (
            <span className="text-error-500 text-xs font-semibold leading-none" aria-label="Bắt buộc">*</span>
          )}
        </div>

        {/* Kiểu dữ liệu + đơn vị */}
        {dtStyle && (
          <span className={`self-start rounded px-1 font-mono text-[10px] leading-4 ${dtStyle.cls}`}>
            {dtStyle.label}
            {item.donVi ? ` · ${item.donVi}` : ""}
          </span>
        )}

        {/* Bộ lọc */}
        {item.coTheLoc ? (
          <span className="self-start inline-flex items-center gap-0.5 rounded px-1 py-0 text-[10px] leading-4 bg-success-50 text-success-700 font-medium">
            <FunnelIcon className="w-2.5 h-2.5" aria-hidden="true" />
            {item.widgetLoc ? WIDGET_LABEL[item.widgetLoc] : "filter"}
            {item.thuTuLoc != null && item.thuTuLoc > 0 && (
              <span className="ml-0.5 opacity-70">#{item.thuTuLoc}</span>
            )}
          </span>
        ) : (
          <span className="text-[10px] text-secondary-300">không lọc</span>
        )}

        {/* Mã kỹ thuật */}
        {item.maKyThuat && (
          <code className="self-start rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-500">
            {item.maKyThuat}
          </code>
        )}

        {/* Mô tả */}
        {item.description && (
          <span className="text-[10px] text-secondary-400 leading-relaxed">{item.description}</span>
        )}
      </div>

      {/* ── Cột phải: editor giá trị ──────────────────────────────────── */}
      <SpecificationItemEditor
        value={item.value}
        onChange={(html) => onChange({ ...item, value: html })}
        placeholder={`Nhập giá trị cho ${item.typeLabel}…`}
        kieuDuLieu={item.kieuDuLieu}
        giaTriChuan={item.giaTriChuan}
        onChangeGiaTriChuan={(v) => onChange({ ...item, giaTriChuan: v || undefined })}
        giaTriSo={item.giaTriSo}
        onChangeGiaTriSo={(v) => onChange({ ...item, giaTriSo: v })}
      />
    </div>
  );
}
