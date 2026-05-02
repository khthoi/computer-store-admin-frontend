"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportButtonProps {
  onExport: (format: ExportFormat) => void;
  isExporting?: boolean;
  /** Optional label shown above the format list in the dropdown */
  scope?: string;
  className?: string;
}

// ─── Format definitions ───────────────────────────────────────────────────────

const FORMATS: { key: ExportFormat; label: string; icon: React.ReactNode }[] = [
  {
    key: "csv",
    label: "Xuất CSV",
    icon: <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "excel",
    label: "Xuất Excel",
    icon: <TableCellsIcon className="h-4 w-4" aria-hidden="true" />,
  },
  {
    key: "pdf",
    label: "Xuất PDF",
    icon: <DocumentIcon className="h-4 w-4" aria-hidden="true" />,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ExportButton — split button for triggering data exports.
 *
 * Left half: "Xuất" primary trigger (defaults to CSV on click).
 * Right half: chevron opens a dropdown with CSV / Excel / PDF options.
 * While exporting, both halves are disabled and show a spinner.
 */
export function ExportButton({
  onExport,
  isExporting = false,
  scope,
  className = "",
}: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      {/* Button group wrapper */}
      <div
        className={[
          "inline-flex rounded-lg overflow-hidden border",
          isExporting
            ? "border-primary-300 opacity-70 pointer-events-none"
            : "border-primary-600",
        ].join(" ")}
      >
        {/* Left: primary export trigger (CSV by default) */}
        <button
          type="button"
          disabled={isExporting}
          onClick={() => onExport("csv")}
          className={[
            "inline-flex items-center gap-2 bg-primary-600 px-3 py-2 text-sm font-medium text-white",
            "transition-colors hover:bg-primary-700 active:bg-primary-800",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset",
            "disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {isExporting ? (
            <ArrowPathIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />
          )}
          Xuất
        </button>

        {/* Divider */}
        <div className="w-px bg-primary-500" aria-hidden="true" />

        {/* Right: chevron dropdown trigger */}
        <button
          type="button"
          disabled={isExporting}
          aria-label="Chọn định dạng xuất"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className={[
            "flex items-center bg-primary-600 px-2 py-2 text-white",
            "transition-colors hover:bg-primary-700 active:bg-primary-800",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset",
            "disabled:cursor-not-allowed",
          ].join(" ")}
        >
          <ChevronDownIcon
            className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Dropdown panel */}
      {open && !isExporting && (
        <div className="absolute top-full right-0 z-50 mt-1.5 w-48 overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-xl">
          {/* Scope header */}
          {scope && (
            <div className="border-b border-secondary-100 px-3 py-2">
              <p className="text-xs font-medium text-secondary-500">
                Xuất {scope}
              </p>
            </div>
          )}

          {/* Format list */}
          <ul role="menu">
            {FORMATS.map((fmt) => (
              <li key={fmt.key} role="presentation">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onExport(fmt.key);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-secondary-700 transition-colors hover:bg-secondary-50 hover:text-secondary-900 focus:bg-secondary-50 focus:outline-none"
                >
                  <span className="text-secondary-400">{fmt.icon}</span>
                  {fmt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
