"use client";

import { useState, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  TrashIcon,
  EyeSlashIcon,
  ArrowUturnUpIcon,
  LockClosedIcon,
  Squares2X2Icon,
  FunnelIcon,
  Bars3Icon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import type { EffectiveSpecGroup } from "@/src/types/spec_group.types";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConfirmType = "remove" | "suppress" | "cancel_override" | null;

export interface UnifiedRowProps {
  group: EffectiveSpecGroup;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove?: () => void;
  onToggleFilter: (v: boolean) => void;
  onRename?: (name: string) => Promise<void>;
  onSuppress?: () => Promise<void>;
  onCancelOverride?: () => Promise<void>;
}

// ─── Filter indicator ─────────────────────────────────────────────────────────

interface FilterIndicatorProps {
  hienThiBoLoc: boolean;
  thuTuBoLoc: number;
  onToggle: (v: boolean) => void;
}

function FilterIndicator({ hienThiBoLoc, thuTuBoLoc, onToggle }: FilterIndicatorProps) {
  return (
    <div
      className="flex items-center gap-1 shrink-0"
      onClick={(e) => e.stopPropagation()}
    >
      {hienThiBoLoc && (
        <Tooltip content={`Thứ tự trong sidebar bộ lọc: ${thuTuBoLoc}`} placement="top">
          <span className="text-[10px] font-semibold text-success-600 tabular-nums leading-none cursor-default select-none">
            #{thuTuBoLoc}
          </span>
        </Tooltip>
      )}
      <Tooltip
        content={hienThiBoLoc ? "Đang hiện trong bộ lọc" : "Không hiện trong bộ lọc"}
        placement="top"
      >
        <button
          type="button"
          aria-label={hienThiBoLoc ? "Tắt bộ lọc" : "Bật bộ lọc"}
          onClick={() => onToggle(!hienThiBoLoc)}
          className={[
            "flex h-5 w-5 items-center justify-center rounded transition-colors",
            hienThiBoLoc
              ? "bg-success-50 text-success-600 hover:bg-success-100"
              : "text-secondary-300 hover:text-secondary-400 hover:bg-secondary-100",
          ].join(" ")}
        >
          <FunnelIcon className="w-3 h-3" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A single draggable spec-group row inside SpecGroupPanel.
 *
 * Handles three assignment variants in one component:
 *   - "include"        → direct assignment (can rename / remove)
 *   - "ghi_de_thu_tu"  → inherited with order override (can cancel override)
 *   - no assignment    → pure inherited (can suppress)
 *
 * Each row owns its inline-rename state and confirm-dialog state so the
 * parent list doesn't need to track per-row UI state.
 */
export function UnifiedSpecGroupRow({
  group,
  index,
  isSelected,
  onSelect,
  onRemove,
  onToggleFilter,
  onRename,
  onSuppress,
  onCancelOverride,
}: UnifiedRowProps) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [confirmType, setConfirmType] = useState<ConfirmType>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState(group.name);
  const [renaming, setRenaming] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isPureInherited = !group.assignment;
  const isOverride = group.assignment?.assignmentType === "ghi_de_thu_tu";
  const isDirect = group.assignment?.assignmentType === "include";
  const isInheritedVariant = isPureInherited || isOverride;
  const hienThiBoLoc = group.assignment?.hienThiBoLoc ?? false;
  const thuTuBoLoc = group.assignment?.thuTuBoLoc ?? 0;

  function handleStartRename(e: React.MouseEvent) {
    e.stopPropagation();
    setDraftName(group.name);
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  async function handleSaveRename() {
    if (!draftName.trim() || draftName.trim() === group.name) {
      setIsRenaming(false);
      return;
    }
    if (!onRename) { setIsRenaming(false); return; }
    setRenaming(true);
    try {
      await onRename(draftName.trim());
      setIsRenaming(false);
    } finally {
      setRenaming(false);
    }
  }

  function handleCancelRename() {
    setDraftName(group.name);
    setIsRenaming(false);
  }

  const rowBg = isSelected
    ? isInheritedVariant
      ? "bg-amber-50 border-l-2 border-amber-400"
      : "bg-primary-50 border-l-2 border-primary-400"
    : isInheritedVariant
      ? "hover:bg-amber-50/40 border-l-2 border-amber-100"
      : "hover:bg-secondary-50";

  return (
    <>
      <Reorder.Item
        as="li"
        value={group}
        dragControls={controls}
        dragListener={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{
          userSelect: "none",
          position: "relative",
          zIndex: isDragging ? 50 : "auto",
          listStyle: "none",
          paddingLeft: isSelected ? "10px" : "12px",
        }}
        animate={
          isDragging
            ? { scale: 1.01, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }
            : { scale: 1, boxShadow: "0 0px 0px rgba(0,0,0,0)" }
        }
        className={[
          "flex items-center gap-2 px-3 py-2 cursor-pointer group transition-colors",
          rowBg,
        ].join(" ")}
        onClick={isRenaming ? undefined : onSelect}
      >
        {/* Drag handle */}
        <span
          className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          onPointerDown={(e) => {
            if (isRenaming) return;
            e.preventDefault();
            e.stopPropagation();
            controls.start(e);
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <Bars3Icon className="w-3.5 h-3.5" aria-hidden="true" />
        </span>

        {/* Position badge */}
        <span className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary-100 text-secondary-500 text-[10px] font-semibold leading-none cursor-default select-none">
          {index + 1}
        </span>

        {/* Type icon */}
        {isInheritedVariant
          ? <LockClosedIcon className="w-3.5 h-3.5 shrink-0 text-amber-400" aria-hidden="true" />
          : <Squares2X2Icon className="w-4 h-4 shrink-0 text-secondary-300" aria-hidden="true" />
        }

        {/* Name + tags */}
        <div
          className="flex-1 min-w-0 overflow-hidden"
          onClick={(e) => isRenaming && e.stopPropagation()}
        >
          {isRenaming ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                ref={inputRef}
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveRename();
                  if (e.key === "Escape") handleCancelRename();
                }}
                onBlur={handleSaveRename}
                disabled={renaming}
                className="flex-1 min-w-0 rounded border border-primary-300 bg-white px-1.5 py-0.5 text-sm text-secondary-800 focus:outline-none focus:border-primary-500"
              />
              <button
                type="button"
                aria-label="Lưu tên"
                onMouseDown={(e) => { e.preventDefault(); handleSaveRename(); }}
                disabled={renaming}
                className="flex h-5 w-5 items-center justify-center rounded text-success-600 hover:bg-success-50 transition-colors disabled:opacity-40"
              >
                <CheckIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label="Hủy"
                onMouseDown={(e) => { e.preventDefault(); handleCancelRename(); }}
                className="flex h-5 w-5 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 transition-colors"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <Tooltip content={group.name} placement="top">
                  <span
                    className={[
                      "inline-block overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium",
                      isSelected
                        ? isInheritedVariant ? "text-amber-700" : "text-primary-700"
                        : "text-secondary-800",
                    ].join(" ")}
                  >
                    {group.name}
                  </span>
                </Tooltip>
                {isPureInherited && (
                  <span className="shrink-0 rounded px-1 py-0 text-[10px] leading-4 bg-secondary-100 text-secondary-500 font-medium whitespace-nowrap">
                    kế thừa
                  </span>
                )}
                {isOverride && (
                  <span className="shrink-0 rounded px-1 py-0 text-[10px] leading-4 bg-amber-50 text-amber-700 font-medium whitespace-nowrap">
                    kế thừa · ghi đè
                  </span>
                )}
              </div>
              {isInheritedVariant && (
                <span className="text-[11px] text-secondary-400 truncate">
                  từ {group.sourceCategoryName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Spec type count — direct only */}
        {!isRenaming && isDirect && (
          <span className="text-xs text-secondary-400 shrink-0 whitespace-nowrap">
            {group.specTypes.length} trường
          </span>
        )}

        {/* Filter indicator */}
        {!isRenaming && (
          <FilterIndicator hienThiBoLoc={hienThiBoLoc} thuTuBoLoc={thuTuBoLoc} onToggle={onToggleFilter} />
        )}

        {/* Actions — visible on hover */}
        {!isRenaming && (
          <div
            className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {isDirect && onRename && (
              <Tooltip content="Đổi tên nhóm" placement="top">
                <button
                  type="button"
                  aria-label={`Đổi tên nhóm "${group.name}"`}
                  onClick={handleStartRename}
                  className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
            {isDirect && onRemove && (
              <Tooltip content="Gỡ nhóm" placement="top">
                <button
                  type="button"
                  aria-label={`Gỡ nhóm "${group.name}"`}
                  onClick={() => setConfirmType("remove")}
                  className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
                >
                  <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
            {isPureInherited && onSuppress && (
              <Tooltip content="Ẩn nhóm này khỏi danh mục" placement="top">
                <button
                  type="button"
                  aria-label={`Ẩn nhóm kế thừa "${group.name}"`}
                  onClick={() => setConfirmType("suppress")}
                  className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-warning-50 hover:text-warning-600 transition-colors"
                >
                  <EyeSlashIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
            {isOverride && onCancelOverride && (
              <Tooltip content="Hoàn tác — trả về thứ tự mặc định từ cha" placement="top">
                <button
                  type="button"
                  aria-label={`Hoàn tác ghi đè "${group.name}"`}
                  onClick={() => setConfirmType("cancel_override")}
                  className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-warning-50 hover:text-warning-600 transition-colors"
                >
                  <ArrowUturnUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </Tooltip>
            )}
          </div>
        )}
      </Reorder.Item>

      <ConfirmDialog
        isOpen={confirmType === "remove"}
        onClose={() => setConfirmType(null)}
        onConfirm={() => { onRemove?.(); setConfirmType(null); }}
        title={`Gỡ nhóm "${group.name}"`}
        description="Nhóm thuộc tính sẽ bị gỡ khỏi danh mục này. Danh mục con sẽ không còn kế thừa nhóm này nữa."
        confirmLabel="Gỡ"
        cancelLabel="Hủy"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={confirmType === "suppress"}
        onClose={() => setConfirmType(null)}
        onConfirm={async () => { await onSuppress?.(); setConfirmType(null); }}
        title={`Ẩn nhóm "${group.name}"`}
        description={`Nhóm "${group.name}" (kế thừa từ "${group.sourceCategoryName}") sẽ bị ẩn ở danh mục này và các danh mục con của nó.`}
        confirmLabel="Ẩn nhóm"
        cancelLabel="Hủy"
        variant="warning"
      />
      <ConfirmDialog
        isOpen={confirmType === "cancel_override"}
        onClose={() => setConfirmType(null)}
        onConfirm={async () => { await onCancelOverride?.(); setConfirmType(null); }}
        title={`Hoàn tác ghi đè "${group.name}"`}
        description={`Nhóm "${group.name}" sẽ trở về thứ tự và cấu hình bộ lọc mặc định từ danh mục cha "${group.sourceCategoryName}".`}
        confirmLabel="Hoàn tác"
        cancelLabel="Hủy"
        variant="warning"
      />
    </>
  );
}
