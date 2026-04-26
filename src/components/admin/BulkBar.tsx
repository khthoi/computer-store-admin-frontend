"use client";

import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BulkBarAction {
  id: string;
  label: string;
  icon?: ReactNode;
  isDanger?: boolean;
  onClick: () => void;
}

export interface BulkBarProps {
  count: number;
  /** Text shown after the count. Default: "selected" */
  countLabel?: string;
  actions: BulkBarAction[];
  onClear: () => void;
  /** Label for the clear button. Default: "Clear selection" */
  clearLabel?: string;
  ariaLabel?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const btnBase =
  "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2";

// ─── Component ────────────────────────────────────────────────────────────────

export function BulkBar({
  count,
  countLabel = "selected",
  actions,
  onClear,
  clearLabel = "Clear selection",
  ariaLabel = "Bulk actions",
}: BulkBarProps) {
  return (
    <div
      role="toolbar"
      aria-label={ariaLabel}
      className="flex flex-wrap items-center gap-3 border-b border-primary-200 bg-primary-50 px-4 py-2.5"
    >
      <span className="text-sm font-medium text-primary-700">
        {count}&nbsp;{countLabel}
      </span>

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className={[
              btnBase,
              action.isDanger
                ? "border-error-300 bg-white text-error-600 hover:bg-error-50 focus-visible:ring-error-500"
                : "border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50 focus-visible:ring-primary-500",
            ].join(" ")}
          >
            {action.icon && (
              <span className="w-3.5 h-3.5" aria-hidden="true">
                {action.icon}
              </span>
            )}
            {action.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-xs text-secondary-500 hover:text-secondary-800 focus-visible:outline-none"
      >
        {clearLabel}
      </button>
    </div>
  );
}
