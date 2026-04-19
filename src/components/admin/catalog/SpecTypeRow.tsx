"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Toggle } from "@/src/components/ui/Toggle";
import { Select, type SelectOption } from "@/src/components/ui/Select";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Button } from "@/src/components/ui/Button";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import type {
  SpecType,
  SpecTypeFormData,
  SpecDataType,
  FilterWidget,
} from "@/src/types/spec_group.types";

const MAX_DESCRIPTION_WORDS = 120;

// ─── Constants ────────────────────────────────────────────────────────────────

const DATA_TYPE_OPTIONS: SelectOption[] = [
  { value: "text", label: "Văn bản" },
  { value: "number", label: "Số" },
  { value: "enum", label: "Danh sách chọn" },
  { value: "boolean", label: "Có / Không" },
];

const WIDGET_OPTIONS: SelectOption[] = [
  { value: "checkbox", label: "Checkbox (chọn nhiều)" },
  { value: "range", label: "Range slider (khoảng số)" },
  { value: "toggle", label: "Toggle (bật/tắt)" },
  { value: "select", label: "Select (chọn một)" },
  { value: "combo-select", label: "Combo-select (kết hợp)" },
];

const DATA_TYPE_BADGE: Record<SpecDataType, { label: string; cls: string }> = {
  text: { label: "text", cls: "bg-secondary-100 text-secondary-500" },
  number: { label: "number", cls: "bg-blue-50 text-blue-600" },
  enum: { label: "enum", cls: "bg-violet-50 text-violet-600" },
  boolean: { label: "bool", cls: "bg-amber-50 text-amber-600" },
};

