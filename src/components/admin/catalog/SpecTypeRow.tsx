"use client";

import { useState } from "react";
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import type { SpecType, SpecTypeFormData } from "@/src/types/spec_group.types";

const MAX_DESCRIPTION_WORDS = 120;

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecTypeRowProps {
  specType: SpecType;
  index: number;
  total: number;
  /** True when this group is inherited — only allows read-only view */
  readOnly?: boolean;
  onUpdate: (id: string, data: Partial<SpecTypeFormData>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpecTypeRow({
  specType,
  index,
  total,
  readOnly = false,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SpecTypeRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [draftName, setDraftName] = useState(specType.name);
  const [draftDescription, setDraftDescription] = useState(specType.description);
  const [draftRequired, setDraftRequired] = useState(specType.required);

  function handleStartEdit() {
    setDraftName(specType.name);
    setDraftDescription(specType.description);
    setDraftRequired(specType.required);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleSave() {
    if (!draftName.trim()) return;
    setSaving(true);
    try {
      await onUpdate(specType.id, {
        name: draftName.trim(),
        description: draftDescription.trim(),
        required: draftRequired,
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

  // ── Edit mode ──────────────────────────────────────────────────────────────

  if (isEditing) {
    return (
      <li className="px-3 py-2.5 bg-primary-50/40 border border-primary-100 rounded-lg">
        <div className="flex flex-col gap-2.5">
          <Input
            label="Tên thuộc tính"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="VD: Dung lượng RAM"
            size="sm"
            required
            autoFocus
          />

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

          <div className="flex items-center justify-between">
            <Checkbox
              label="Bắt buộc"
              checked={draftRequired}
              onChange={(e) => setDraftRequired(e.target.checked)}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-secondary-600 hover:bg-secondary-100 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!draftName.trim() || saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <CheckIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </li>
    );
  }

  // ── Display mode ───────────────────────────────────────────────────────────

  return (
    <>
      <li className="flex items-center gap-2 py-1.5 px-2 rounded-lg group hover:bg-secondary-50 transition-colors">
        {/* Reorder buttons */}
        {!readOnly && (
          <div className="flex flex-col shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              aria-label="Di chuyển lên"
              disabled={index === 0}
              onClick={() => onMoveUp(specType.id)}
              className="flex h-4 w-4 items-center justify-center text-secondary-400 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowUpIcon className="w-3 h-3" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Di chuyển xuống"
              disabled={index === total - 1}
              onClick={() => onMoveDown(specType.id)}
              className="flex h-4 w-4 items-center justify-center text-secondary-400 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowDownIcon className="w-3 h-3" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Name + description */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center gap-1 min-w-0">
            <Tooltip content={specType.name} placement="top">
              <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-secondary-800">
                {specType.name}
              </span>
            </Tooltip>
            {specType.required && (
              <span className="shrink-0 text-error-500 text-xs leading-none" aria-label="bắt buộc">*</span>
            )}
          </div>
          {specType.description && (
            <Tooltip content={specType.description} placement="bottom">
              <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-secondary-400 mt-0.5 cursor-default">
                {specType.description}
              </span>
            </Tooltip>
          )}
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
      </li>

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
    </>
  );
}
