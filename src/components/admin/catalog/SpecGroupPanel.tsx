"use client";

import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowUturnDownIcon,
  LockClosedIcon,
  Squares2X2Icon,
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
  loading?: boolean;
}

// ─── Section header ───────────────────────────────────────────────────────────

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

// ─── Direct include row ───────────────────────────────────────────────────────

interface DirectRowProps {
  group: EffectiveSpecGroup;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function DirectRow({
  group,
  index,
  total,
  isSelected,
  onSelect,
  onRemove,
  onMoveUp,
  onMoveDown,
}: DirectRowProps) {
  const [removeOpen, setRemoveOpen] = useState(false);

  return (
    <>
      <li
        className={[
          "flex items-center gap-2 px-3 py-2 cursor-pointer group transition-colors",
          isSelected ? "bg-primary-50 border-l-2 border-primary-400" : "hover:bg-secondary-50",
        ].join(" ")}
        style={{ paddingLeft: isSelected ? "10px" : "12px" }}
        onClick={onSelect}
      >
        <Squares2X2Icon className="w-4 h-4 shrink-0 text-secondary-300" aria-hidden="true" />
        <div className="flex-1 min-w-0 overflow-hidden flex items-center">
          <Tooltip content={group.name} placement="top">
            <span
              className={[
                "inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium",
                isSelected ? "text-primary-700" : "text-secondary-800",
              ].join(" ")}
            >
              {group.name}
            </span>
          </Tooltip>
        </div>
        <span className="text-xs text-secondary-400 shrink-0 whitespace-nowrap">
          {group.specTypes.length} trường
        </span>

        {/* Actions — visible on hover */}
        <div
          className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            aria-label="Di chuyển lên"
            disabled={index === 0}
            onClick={onMoveUp}
            className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Di chuyển xuống"
            disabled={index === total - 1}
            onClick={onMoveDown}
            className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ArrowDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={`Gỡ nhóm "${group.name}"`}
            onClick={() => setRemoveOpen(true)}
            className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
          >
            <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </li>

      <ConfirmDialog
        isOpen={removeOpen}
        onClose={() => setRemoveOpen(false)}
        onConfirm={() => {
          onRemove();
          setRemoveOpen(false);
        }}
        title={`Gỡ nhóm "${group.name}"`}
        description="Nhóm thuộc tính sẽ bị gỡ khỏi danh mục này. Danh mục con sẽ không còn kế thừa nhóm này nữa."
        confirmLabel="Gỡ"
        cancelLabel="Hủy"
        variant="danger"
      />
    </>
  );
}

// ─── Inherited include row ────────────────────────────────────────────────────

interface InheritedRowProps {
  group: EffectiveSpecGroup;
  isSelected: boolean;
  onSelect: () => void;
  onSuppress: () => Promise<void>;
}

function InheritedRow({ group, isSelected, onSelect, onSuppress }: InheritedRowProps) {
  const [suppressOpen, setSuppressOpen] = useState(false);

  return (
    <>
      <li
        className={[
          "flex items-center gap-2 px-3 py-2 cursor-pointer group transition-colors",
          isSelected ? "bg-primary-50 border-l-2 border-primary-400" : "hover:bg-secondary-50",
        ].join(" ")}
        style={{ paddingLeft: isSelected ? "10px" : "12px" }}
        onClick={onSelect}
      >
        <LockClosedIcon className="w-3.5 h-3.5 shrink-0 text-secondary-300" aria-hidden="true" />
        <div className="flex-1 min-w-0 overflow-hidden flex items-center">
          <Tooltip content={group.name} placement="top">
            <span
              className={[
                "inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm",
                isSelected ? "text-primary-700" : "text-secondary-600",
              ].join(" ")}
            >
              {group.name}
            </span>
          </Tooltip>
        </div>
        <Tooltip content={`Kế thừa từ: ${group.sourceCategoryName}`} placement="top">
          <span className="text-xs text-secondary-400 shrink-0 cursor-help">
            {group.sourceCategoryName}
          </span>
        </Tooltip>

        {/* Suppress button */}
        <div
          className="flex items-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip content="Ẩn nhóm này khỏi danh mục con" placement="top">
            <button
              type="button"
              aria-label={`Ẩn nhóm kế thừa "${group.name}"`}
              onClick={() => setSuppressOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-warning-50 hover:text-warning-600 transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </Tooltip>
        </div>
      </li>

      <ConfirmDialog
        isOpen={suppressOpen}
        onClose={() => setSuppressOpen(false)}
        onConfirm={async () => {
          await onSuppress();
          setSuppressOpen(false);
        }}
        title={`Ẩn nhóm "${group.name}"`}
        description={`Nhóm "${group.name}" (kế thừa từ "${group.sourceCategoryName}") sẽ bị ẩn ở danh mục này và các danh mục con của nó.`}
        confirmLabel="Ẩn nhóm"
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
    try {
      await onRestore();
    } finally {
      setRestoring(false);
    }
  }

  return (
    <li className="flex items-center gap-2 px-3 py-2 group transition-colors hover:bg-secondary-50">
      <span className="flex-1 min-w-0 text-sm text-secondary-400 line-through truncate">
        {group.specGroupName}
      </span>
      <span className="text-xs text-secondary-400 shrink-0">{group.sourceCategoryName}</span>
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
  loading = false,
}: SpecGroupPanelProps) {
  const { directIncludes, inheritedIncludes, directExcludes } = view;

  function moveDirect(index: number, direction: "up" | "down") {
    const newOrder = [...directIncludes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onReorderDirect(newOrder.map((g) => g.id));
  }

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

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 flex items-center justify-center text-secondary-400 text-sm">
            Đang tải...
          </div>
        ) : directIncludes.length === 0 &&
          inheritedIncludes.length === 0 &&
          directExcludes.length === 0 ? (
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
            {/* Inherited includes — shown first so parent context is visible before own groups */}
            {inheritedIncludes.length > 0 && (
              <section>
                <SectionHeader title="Kế thừa từ danh mục cha" count={inheritedIncludes.length} />
                <ul>
                  {inheritedIncludes.map((group) => (
                    <InheritedRow
                      key={group.id}
                      group={group}
                      isSelected={selectedSpecGroupId === group.id}
                      onSelect={() => onSelectSpecGroup(group.id)}
                      onSuppress={() => onSuppressInherited(group.id)}
                    />
                  ))}
                </ul>
              </section>
            )}

            {/* Direct includes */}
            {directIncludes.length > 0 && (
              <section>
                <SectionHeader title="Riêng danh mục này" count={directIncludes.length} />
                <ul>
                  {directIncludes.map((group, idx) => (
                    <DirectRow
                      key={group.id}
                      group={group}
                      index={idx}
                      total={directIncludes.length}
                      isSelected={selectedSpecGroupId === group.id}
                      onSelect={() => onSelectSpecGroup(group.id)}
                      onRemove={() => onRemoveDirect(group.id)}
                      onMoveUp={() => moveDirect(idx, "up")}
                      onMoveDown={() => moveDirect(idx, "down")}
                    />
                  ))}
                </ul>
              </section>
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
