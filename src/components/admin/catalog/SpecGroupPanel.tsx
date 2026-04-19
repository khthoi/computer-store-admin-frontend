"use client";

import { useState, useEffect, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  PlusIcon,
  TrashIcon,
  EyeSlashIcon,
  ArrowUturnDownIcon,
  ArrowUturnUpIcon,
  LockClosedIcon,
  Squares2X2Icon,
  FunnelIcon,
  Bars3Icon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import type {
  CategorySpecGroupsView,
  EffectiveSpecGroup,
  ExcludedSpecGroup,
} from "@/src/types/spec_group.types";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecGroupPanelProps {
  categoryName: string;
  view: CategorySpecGroupsView;
  /** ID of the currently selected spec group (drives Panel 3) */
  selectedSpecGroupId: string | null;
  onSelectSpecGroup: (id: string) => void;
  onAddGroup: () => void;
  onRemoveDirect: (specGroupId: string) => Promise<void>;
  onSuppressInherited: (specGroupId: string) => Promise<void>;
  onRestoreExcluded: (specGroupId: string) => Promise<void>;
  onReorderDirect: (orderedIds: string[]) => Promise<void>;
  /** Bật/tắt hiển thị nhóm trong sidebar bộ lọc */
  onToggleFilter: (specGroupId: string, hienThiBoLoc: boolean) => Promise<void>;
  /** Cập nhật thứ tự nhóm trong sidebar bộ lọc */
  onUpdateThuTuBoLoc: (specGroupId: string, thuTuBoLoc: number) => Promise<void>;
  /**
   * Tạo bản ghi ghi_de_thu_tu cho nhóm kế thừa — cho phép danh mục này
   * ghi đè thứ tự hiển thị mà không cần re-assign trực tiếp.
   */
  onOverrideOrder: (specGroupId: string) => Promise<void>;
  /** Xóa bản ghi ghi_de_thu_tu — trả nhóm về thứ tự mặc định từ cha */
  onCancelOverride: (specGroupId: string) => Promise<void>;
  onRenameGroup?: (specGroupId: string, name: string) => Promise<void>;
  loading?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildInitialOrder(view: CategorySpecGroupsView): EffectiveSpecGroup[] {
  const all = [...view.directIncludes, ...view.inheritedIncludes];
  return all.sort((a, b) => {
    const aOrder = a.assignment?.displayOrder ?? a.displayOrder;
    const bOrder = b.assignment?.displayOrder ?? b.displayOrder;
    return aOrder - bOrder;
  });
}

// ─── Section header (Đã ẩn only) ─────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 bg-secondary-50 border-y border-secondary-100">
      <span className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
        {title}
      </span>
      <Badge variant="default" size="sm" className="text-xs">{count}</Badge>
    </div>
  );
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

// ─── Unified spec group row ───────────────────────────────────────────────────

type ConfirmType = "remove" | "suppress" | "cancel_override" | null;

interface UnifiedRowProps {
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

function UnifiedSpecGroupRow({
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
  const displayOrder = group.assignment?.displayOrder ?? group.displayOrder;

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

        {/* Order badge — shows stored displayOrder, tooltip shows positional rank */}
        <Tooltip content={`Vị trí #${index + 1} · Thứ tự hiển thị: ${displayOrder}`} placement="top">
          <span className="shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-full bg-secondary-100 text-secondary-500 text-[10px] font-semibold leading-none cursor-default select-none">
            {displayOrder}
          </span>
        </Tooltip>

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

// ─── Excluded group row ───────────────────────────────────────────────────────

interface ExcludedRowProps {
  group: ExcludedSpecGroup;
  onRestore: () => Promise<void>;
}

function ExcludedRow({ group, onRestore }: ExcludedRowProps) {
  const [restoring, setRestoring] = useState(false);

  async function handleRestore() {
    setRestoring(true);
    try { await onRestore(); } finally { setRestoring(false); }
  }

  return (
    <li className="flex items-center gap-2 px-3 py-2 group transition-colors hover:bg-secondary-50">
      <span className="flex-1 min-w-0 text-sm text-secondary-400 line-through truncate">
        {group.specGroupName}
      </span>
      <span className="text-xs text-secondary-400 shrink-0 truncate max-w-[80px]">
        {group.sourceCategoryName}
      </span>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Khôi phục kế thừa" placement="top">
          <button
            type="button"
            aria-label={`Khôi phục nhóm "${group.specGroupName}"`}
            onClick={handleRestore}
            disabled={restoring}
            className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-success-50 hover:text-success-600 disabled:opacity-40 transition-colors"
          >
            <ArrowUturnDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </Tooltip>
      </div>
    </li>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function SpecGroupPanel({
  categoryName,
  view,
  selectedSpecGroupId,
  onSelectSpecGroup,
  onAddGroup,
  onRemoveDirect,
  onSuppressInherited,
  onRestoreExcluded,
  onReorderDirect,
  onToggleFilter,
  onUpdateThuTuBoLoc: _onUpdateThuTuBoLoc,
  onOverrideOrder,
  onCancelOverride,
  onRenameGroup,
  loading = false,
}: SpecGroupPanelProps) {
  const { directExcludes } = view;

  const [allOrder, setAllOrder] = useState<EffectiveSpecGroup[]>(() => buildInitialOrder(view));
  const [isDirty, setIsDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      setAllOrder(buildInitialOrder(view));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isDirty]);

  function handleDragReorder(newOrder: EffectiveSpecGroup[]) {
    setAllOrder(newOrder);
    setIsDirty(true);
  }

  async function handleSaveOrder() {
    setSavingOrder(true);
    try {
      // Pure inherited groups need a ghi_de_thu_tu record before they can be reordered
      const pureInherited = allOrder.filter((g) => !g.assignment);
      for (const g of pureInherited) {
        await onOverrideOrder(g.id);
      }
      await onReorderDirect(allOrder.map((g) => g.id));
      setIsDirty(false);
    } finally {
      setSavingOrder(false);
    }
  }

  const totalCount = allOrder.length + directExcludes.length;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100 shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-secondary-900 truncate">
            Nhóm thuộc tính
          </h2>
          <p className="text-xs text-secondary-400 truncate mt-0.5">{categoryName}</p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddGroup}
          className="shrink-0 ml-2"
        >
          <PlusIcon className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          Thêm
        </Button>
      </div>

      {/* Legend */}
      {totalCount > 0 && (
        <div className="flex items-center gap-3 px-3 py-1.5 border-b border-secondary-100 bg-secondary-50/50">
          <Tooltip content="Nhóm đang hiện trong sidebar bộ lọc sản phẩm" placement="top">
            <span className="inline-flex items-center gap-1 text-[10px] text-secondary-400 cursor-help">
              <FunnelIcon className="w-3 h-3 text-success-500" />
              = bộ lọc bật
            </span>
          </Tooltip>
          <Tooltip content="Nhóm kế thừa từ danh mục cha" placement="top">
            <span className="inline-flex items-center gap-1 text-[10px] text-secondary-400 cursor-help">
              <LockClosedIcon className="w-3 h-3 text-amber-400" />
              = kế thừa
            </span>
          </Tooltip>
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 flex items-center justify-center text-secondary-400 text-sm">
            Đang tải...
          </div>
        ) : totalCount === 0 ? (
          <div className="p-8 flex flex-col items-center gap-2 text-secondary-400">
            <Squares2X2Icon className="w-10 h-10 text-secondary-300" aria-hidden="true" />
            <p className="text-sm text-center">
              Danh mục này chưa có nhóm thuộc tính nào.
              <br />
              Nhấn &ldquo;Thêm&rdquo; để gán nhóm.
            </p>
          </div>
        ) : (
          <>
            {/* Unified draggable list */}
            {allOrder.length > 0 && (
              <Reorder.Group
                as="ul"
                axis="y"
                values={allOrder}
                onReorder={handleDragReorder}
              >
                {allOrder.map((group, index) => (
                  <UnifiedSpecGroupRow
                    key={group.id}
                    group={group}
                    index={index}
                    isSelected={selectedSpecGroupId === group.id}
                    onSelect={() => onSelectSpecGroup(group.id)}
                    onRemove={
                      group.assignment?.assignmentType === "include"
                        ? () => onRemoveDirect(group.id)
                        : undefined
                    }
                    onToggleFilter={(v) => onToggleFilter(group.id, v)}
                    onRename={
                      onRenameGroup && group.assignment?.assignmentType === "include"
                        ? (name) => onRenameGroup(group.id, name)
                        : undefined
                    }
                    onSuppress={
                      !group.assignment
                        ? () => onSuppressInherited(group.id)
                        : undefined
                    }
                    onCancelOverride={
                      group.assignment?.assignmentType === "ghi_de_thu_tu"
                        ? () => onCancelOverride(group.id)
                        : undefined
                    }
                  />
                ))}
              </Reorder.Group>
            )}

            {/* Save order button */}
            {isDirty && (
              <div className="px-3 py-2 flex justify-end border-t border-secondary-100">
                <Button size="sm" onClick={handleSaveOrder} disabled={savingOrder}>
                  {savingOrder ? "Đang lưu..." : "Lưu thứ tự"}
                </Button>
              </div>
            )}

            {/* Excluded groups */}
            {directExcludes.length > 0 && (
              <section>
                <SectionHeader title="Đã ẩn" count={directExcludes.length} />
                <ul>
                  {directExcludes.map((group) => (
                    <ExcludedRow
                      key={group.specGroupId}
                      group={group}
                      onRestore={() => onRestoreExcluded(group.specGroupId)}
                    />
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
