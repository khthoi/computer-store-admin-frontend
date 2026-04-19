import "@/src/components/editor/styles/editor.css";
import { FunnelIcon } from "@heroicons/react/24/outline";
import type { SpecificationItem } from "@/src/types/product.types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_TYPE_STYLE: Record<string, { label: string; cls: string }> = {
  text:    { label: "text",   cls: "bg-secondary-100 text-secondary-500" },
  number:  { label: "number", cls: "bg-blue-50 text-blue-600" },
  enum:    { label: "enum",   cls: "bg-violet-50 text-violet-600" },
  boolean: { label: "bool",   cls: "bg-amber-50 text-amber-600" },
};

const WIDGET_LABEL: Record<string, string> = {
  checkbox:      "checkbox",
  range:         "range",
  toggle:        "toggle",
  select:        "select",
  "combo-select": "combo‑select",
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecificationItemRowProps {
  item: SpecificationItem;
  showGiaTriChuan?: boolean;
  showGiaTriSo?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpecificationItemRow({
  item,
  showGiaTriChuan = false,
  showGiaTriSo    = false,
}: SpecificationItemRowProps) {
  const dtStyle = item.kieuDuLieu ? DATA_TYPE_STYLE[item.kieuDuLieu] : null;

  return (
    <tr className="align-top">
      {/* ── Cột 1: metadata thuộc tính ─────────────────────────────────── */}
      <td className="py-2.5 pr-4">
        {/* Thứ tự + tên + bắt buộc */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          {item.thuTuHienThi != null && (
            <span className="shrink-0 rounded bg-secondary-100 px-1 font-mono text-[10px] text-secondary-400 leading-4">
              #{item.thuTuHienThi}
            </span>
          )}
          <span className="text-sm font-medium text-secondary-700">{item.typeLabel}</span>
          {item.batBuoc && (
            <span className="text-error-500 text-xs leading-none font-semibold" aria-label="Bắt buộc">
              *
            </span>
          )}
        </div>

        {/* Kiểu dữ liệu + đơn vị */}
        {dtStyle && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            <span className={`rounded px-1 font-mono text-[10px] leading-4 ${dtStyle.cls}`}>
              {dtStyle.label}
              {item.donVi ? ` · ${item.donVi}` : ""}
            </span>
          </div>
        )}

        {/* Bộ lọc */}
        {item.coTheLoc ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="inline-flex items-center gap-0.5 rounded px-1 py-0 text-[10px] leading-4 bg-success-50 text-success-700 font-medium">
              <FunnelIcon className="w-2.5 h-2.5" aria-hidden="true" />
              {item.widgetLoc ? WIDGET_LABEL[item.widgetLoc] : "filter"}
              {item.thuTuLoc != null && item.thuTuLoc > 0 && (
                <span className="ml-0.5 opacity-70">#{item.thuTuLoc}</span>
              )}
            </span>
          </div>
        ) : (
          <div className="mt-1">
            <span className="text-[10px] text-secondary-300">không lọc</span>
          </div>
        )}

        {/* Mã kỹ thuật */}
        {item.maKyThuat && (
          <code className="mt-1 inline-block rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-500">
            {item.maKyThuat}
          </code>
        )}

        {/* Mô tả */}
        {item.description && (
          <span className="mt-0.5 block text-xs text-secondary-400">{item.description}</span>
        )}
      </td>

      {/* ── Cột 2: giá trị rich-text ───────────────────────────────────── */}
      <td className="py-2.5 pr-4">
        <div
          className="rte-preview text-sm"
          dangerouslySetInnerHTML={{ __html: item.value }}
        />
      </td>

      {/* ── Cột 3: giá trị chuẩn hóa ───────────────────────────────────── */}
      {showGiaTriChuan && (
        <td className="py-2.5 pr-4">
          {item.giaTriChuan ? (
            <code className="block rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[11px] text-secondary-600 break-all">
              {item.giaTriChuan}
            </code>
          ) : (
            <span className="text-[11px] text-secondary-300">—</span>
          )}
        </td>
      )}

      {/* ── Cột 4: giá trị số ───────────────────────────────────────────── */}
      {showGiaTriSo && (
        <td className="py-2.5">
          {item.giaTriSo != null ? (
            <span className="font-mono text-sm text-secondary-700 tabular-nums">
              {item.giaTriSo}
              {item.donVi && (
                <span className="ml-0.5 text-[11px] text-secondary-400">{item.donVi}</span>
              )}
            </span>
          ) : (
            <span className="text-[11px] text-secondary-300">—</span>
          )}
        </td>
      )}
    </tr>
  );
}