const WIDGET_BADGE: Record<FilterWidget, string> = {
  checkbox: "checkbox",
  range: "range",
  toggle: "toggle",
  select: "select",
  "combo-select": "combo-select",
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecTypeRowProps {
  specType: SpecType;
  /** True when this group is inherited — only allows read-only view */
  readOnly?: boolean;
  onUpdate: (id: string, data: Partial<SpecTypeFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpecTypeRow({
  specType,
  readOnly = false,
  onUpdate,
  onDelete,
}: SpecTypeRowProps) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [draftName, setDraftName] = useState(specType.name);
  const [draftDescription, setDraftDescription] = useState(specType.description);
  const [draftMaKyThuat, setDraftMaKyThuat] = useState(specType.maKyThuat ?? "");
  const [draftRequired, setDraftRequired] = useState(specType.required);
  const [draftKieuDuLieu, setDraftKieuDuLieu] = useState<SpecDataType>(specType.kieuDuLieu);
  const [draftDonVi, setDraftDonVi] = useState(specType.donVi ?? "");
  const [draftCoTheLoc, setDraftCoTheLoc] = useState(specType.coTheLoc);
  const [draftWidgetLoc, setDraftWidgetLoc] = useState<FilterWidget | "">(specType.widgetLoc ?? "");

  function handleStartEdit() {
    setDraftName(specType.name);
    setDraftDescription(specType.description);
    setDraftMaKyThuat(specType.maKyThuat ?? "");
    setDraftRequired(specType.required);
    setDraftKieuDuLieu(specType.kieuDuLieu);
    setDraftDonVi(specType.donVi ?? "");
    setDraftCoTheLoc(specType.coTheLoc);
    setDraftWidgetLoc(specType.widgetLoc ?? "");
    setIsEditing(true);
  }

  async function handleSave() {
    if (!draftName.trim()) return;
    setSaving(true);
    try {
      await onUpdate(specType.id, {
        name: draftName.trim(),
        description: draftDescription.trim(),
        maKyThuat: draftMaKyThuat.trim(),
        required: draftRequired,
        kieuDuLieu: draftKieuDuLieu,
        donVi: draftDonVi.trim(),
        coTheLoc: draftCoTheLoc,
        widgetLoc: draftCoTheLoc ? (draftWidgetLoc as FilterWidget) || "checkbox" : undefined,
        // thuTuLoc syncs with displayOrder — no manual input needed
        thuTuLoc: draftCoTheLoc ? specType.displayOrder : 0,
      });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    await onDelete(specType.id);
    setDeleteOpen(false);
  }

  const dtBadge = DATA_TYPE_BADGE[specType.kieuDuLieu];

  return (
    <Reorder.Item
      as="li"
      value={specType}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{
        userSelect: "none",
        position: "relative",
        zIndex: isDragging ? 50 : "auto",
        listStyle: "none",
      }}
      animate={
        isDragging
          ? { scale: 1.02, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }
          : { scale: 1, boxShadow: "0 0px 0px rgba(0,0,0,0)" }
      }
    >
      {isEditing ? (
        /* ── Edit mode ──────────────────────────────────────────────────── */
        <div className="px-3 py-3 bg-primary-50/40 border border-primary-100 rounded-lg">
          <div className="flex flex-col gap-3">
            {/* Tên + kiểu dữ liệu + đơn vị */}
            <Input
              label="Tên thuộc tính"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="VD: Dung lượng RAM"
              size="sm"
              required
              autoFocus
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  label="Kiểu dữ liệu"
                  options={DATA_TYPE_OPTIONS}
                  value={draftKieuDuLieu}
                  onChange={(val) => {
                    const v = val as SpecDataType;
                    setDraftKieuDuLieu(v);
                    if (v !== "number") setDraftDonVi("");
                    if (v === "boolean") setDraftWidgetLoc("toggle");
                  }}
                  size="sm"
                />
              </div>
              {draftKieuDuLieu === "number" && (
                <div className="w-28">
                  <Input
                    label="Đơn vị"
                    value={draftDonVi}
                    onChange={(e) => setDraftDonVi(e.target.value)}
                    placeholder="GHz, W, GB…"
                    size="sm"
                  />
                </div>
              )}
            </div>

            {/* Mã kỹ thuật */}
            <Input
              label="Mã kỹ thuật"
              value={draftMaKyThuat}
              onChange={(e) =>
                setDraftMaKyThuat(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
              placeholder="VD: cpu_socket, tdp_watt, ram_type…"
              size="sm"
              helperText="Dùng cho engine kiểm tra tương thích Build PC — để trống nếu không cần"
            />

            {/* Mô tả */}
            <Textarea
              label="Mô tả"
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Mô tả ngắn về thuộc tính này..."
              size="sm"
              rows={2}
              autoResize
              showCharCount
              maxCharCount={MAX_DESCRIPTION_WORDS}
            />

            {/* Cấu hình bộ lọc */}
            <div className="rounded-md border border-secondary-200 bg-secondary-50 px-3 py-2.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-secondary-700 flex items-center gap-1.5">
                  <FunnelIcon className="w-3.5 h-3.5" />
                  Bộ lọc sản phẩm
                </span>
                <Toggle
                  checked={draftCoTheLoc}
                  onChange={(e) => {
                    setDraftCoTheLoc(e.target.checked);
                    if (!e.target.checked) {
                      setDraftWidgetLoc("");
                    } else if (!draftWidgetLoc) {
                      setDraftWidgetLoc(
                        draftKieuDuLieu === "number"
                          ? "range"
                          : draftKieuDuLieu === "boolean"
                          ? "toggle"
                          : "checkbox"
                      );
                    }
                  }}
                  label="Dùng làm facet filter"
                  size="sm"
                />
              </div>
              {draftCoTheLoc && (
                <Select
                  label="Dạng widget"
                  options={WIDGET_OPTIONS}
                  value={draftWidgetLoc}
                  onChange={(val) => setDraftWidgetLoc(val as FilterWidget)}
                  placeholder="— Chọn widget —"
                  size="sm"
                />
              )}
            </div>

            {/* Bắt buộc */}
            <div className="pt-1 ml-1">
              <Checkbox
                label="Bắt buộc"
                checked={draftRequired}
                onChange={(e) => setDraftRequired(e.target.checked)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!draftName.trim() || saving}
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Display mode ───────────────────────────────────────────────── */
        <div className="flex items-start gap-2 py-1.5 px-2 rounded-lg group hover:bg-secondary-50 transition-colors">
          {/* Drag handle — chỉ hiện khi hover, ẩn khi readOnly */}
          {!readOnly && (
            <span
              className="shrink-0 mt-1 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
              onPointerDown={(e) => {
                e.preventDefault();
                controls.start(e);
              }}
            >
              <Bars3Icon className="w-3.5 h-3.5" aria-hidden="true" />
            </span>
          )}

          {/* Nội dung chính */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              <span className="shrink-0 rounded px-1 py-0 font-mono text-[10px] leading-4 bg-secondary-100 text-secondary-400 tabular-nums select-none">
                #{specType.displayOrder}
              </span>
              <Tooltip content={specType.name} placement="top">
                <span className="text-sm font-medium text-secondary-800 truncate max-w-[160px]">
                  {specType.name}
                </span>
              </Tooltip>
              {specType.required && (
                <span
                  className="shrink-0 text-error-500 text-xs leading-none"
                  aria-label="bắt buộc"
                >
                  *
                </span>
              )}
              <span
                className={`shrink-0 rounded px-1 py-0 font-mono text-[10px] leading-4 ${dtBadge.cls}`}
              >
                {dtBadge.label}
                {specType.donVi ? ` · ${specType.donVi}` : ""}
              </span>
              {specType.coTheLoc && specType.widgetLoc && (
                <Tooltip
                  content={`Facet filter · ${WIDGET_BADGE[specType.widgetLoc]}`}
                  placement="top"
                >
                  <span className="shrink-0 inline-flex items-center gap-0.5 rounded px-1 py-0 text-[10px] leading-4 bg-success-50 text-success-700 font-medium">
                    <FunnelIcon className="w-2.5 h-2.5" />
                    {WIDGET_BADGE[specType.widgetLoc]}
                  </span>
                </Tooltip>
              )}
            </div>

            {specType.maKyThuat && (
              <div className="mt-0.5">
                <code className="rounded bg-secondary-100 px-1 py-0 font-mono text-[10px] text-secondary-500">
                  {specType.maKyThuat}
                </code>
              </div>
            )}

            {specType.description && (
              <Tooltip content={specType.description} placement="bottom" anchorToContent>
                <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-secondary-400 mt-0.5 cursor-default">
                  {specType.description}
                </span>
              </Tooltip>
            )}
          </div>

          {/* Actions */}
          {!readOnly && (
            <div className="flex items-center gap-0.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                aria-label={`Sửa "${specType.name}"`}
                onClick={handleStartEdit}
                className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={`Xóa "${specType.name}"`}
                onClick={() => setDeleteOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Xóa thuộc tính "${specType.name}"`}
        description="Bạn có chắc chắn muốn xóa thuộc tính này? Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
      />
    </Reorder.Item>
  );
}
