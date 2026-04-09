"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Select }        from "@/src/components/ui/Select";
import { Toggle }        from "@/src/components/ui/Toggle";
import { Button }        from "@/src/components/ui/Button";
import { DateInput }     from "@/src/components/ui/DateInput";
import { AdminSearchBar } from "@/src/components/admin/shared/AdminSearchBar";
import type {
  TicketStatus,
  TicketPriority,
  TicketIssueType,
} from "@/src/types/ticket.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketFilters {
  search:        string;
  status:        TicketStatus | "";
  priority:      TicketPriority | "";
  loaiVanDe:     TicketIssueType | "";
  assignedTo:    string;
  dateRange:     { from: Date | null; to: Date | null };
  myTicketsOnly: boolean;
}

export const DEFAULT_TICKET_FILTERS: TicketFilters = {
  search:        "",
  status:        "",
  priority:      "",
  loaiVanDe:     "",
  assignedTo:    "",
  dateRange:     { from: null, to: null },
  myTicketsOnly: false,
};

interface TicketListToolbarProps {
  value:         TicketFilters;
  onChange:      (v: TicketFilters) => void;
  staffOptions?: { value: string; label: string }[];
}

// ─── Select option constants ──────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "Moi",         label: "Mới"            },
  { value: "DangXuLy",    label: "Đang xử lý"    },
  { value: "ChoKhach",    label: "Chờ khách"      },
  { value: "DaGiaiQuyet", label: "Đã giải quyết"  },
  { value: "Dong",        label: "Đóng"           },
];

const PRIORITY_OPTIONS = [
  { value: "Thap",      label: "Thấp"       },
  { value: "TrungBinh", label: "Trung bình" },
  { value: "Cao",       label: "Cao"        },
  { value: "KhanCap",   label: "Khẩn cấp"  },
];

const ISSUE_OPTIONS = [
  { value: "HoiTin",       label: "Hỏi thông tin"    },
  { value: "KhieuNai",     label: "Khiếu nại"        },
  { value: "YeuCauDoiTra", label: "Yêu cầu đổi/trả"  },
  { value: "LoiKyThuat",   label: "Lỗi kỹ thuật"     },
  { value: "Khac",         label: "Khác"              },
];

// ─── TicketDateRangeFilter ────────────────────────────────────────────────────

type Preset = "today" | "7days" | "30days" | "thisMonth" | "custom";

