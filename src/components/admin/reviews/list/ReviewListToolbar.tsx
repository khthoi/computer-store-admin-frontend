"use client";

import { useState } from "react";
import { XMarkIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Select }    from "@/src/components/ui/Select";
import { Button }    from "@/src/components/ui/Button";
import { DateInput } from "@/src/components/ui/DateInput";
import { Toggle }    from "@/src/components/ui/Toggle";
import type { ReviewFilters, ReviewStatus } from "@/src/types/review.types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_REVIEW_FILTERS: ReviewFilters = {
  search:     "",
  trangThai:  "",
  rating:     "",
  phienBanId: "",
  dateRange:  { from: null, to: null },
  chuaTraLoi: false,
};

function isDefaultFilters(f: ReviewFilters): boolean {
  return (
    !f.search &&
    !f.trangThai &&
    !f.rating &&
    !f.phienBanId &&
    !f.dateRange.from &&
    !f.dateRange.to &&
    !f.chuaTraLoi
  );
}

// ─── Date preset ─────────────────────────────────────────────────────────────

type DatePreset = "today" | "7days" | "30days" | "thisMonth" | "custom";

const DATE_PRESET_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "today",     label: "Hôm nay"      },
  { value: "7days",     label: "7 ngày qua"   },
  { value: "30days",    label: "30 ngày qua"  },
  { value: "thisMonth", label: "Tháng này"    },
  { value: "custom",    label: "Tuỳ chỉnh"    },
];

function presetToRange(preset: DatePreset): { from: Date; to: Date } {
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eod   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  switch (preset) {
    case "today":
      return { from: today, to: eod };
    case "7days":
      return { from: new Date(today.getTime() - 6 * 86400000), to: eod };
    case "30days":
      return { from: new Date(today.getTime() - 29 * 86400000), to: eod };
    case "thisMonth":
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: eod };
    case "custom":
      return { from: today, to: eod };
  }
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Select options ───────────────────────────────────────────────────────────

const TRANG_THAI_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "Pending",  label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt"  },
  { value: "Rejected", label: "Từ chối"   },
  { value: "Hidden",   label: "Đã ẩn"     },
];

const RATING_OPTIONS: { value: "1" | "2" | "3" | "4" | "5"; label: string }[] = [
  { value: "5", label: "★★★★★  5 sao" },
  { value: "4", label: "★★★★☆  4 sao" },
  { value: "3", label: "★★★☆☆  3 sao" },
  { value: "2", label: "★★☆☆☆  2 sao" },
  { value: "1", label: "★☆☆☆☆  1 sao" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewListToolbarProps {
  value:    ReviewFilters;
  onChange: (v: ReviewFilters) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReviewListToolbar — compact filter row for Reviews list page.
 * Search is handled by DataTable's built-in search bar.
 */
export function ReviewListToolbar({ value, onChange }: ReviewListToolbarProps) {
  const [showMore,    setShowMore]    = useState(false);
  const [datePreset,  setDatePreset]  = useState<DatePreset | "">("");

  const isDirty = !isDefaultFilters(value);

  function set<K extends keyof ReviewFilters>(key: K, val: ReviewFilters[K]) {
    onChange({ ...value, [key]: val });
  }

  function handleReset() {
    setDatePreset("");
    onChange(DEFAULT_REVIEW_FILTERS);
  }

  function handlePresetChange(preset: DatePreset | "") {
    setDatePreset(preset);
    if (!preset) {
      set("dateRange", { from: null, to: null });
      return;
    }
    if (preset === "custom") {
      // Keep existing dateRange or reset to today
      if (!value.dateRange.from && !value.dateRange.to) {
        const { from, to } = presetToRange("custom");
        set("dateRange", { from, to });
      }
      return;
    }
    const { from, to } = presetToRange(preset);
    set("dateRange", { from, to });
  }

  return (
    <div className="space-y-2">
      {/* ── Row 1: primary filters ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Trạng thái */}
        <div className="w-46 shrink-0">
          <Select
            placeholder="Trạng thái"
            options={TRANG_THAI_OPTIONS}
            value={value.trangThai}
            onChange={(v) => set("trangThai", (v ?? "") as ReviewFilters["trangThai"])}
            clearable
            size="sm"
          />
        </div>

        {/* Rating */}
        <div className="w-46 shrink-0">
          <Select
            placeholder="Rating"
            options={RATING_OPTIONS}
            value={value.rating}
            onChange={(v) => set("rating", (v ?? "") as ReviewFilters["rating"])}
            clearable
            size="sm"
          />
        </div>

        {/* More filters toggle */}
        <button
          type="button"
          onClick={() => setShowMore((v) => !v)}
          className={[
            "inline-flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg border transition-colors",
            showMore
              ? "border-primary-300 text-primary-700 bg-primary-50"
              : "border-secondary-200 text-secondary-600 hover:bg-secondary-50",
          ].join(" ")}
        >
          <AdjustmentsHorizontalIcon className="w-3.5 h-3.5" aria-hidden="true" />
          Thêm bộ lọc
          {(datePreset || value.chuaTraLoi) && (
            <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-primary-500 shrink-0" />
          )}
        </button>

        {isDirty && (
          <Button variant="secondary" size="sm" onClick={handleReset}>
            <XMarkIcon className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Đặt lại
          </Button>
        )}
      </div>

      {/* ── Row 2: extra filters (collapsible) ── */}
      {showMore && (
        <div className="flex flex-wrap items-center gap-3 pt-1 pl-0.5">
          {/* Date preset Select */}
          <div className="w-44 shrink-0">
            <Select
              placeholder="Khoảng thời gian"
              options={DATE_PRESET_OPTIONS}
              value={datePreset}
              onChange={(v) => handlePresetChange((v ?? "") as DatePreset | "")}
              clearable
              size="sm"
            />
          </div>

          {/* Custom date pickers — only when preset = "custom" */}
          {datePreset === "custom" && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary-500 shrink-0">Từ</span>
                <div className="w-44 shrink-0">
                  <DateInput
                    size="sm"
                    placeholder="DD/MM/YYYY"
                    value={value.dateRange.from ? toIsoDate(value.dateRange.from) : ""}
                    onChange={(iso) =>
                      set("dateRange", {
                        ...value.dateRange,
                        from: iso ? new Date(iso + "T00:00:00") : null,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-secondary-500 shrink-0">Đến</span>
                <div className="w-44 shrink-0">
                  <DateInput
                    size="sm"
                    placeholder="DD/MM/YYYY"
                    value={value.dateRange.to ? toIsoDate(value.dateRange.to) : ""}
                    onChange={(iso) =>
                      set("dateRange", {
                        ...value.dateRange,
                        to: iso ? new Date(iso + "T23:59:59") : null,
                      })
                    }
                  />
                </div>
              </div>
            </>
          )}

          {/* Separator */}
          <div className="w-px h-4 bg-secondary-200 shrink-0" />

          {/* Chưa trả lời toggle */}
          <Toggle
            label="Chưa trả lời"
            size="sm"
            checked={value.chuaTraLoi}
            onChange={(e) => set("chuaTraLoi", e.target.checked)}
          />
        </div>
      )}
    </div>
  );
}
