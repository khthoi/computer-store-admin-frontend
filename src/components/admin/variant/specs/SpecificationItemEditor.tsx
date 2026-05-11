"use client";

import "@/src/components/editor/styles/editor.css";
import dynamic from "next/dynamic";

// ─── SpecificationItemEditor ──────────────────────────────────────────────────
//
// Editor cho một giá trị thông số kỹ thuật (gia_tri_thong_so).
// Bao gồm:
//   - value        : nội dung rich-text chính (giaTriThongSo)
//   - giaTriChuan  : text chuẩn hóa dùng cho enum filter (gia_tri_chuan)
//   - giaTriSo     : giá trị số dùng cho range filter (gia_tri_so)

const RichTextEditor = dynamic(
  () =>
    import("@/src/components/editor").then((m) => ({ default: m.RichTextEditor })),
  {
    ssr: false,
    loading: () => (
      <div className="h-20 animate-pulse rounded-lg bg-secondary-100" />
    ),
  }
);

interface SpecificationItemEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Text chuẩn hóa — enum value (gia_tri_chuan) */
  giaTriChuan?: string;
  onChangeGiaTriChuan?: (v: string) => void;
  /** Giá trị số cho range filter (gia_tri_so) */
  giaTriSo?: number | null;
  onChangeGiaTriSo?: (v: number | null) => void;
  /** Kiểu dữ liệu — dùng để gợi ý hiển thị trường phù hợp */
  kieuDuLieu?: "text" | "number" | "boolean" | "enum";
}

export function SpecificationItemEditor({
  value,
  onChange,
  placeholder = "Nhập giá trị thông số…",
  giaTriChuan,
  onChangeGiaTriChuan,
  giaTriSo,
  onChangeGiaTriSo,
  kieuDuLieu,
}: SpecificationItemEditorProps) {
  const showGiaTriChuan = !!onChangeGiaTriChuan && (kieuDuLieu === "enum" || kieuDuLieu === "text" || !kieuDuLieu);
  const showGiaTriSo = !!onChangeGiaTriSo && (kieuDuLieu === "number" || !kieuDuLieu);

  return (
    <div className="flex flex-col gap-2">
      {/* Trường giá trị chính — rich text */}
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minHeight={150}
      />

      {/* Trường giá trị chuẩn hóa — chỉ hiện khi có callback */}
      {showGiaTriChuan && (
        <div>
          <label className="mb-1 block text-[11px] font-medium text-secondary-500 uppercase tracking-wide">
            Giá trị chuẩn hóa
            <span className="ml-1 font-normal normal-case text-secondary-400">(enum value cho bộ lọc)</span>
          </label>
          <input
            type="text"
            value={giaTriChuan ?? ""}
            onChange={(e) => onChangeGiaTriChuan?.(e.target.value)}
            placeholder="VD: ddr5, m2_nvme, intel_lga1700…"
            className="w-full rounded-md border border-secondary-200 bg-white px-2.5 py-1.5 font-mono text-xs text-secondary-700 placeholder:text-secondary-300 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-colors"
          />
        </div>
      )}

      {/* Trường giá trị số — chỉ hiện khi có callback */}
      {showGiaTriSo && (
        <div>
          <label className="mb-1 block text-[11px] font-medium text-secondary-500 uppercase tracking-wide">
            Giá trị số
            <span className="ml-1 font-normal normal-case text-secondary-400">(numeric cho range filter)</span>
          </label>
          <input
            type="number"
            step="any"
            value={giaTriSo ?? ""}
            onChange={(e) => {
              const raw = e.target.value;
              onChangeGiaTriSo?.(raw === "" ? null : Number(raw));
            }}
            placeholder="VD: 3200, 125, 16…"
            className="w-full rounded-md border border-secondary-200 bg-white px-2.5 py-1.5 font-mono text-xs text-secondary-700 placeholder:text-secondary-300 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