interface DateRange {
  from: Date | null;
  to:   Date | null;
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("vi-VN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
}

function toDateInputValue(d: Date | null): string {
  if (!d) return "";
  const y   = d.getFullYear();
  const m   = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fromDateInputValue(s: string): Date | null {
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

const PRESETS: { key: Preset; label: string }[] = [
  { key: "today",     label: "Hôm nay"     },
  { key: "7days",     label: "7 ngày qua"  },
  { key: "30days",    label: "30 ngày qua" },
  { key: "thisMonth", label: "Tháng này"   },
  { key: "custom",    label: "Tùy chỉnh"   },
];

function TicketDateRangeFilter({
  value,
  onChange,
}: {
  value:    DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [open,         setOpen]         = useState(false);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [customFrom,   setCustomFrom]   = useState(toDateInputValue(value.from));
  const [customTo,     setCustomTo]     = useState(toDateInputValue(value.to));
  const [customError,  setCustomError]  = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  // When activePreset === "custom", DateInput calendars render as React portals
  // outside containerRef, so we must NOT close on those clicks.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      if (activePreset === "custom") return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, activePreset]);

  // Sync custom inputs when value changes externally
  useEffect(() => {
    setCustomFrom(toDateInputValue(value.from));
    setCustomTo(toDateInputValue(value.to));
  }, [value.from, value.to]);

  function applyPreset(preset: Preset) {
    const today = startOfDay(new Date());
    if (preset === "custom") {
      setActivePreset("custom");
      return;
    }
    let from: Date | null = null;
    let to:   Date | null = null;
    switch (preset) {
      case "today":
        from = today; to = today; break;
      case "7days":
        from = addDays(today, -6); to = today; break;
      case "30days":
        from = addDays(today, -29); to = today; break;
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1); to = today; break;
    }
    setActivePreset(preset);
    onChange({ from, to });
    setOpen(false);
  }

  function applyCustom() {
    const from = fromDateInputValue(customFrom);
    const to   = fromDateInputValue(customTo);
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

  function clearRange(e: React.MouseEvent) {
    e.stopPropagation();
    onChange({ from: null, to: null });
    setActivePreset(null);
  }

  const hasValue    = Boolean(value.from || value.to);
  const displayLabel = value.from && value.to
    ? `${formatDateLabel(value.from)} – ${formatDateLabel(value.to)}`
    : value.from
    ? `Từ ${formatDateLabel(value.from)}`
    : "Khoảng thời gian";

  return (
    <div ref={containerRef} className="relative inline-flex flex-col">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={[
          "inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-[7px] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/15",
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
            onClick={clearRange}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") clearRange(e as unknown as React.MouseEvent); }}
            className="ml-1 rounded text-secondary-400 hover:text-secondary-600 focus:outline-none"
          >
            <XMarkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1.5 min-w-[320px] rounded-xl border border-secondary-200 bg-white shadow-xl p-3 space-y-3">
          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
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
            <div className="flex flex-col gap-2">
              <DateInput
                label="Từ ngày"
                value={customFrom}
                onChange={(v) => { setCustomFrom(v); setCustomError(null); }}
                placeholder="Chọn ngày bắt đầu"
                size="sm"
              />
              <DateInput
                label="Đến ngày"
                value={customTo}
                onChange={(v) => { setCustomTo(v); setCustomError(null); }}
                placeholder="Chọn ngày kết thúc"
                size="sm"
              />
              {customError && (
                <p className="text-xs text-error-600">{customError}</p>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={applyCustom}
                className="w-full"
              >
                Áp dụng
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TicketListToolbar ────────────────────────────────────────────────────────

/**
 * TicketListToolbar — filter bar for the support ticket list.
 */
export function TicketListToolbar({
  value,
  onChange,
  staffOptions = [],
}: TicketListToolbarProps) {
  function set(partial: Partial<TicketFilters>) {
    onChange({ ...value, ...partial });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-secondary-100 px-4 py-3 shadow-sm">
      {/* Search */}
      <AdminSearchBar
        value={value.search}
        onChange={(s) => set({ search: s })}
        placeholder="Tìm theo tiêu đề, mã phiếu, khách hàng..."
        className="min-w-[420px]"
      />

      {/* Status */}
      <Select
        label=""
        placeholder="Trạng thái"
        options={STATUS_OPTIONS}
        value={value.status}
        onChange={(v) => set({ status: (v as string) as TicketStatus | "" })}
        clearable
        size="sm"
      />

      {/* Priority */}
      <Select
        label=""
        placeholder="Ưu tiên"
        options={PRIORITY_OPTIONS}
        value={value.priority}
        onChange={(v) => set({ priority: (v as string) as TicketPriority | "" })}
        clearable
        size="sm"
      />

      {/* Issue type */}
      <Select
        label=""
        placeholder="Loại vấn đề"
        options={ISSUE_OPTIONS}
        value={value.loaiVanDe}
        onChange={(v) => set({ loaiVanDe: (v as string) as TicketIssueType | "" })}
        clearable
        size="sm"
      />

      {/* Assigned to */}
      <Select
        label=""
        placeholder="Phụ trách"
        options={staffOptions}
        value={value.assignedTo}
        onChange={(v) => set({ assignedTo: v as string })}
        searchable
        clearable
        size="sm"
      />

      {/* Date range */}
      <TicketDateRangeFilter
        value={value.dateRange}
        onChange={(range) => set({ dateRange: range })}
      />

      {/* My tickets toggle */}
      <Toggle
        label="Của tôi"
        size="sm"
        checked={value.myTicketsOnly}
        onChange={(e) => set({ myTicketsOnly: e.target.checked })}
      />
    </div>
  );
}
