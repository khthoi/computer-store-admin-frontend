"use client";

import { useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  children?: CategoryNode[];
}

interface CategoryTreeViewProps {
  categories: CategoryNode[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (parentId: string | null, newOrder: CategoryNode[]) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
  onAdd?: () => void;
}

// ─── Node component ───────────────────────────────────────────────────────────

interface CategoryNodeRowProps {
  node: CategoryNode;
  depth: number;
  siblings: CategoryNode[];
  siblingIndex: number;
  parentId: string | null;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (parentId: string | null, newOrder: CategoryNode[]) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

function CategoryNodeRow({
  node,
  depth,
  siblings,
  siblingIndex,
  parentId,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onReorder,
  selectedId,
  onSelect,
}: CategoryNodeRowProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const canReorder = !!onReorder && siblings.length > 1;

  function handleMoveUp() {
    if (!canReorder || siblingIndex === 0) return;
    const newOrder = [...siblings];
    const [item] = newOrder.splice(siblingIndex, 1);
    newOrder.splice(siblingIndex - 1, 0, item);
    onReorder!(parentId, newOrder);
  }

  function handleMoveDown() {
    if (!canReorder || siblingIndex === siblings.length - 1) return;
    const newOrder = [...siblings];
    const [item] = newOrder.splice(siblingIndex, 1);
    newOrder.splice(siblingIndex + 1, 0, item);
    onReorder!(parentId, newOrder);
  }

  // Background colour used by the actions gradient overlay
  const rowBg = isSelected ? "#EFF6FF" : "#F8FAFC";

  return (
    <>
      <li>
        <div
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onKeyDown={
            onSelect
              ? (e) => { if (e.key === "Enter" || e.key === " ") onSelect(node.id); }
              : undefined
          }
          onClick={() => onSelect?.(node.id)}
          className={[
            "relative flex items-center gap-1.5 py-1.5 rounded-lg group transition-colors overflow-hidden",
            onSelect ? "cursor-pointer select-none" : "",
            isSelected ? "bg-primary-50" : "hover:bg-secondary-50",
          ].join(" ")}
          style={{ paddingLeft: `${depth * 20}px`, paddingRight: "6px" }}
        >


          {/* Expand/collapse chevron — stopPropagation so row-click isn't triggered */}
          <button
            type="button"
            aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) onToggleExpand(node.id);
            }}
            className={[
              "flex h-5 w-5 shrink-0 items-center justify-center rounded text-secondary-400",
              hasChildren
                ? "hover:text-secondary-600 hover:bg-secondary-100 cursor-pointer"
                : "pointer-events-none opacity-0",
            ].join(" ")}
          >
            {hasChildren
              ? isExpanded
                ? <ChevronDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
                : <ChevronRightIcon className="w-3.5 h-3.5" aria-hidden="true" />
              : null}
          </button>

          {/* Folder icon */}
          <span className="shrink-0 text-secondary-400" aria-hidden="true">
            {isExpanded
              ? <FolderOpenIcon className="w-4 h-4" />
              : <FolderIcon className="w-4 h-4" />}
          </span>

          {/*
           * Name — TOOLTIP FIX:
           * The outer div is the flex-1 layout container.
           * The inner span is inline-block so its bounding rect = actual text width
           * (capped at max-w-full when truncated).  Tooltip anchors to the span, not
           * the full container width.
           */}
          <div className="flex-1 min-w-0 overflow-hidden flex items-center">
            <Tooltip content={node.name} placement="top">
              <span
                className={[
                  "inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium",
                  isSelected ? "text-primary-700" : "text-secondary-800",
                ].join(" ")}
              >
                {node.name}
              </span>
            </Tooltip>
          </div>

          {/*
           * Badge — TOOLTIP FIX:
           * Badge may not forward refs.  Wrap in a plain <span> so floating-ui's
           * cloneElement ref injection lands on a real DOM element.
           */}
          <Tooltip content={`${node.productCount} sản phẩm`} placement="top">
            <span className="shrink-0 inline-flex items-center self-center leading-none">
              <Badge variant="default" size="sm" className="text-xs tabular-nums">
                {node.productCount}
              </Badge>
            </span>
          </Tooltip>

