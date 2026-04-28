"use client";

import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import {
  PlusIcon,
  ArrowUturnDownIcon,
  LockClosedIcon,
  Squares2X2Icon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { UnifiedSpecGroupRow } from "@/src/components/admin/catalog/_UnifiedSpecGroupRow";
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
      return;
    }
    // When dirty, preserve drag order but sync additions/removals from new view
    const viewIds = new Set([...view.directIncludes, ...view.inheritedIncludes].map((g) => g.id));
    const viewMap = new Map([...view.directIncludes, ...view.inheritedIncludes].map((g) => [g.id, g]));
    setAllOrder((prev) => {
      const kept = prev.filter((g) => viewIds.has(g.id)).map((g) => viewMap.get(g.id)!);
      const keptIds = new Set(prev.map((g) => g.id));
      const added = [...view.directIncludes, ...view.inheritedIncludes].filter((g) => !keptIds.has(g.id));
      return [...kept, ...added];
    });
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
