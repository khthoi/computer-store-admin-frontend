"use client";

import {
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantBulkBarProps {
  count: number;
  onSetActive: () => void;
  onSetInactive: () => void;
  onDeleteClick: () => void;
  onClear: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const bulkBtnBase =
  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2";

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantBulkBar({
  count,
  onSetActive,
  onSetInactive,
  onDeleteClick,
  onClear,
}: VariantBulkBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Thao tác hàng loạt biến thể"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5"
    >
      <span className="text-sm font-medium text-primary-700">
        {count}&nbsp;biến thể đã chọn
      </span>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onSetActive}
          className={`${bulkBtnBase} border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50 focus-visible:ring-primary-500`}
        >
          <CheckCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Kích hoạt
        </button>
        <button
          type="button"
          onClick={onSetInactive}
          className={`${bulkBtnBase} border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50 focus-visible:ring-primary-500`}
        >
          <XCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Lưu trữ
        </button>
        <button
          type="button"
          onClick={onDeleteClick}
          className={`${bulkBtnBase} border-error-300 bg-white text-error-600 hover:bg-error-50 focus-visible:ring-error-500`}
        >
          <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Xoá
        </button>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-xs text-secondary-500 hover:text-secondary-800 focus-visible:outline-none"
      >
        Bỏ chọn
      </button>
    </div>
  );
}