          {/*
           * Slug — TOOLTIP FIX:
           * inline-block so the anchor is text-width, not full-column-width.
           */}
          <div className="shrink-0 hidden sm:flex items-center w-[90px] overflow-hidden">
            <Tooltip content={node.slug} placement="top">
              <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-secondary-400 font-mono">
                {node.slug}
              </span>
            </Tooltip>
          </div>

          {/*
           * Actions — LAYOUT FIX:
           * All 4 buttons always rendered → consistent width across every row.
           * Reorder buttons are "invisible" (not "hidden") when not applicable so
           * they still occupy space, keeping the action area width identical
           * regardless of whether reorder is enabled.
           *
           * Positioned absolutely so they NEVER affect the width of name / badge /
           * slug in the flex row.  A gradient overlay blends with the row background.
           */}
          <div
            className="absolute right-0 top-0 bottom-0 flex items-center gap-0.5 pl-6 pr-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              background: `linear-gradient(to right, transparent, ${rowBg} 35%)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Di chuyển lên"
              disabled={!canReorder || siblingIndex === 0}
              onClick={handleMoveUp}
              className={[
                "flex h-6 w-6 items-center justify-center rounded text-secondary-400 transition-colors",
                canReorder
                  ? "hover:bg-secondary-100 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none"
                  : "invisible pointer-events-none",
              ].join(" ")}
            >
              <ArrowUpIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label="Di chuyển xuống"
              disabled={!canReorder || siblingIndex === siblings.length - 1}
              onClick={handleMoveDown}
              className={[
                "flex h-6 w-6 items-center justify-center rounded text-secondary-400 transition-colors",
                canReorder
                  ? "hover:bg-secondary-100 hover:text-secondary-600 disabled:opacity-30 disabled:pointer-events-none"
                  : "invisible pointer-events-none",
              ].join(" ")}
            >
              <ArrowDownIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label={`Sửa "${node.name}"`}
              onClick={() => onEdit(node.id)}
              className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <PencilIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            <button
              type="button"
              aria-label={`Xóa "${node.name}"`}
              onClick={() => setDeleteOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
            >
              <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <ul className="space-y-0.5 mt-0.5">
            {node.children!.map((child, idx) => (
              <CategoryNodeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                siblings={node.children!}
                siblingIndex={idx}
                parentId={node.id}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </li>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          onDelete(node.id);
          setDeleteOpen(false);
        }}
        title={`Xóa danh mục "${node.name}"`}
        description={`Bạn có chắc chắn muốn xóa danh mục này${
          hasChildren ? " và tất cả danh mục con" : ""
        }? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
      />
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoryTreeView({
  categories,
  onEdit,
  onDelete,
  onReorder,
  selectedId,
  onSelect,
  onAdd,
}: CategoryTreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  function handleToggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-secondary-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-secondary-100">
        <h2 className="text-sm font-semibold text-secondary-900">Danh mục sản phẩm</h2>
        {onAdd && (
          <Button variant="primary" size="sm" onClick={onAdd}>
            <PlusIcon className="w-3 h-3 mr-1" aria-hidden="true" />
            Thêm
          </Button>
        )}
      </div>

      <div className="p-3">
        {categories.length === 0 ? (
          <div className="py-10 flex flex-col items-center gap-2 text-secondary-400">
            <FolderIcon className="w-10 h-10 text-secondary-300" aria-hidden="true" />
            <p className="text-sm">Danh mục chưa có sản phẩm</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {categories.map((node, idx) => (
              <CategoryNodeRow
                key={node.id}
                node={node}
                depth={1}
                siblings={categories}
                siblingIndex={idx}
                parentId={null}
                expandedIds={expandedIds}
                onToggleExpand={handleToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onReorder={onReorder}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
