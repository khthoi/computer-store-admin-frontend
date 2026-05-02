"use client";

import { useEffect, useRef, useState } from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "@/src/components/ui/Checkbox";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnConfig {
  key: string;
  label: string;
  /** Whether the column is visible by default. Defaults to true. */
  defaultVisible?: boolean;
}

export interface ColumnConfiguratorProps {
  /** Unique ID used for localStorage persistence */
  tableId: string;
  columns: ColumnConfig[];
  onChange: (visibleKeys: string[]) => void;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStorageKey(tableId: string): string {
  return `admin_columns_${tableId}`;
}

function getDefaultKeys(columns: ColumnConfig[]): string[] {
  return columns
    .filter((c) => c.defaultVisible !== false)
    .map((c) => c.key);
}

function loadSavedKeys(tableId: string, columns: ColumnConfig[]): string[] {
  try {
    const raw = localStorage.getItem(getStorageKey(tableId));
    if (!raw) return getDefaultKeys(columns);
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) {
      // Filter out keys that no longer exist
      const validKeys = new Set(columns.map((c) => c.key));
      return (parsed as string[]).filter((k) => validKeys.has(k));
    }
    return getDefaultKeys(columns);
  } catch {
    return getDefaultKeys(columns);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ColumnConfigurator — icon button that opens a popover for toggling column visibility.
 *
 * Persists selection to localStorage keyed by `tableId`.
 * Resets to defaults on "Reset" click.
 */
export function ColumnConfigurator({
  tableId,
  columns,
  onChange,
  className = "",
}: ColumnConfiguratorProps) {
  const [open, setOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => {
    // Default before hydration — will be overwritten on mount
    return getDefaultKeys(columns);
  });

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Hydrate from localStorage on mount ────────────────────────────────────
  useEffect(() => {
    const saved = loadSavedKeys(tableId, columns);
    setVisibleKeys(saved);
    onChange(saved);
  // Only run once on mount — intentionally omitting onChange from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  // ── Close on outside click ────────────────────────────────────────────────
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

  // ── Toggle a column ───────────────────────────────────────────────────────
  const handleToggle = (key: string, checked: boolean) => {
    const next = checked
      ? [...visibleKeys, key]
      : visibleKeys.filter((k) => k !== key);
    setVisibleKeys(next);
    localStorage.setItem(getStorageKey(tableId), JSON.stringify(next));
    onChange(next);
  };

  // ── Reset to defaults ─────────────────────────────────────────────────────
  const handleReset = () => {
    const defaults = getDefaultKeys(columns);
    setVisibleKeys(defaults);
    localStorage.removeItem(getStorageKey(tableId));
    onChange(defaults);
  };

  const visibleSet = new Set(visibleKeys);

  return (
    <div ref={containerRef} className={`relative inline-flex ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        aria-label="Cấu hình cột hiển thị"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
          open
            ? "border-primary-400 bg-primary-50 text-primary-600"
            : "border-secondary-200 bg-white text-secondary-500 hover:border-secondary-300 hover:bg-secondary-50 hover:text-secondary-700",
        ].join(" ")}
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Popover panel */}
      {open && (
        <div className="absolute top-full right-0 z-50 mt-1.5 w-64 rounded-xl border border-secondary-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-secondary-100 px-4 py-3">
            <p className="text-sm font-semibold text-secondary-800">
              Cột hiển thị
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs text-primary-600 underline-offset-2 hover:underline focus:outline-none focus:underline"
            >
              Reset
            </button>
          </div>

          {/* Column list */}
          <ul className="max-h-72 overflow-y-auto py-2">
            {columns.map((col) => (
              <li key={col.key}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors hover:bg-secondary-50">
                  <Checkbox
                    checked={visibleSet.has(col.key)}
                    onChange={(e) => handleToggle(col.key, e.target.checked)}
                    size="sm"
                  />
                  <span className="text-sm text-secondary-700">{col.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
