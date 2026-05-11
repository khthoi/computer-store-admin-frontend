"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { Spinner } from "@/src/components/ui/Spinner";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import type { AdminStatus } from "@/src/components/admin/StatusBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProductStatus = "published" | "draft" | "archived";

export interface ProductStatusPanelProps {
  status: ProductStatus;
  onStatusChange: (s: ProductStatus) => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
  lastSavedAt?: string;
  scheduledAt?: string;
  onScheduledAtChange?: (v: string) => void;
  isSaving?: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "published", label: "Đã xuất bản" },
  { value: "draft", label: "Bản nháp" },
  { value: "archived", label: "Đã lưu trữ" },
];

const STATUS_TO_ADMIN: Record<ProductStatus, AdminStatus> = {
  published: "published",
  draft: "draft",
  archived: "archived",
};

function formatDateTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductStatusPanel({
  status,
  onStatusChange,
  onSaveDraft,
  onPublish,
  lastSavedAt,
  scheduledAt,
  onScheduledAtChange,
  isSaving = false,
}: ProductStatusPanelProps) {
  const [scheduleEnabled, setScheduleEnabled] = useState(Boolean(scheduledAt));
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  const handleSaveDraft = async () => {
    setIsDrafting(true);
    try {
      await onSaveDraft();
    } finally {
      setIsDrafting(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish();
    } finally {
      setIsPublishing(false);
    }
  };

  const isAnyLoading = isSaving || isDrafting || isPublishing;

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 p-4 shadow-sm space-y-4">
      {/* Header */}
      <p className="text-sm font-semibold text-secondary-800">Xuất bản</p>

      {/* Current status */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-secondary-500">Trạng thái hiện tại</p>
        <StatusBadge status={STATUS_TO_ADMIN[status]} size="sm" />
      </div>

      {/* Status select */}
      <Select
        label="Thay đổi trạng thái"
        options={STATUS_OPTIONS}
        value={status}
        onChange={(v) => onStatusChange(v as ProductStatus)}
        size="sm"
      />

      {/* Schedule toggle */}
      <div className="space-y-2">
        <Toggle
          label="Lên lịch xuất bản"
          size="sm"
          checked={scheduleEnabled}
          onChange={(e) => {
            setScheduleEnabled(e.target.checked);
            if (!e.target.checked) {
              onScheduledAtChange?.("");
            }
          }}
        />

        {scheduleEnabled && (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-secondary-600">
              Thời gian xuất bản
            </label>
            <input
              type="datetime-local"
              value={scheduledAt ?? ""}
              onChange={(e) => onScheduledAtChange?.(e.target.value)}
              className="w-full h-9 px-3 text-sm rounded border border-secondary-300 bg-white text-secondary-700
                         focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/15
                         disabled:cursor-not-allowed disabled:bg-secondary-100"
            />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <Button
          variant="secondary"
          size="sm"
          fullWidth
          onClick={handleSaveDraft}
          disabled={isAnyLoading}
          isLoading={isDrafting}
        >
          {!isDrafting && "Lưu nháp"}
        </Button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isAnyLoading}
          className="flex-1 inline-flex items-center justify-center gap-2 h-8 px-3 text-sm font-medium
                     rounded text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                     disabled:pointer-events-none disabled:opacity-50 transition-colors"
        >
          {isPublishing ? (
            <Spinner size="sm" color="white" label="Đang xuất bản…" />
          ) : (
            "Xuất bản"
          )}
        </button>
      </div>

      {/* Last saved timestamp */}
      {lastSavedAt && (
        <p className="text-xs text-secondary-400 pt-1">
          Đã lưu lúc {formatDateTime(lastSavedAt)}
        </p>
      )}
    </div>
  );
}
