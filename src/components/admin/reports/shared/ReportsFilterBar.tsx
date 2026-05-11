"use client";

import { useEffect, useState } from "react";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Button } from "@/src/components/ui/Button";
import { AdminDateRangePicker } from "@/src/components/admin/shared/AdminDateRangePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportFilters {
  dateRange: { from: Date | null; to: Date | null };
  channel: string;
  category: string;
  comparePrevious: boolean;
}

interface ReportsFilterBarProps {
  value: ReportFilters;
  onChange: (v: ReportFilters) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "admin_report_filters";

const CHANNEL_OPTIONS = [
  { value: "", label: "Tất cả kênh" },
  { value: "online", label: "Online" },
  { value: "instore", label: "Tại cửa hàng" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "gpu", label: "GPU" },
  { value: "cpu", label: "CPU" },
  { value: "laptop", label: "Laptop" },
  { value: "ram", label: "RAM" },
];

// ─── Serialisation helpers ────────────────────────────────────────────────────

function serializeFilters(filters: ReportFilters): string {
  return JSON.stringify({
    dateFrom: filters.dateRange.from?.toISOString() ?? null,
    dateTo: filters.dateRange.to?.toISOString() ?? null,
    channel: filters.channel,
    category: filters.category,
    comparePrevious: filters.comparePrevious,
  });
}

function deserializeFilters(raw: string): ReportFilters | null {
  try {
    const parsed = JSON.parse(raw);
    return {
      dateRange: {
        from: parsed.dateFrom ? new Date(parsed.dateFrom) : null,
        to: parsed.dateTo ? new Date(parsed.dateTo) : null,
      },
      channel: parsed.channel ?? "",
      category: parsed.category ?? "",
      comparePrevious: parsed.comparePrevious ?? false,
    };
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ReportsFilterBar — filter controls for the reports page.
 * Persists state to sessionStorage on every change and restores on mount.
 */
export function ReportsFilterBar({ value, onChange }: ReportsFilterBarProps) {
  // Local draft state — applied only when "Áp dụng" is clicked
  const [draft, setDraft] = useState<ReportFilters>(value);

  // Restore from sessionStorage on mount
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const restored = deserializeFilters(raw);
        if (restored) {
          setDraft(restored);
          onChange(restored);
        }
      }
    } catch {
      // sessionStorage unavailable — silent fail
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDraft(partial: Partial<ReportFilters>) {
    const next = { ...draft, ...partial };
    setDraft(next);
    // Persist every draft change so page refreshes remember filters
    try {
      sessionStorage.setItem(STORAGE_KEY, serializeFilters(next));
    } catch {
      // ignore
    }
  }

  function handleApply() {
    onChange(draft);
  }

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white rounded-2xl border border-secondary-100 px-4 py-3 shadow-sm">
      {/* Date range picker */}
      <AdminDateRangePicker
        value={draft.dateRange}
        onChange={(range) => updateDraft({ dateRange: range })}
      />

      {/* Channel */}
      <Select
        label=""
        placeholder="Kênh: Tất cả"
        options={CHANNEL_OPTIONS}
        value={draft.channel}
        onChange={(v) => updateDraft({ channel: v as string })}
        size="sm"
      />

      {/* Category */}
      <Select
        label=""
        placeholder="Danh mục: Tất cả"
        options={CATEGORY_OPTIONS}
        value={draft.category}
        onChange={(v) => updateDraft({ category: v as string })}
        size="sm"
      />

      {/* Compare previous period toggle */}
      <Toggle
        label="So sánh kỳ trước"
        size="sm"
        checked={draft.comparePrevious}
        onChange={(e) => updateDraft({ comparePrevious: e.target.checked })}
      />

      {/* Apply button */}
      <Button size="sm" onClick={handleApply}>
        Áp dụng
      </Button>
    </div>
  );
}
