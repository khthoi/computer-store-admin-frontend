"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { DateInput } from "@/src/components/ui/DateInput";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface AdminDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

type Preset = "today" | "7days" | "30days" | "thisMonth" | "custom";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toInputValue(d: Date | null): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromInputValue(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AdminDateRangePicker — compact date range selector with presets.
 *
 * Supports quick presets (Today, 7 days, 30 days, This month) and a custom
 * two-field date picker. Closes on outside click.
 */
export function AdminDateRangePicker({
  value,
  onChange,
  className = "",
}: AdminDateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);

  // Custom date inputs
  const [customFrom, setCustomFrom] = useState(toInputValue(value.from));
  const [customTo, setCustomTo] = useState(toInputValue(value.to));
  const [customError, setCustomError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  // Skip close when the user clicks inside a DateInput calendar portal
  // (portals are appended to document.body and are therefore outside containerRef,
  // but they belong to a DateInput that lives inside this component).
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Ignore clicks that land inside any DateInput portal dropdown
      if (target.closest("[data-dateinput-portal]")) return;
      if (!containerRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Sync custom inputs when value changes externally
  useEffect(() => {
    setCustomFrom(toInputValue(value.from));
    setCustomTo(toInputValue(value.to));
  }, [value.from, value.to]);

  // ── Preset calculation ─────────────────────────────────────────────────────

  function applyPreset(preset: Preset) {
    const today = startOfDay(new Date());
    let from: Date | null = null;
    let to: Date | null = null;

    switch (preset) {
      case "today":
        from = today;
        to = today;
        break;
      case "7days":
        from = addDays(today, -6);
        to = today;
        break;
      case "30days":
        from = addDays(today, -29);
        to = today;
        break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = today;
        break;
      case "custom":
        setActivePreset("custom");
        return; // don't close — show inputs
    }

    setActivePreset(preset);
    onChange({ from, to });
    setOpen(false);
  }

  // ── Custom date apply ──────────────────────────────────────────────────────

  function applyCustom() {
    const from = fromInputValue(customFrom);
    const to = fromInputValue(customTo);

    if (!from || !to) {
      setCustomError("Vui lòng chọn cả ngày bắt đầu và kết thúc.");
      return;
    }
    if (from > to) {
      setCustomError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.");
      return;
    }

    setCustomError(null);
    onChange({ from, to });
    setOpen(false);
  }

  // ── Display label ──────────────────────────────────────────────────────────

  const displayLabel =
    value.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : value.from
      ? `Từ ${formatDate(value.from)}`
      : "Chọn khoảng thời gian";

  const hasValue = Boolean(value.from || value.to);

  const presets: { key: Preset; label: string }[] = [
    { key: "today", label: "Hôm nay" },
    { key: "7days", label: "7 ngày qua" },
    { key: "30days", label: "30 ngày qua" },
    { key: "thisMonth", label: "Tháng này" },
    { key: "custom", label: "Tùy chỉnh" },
  ];

  return (
    <div ref={containerRef} className={`relative inline-flex flex-col ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/15",
          open
            ? "border-primary-400 ring-2 ring-primary-500/15 text-primary-700"
            : "border-secondary-200 text-secondary-700 hover:border-secondary-300",
        ].join(" ")}
      >
        <CalendarDaysIcon className="h-4 w-4 shrink-0 text-secondary-400" aria-hidden="true" />
        <span className={hasValue ? "text-secondary-800" : "text-secondary-400"}>
          {displayLabel}
        </span>
        {hasValue && (
          <span
            role="button"
            aria-label="Xóa khoảng thời gian"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange({ from: null, to: null });
              setActivePreset(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onChange({ from: null, to: null });
                setActivePreset(null);
              }
            }}
            className="ml-1 rounded text-secondary-400 hover:text-secondary-600 focus:outline-none"
          >
            <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 w-72 rounded-xl border border-secondary-200 bg-white shadow-xl">
          <div className="p-3">
            {/* Preset buttons */}
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => applyPreset(p.key)}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
                    activePreset === p.key
                      ? "bg-primary-100 text-primary-700 ring-1 ring-primary-300"
                      : "bg-secondary-100 text-secondary-700 hover:bg-secondary-200",
                  ].join(" ")}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom date inputs */}
            {activePreset === "custom" && (
              <div className="mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary-600">
                      Từ ngày
                    </label>
                    <DateInput
                      size="sm"
                      placeholder="DD/MM/YYYY"
                      value={customFrom}
                      onChange={(value) => {
                        setCustomFrom(value);
                        setCustomError(null);
                      }}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary-600">
                      Đến ngày
                    </label>
                    <DateInput
                      size="sm"
                      placeholder="DD/MM/YYYY"
                      value={customTo}
                      onChange={(value) => {
                        setCustomTo(value);
                        setCustomError(null);
                      }}
                    />
                  </div>
                </div>

                {/* Inline error */}
                {customError && (
                  <p className="text-xs text-error-600">{customError}</p>
                )}

                {/* Apply button */}
                <button
                  type="button"
                  onClick={applyCustom}
                  className="w-full rounded-lg bg-primary-600 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Áp dụng
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
