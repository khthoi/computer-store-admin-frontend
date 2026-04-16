"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  PlusIcon, PencilIcon, TrashIcon,
  EyeIcon, EyeSlashIcon, Bars3Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Badge } from "@/src/components/ui/Badge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { MenuItemFormModal } from "./MenuItemFormModal";
import { deleteMenuItem, reorderMenuItems } from "@/src/services/content.service";
import type { Menu, MenuItem } from "@/src/types/content.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CFG: Record<string, { label: string; variant: "default" | "info" | "success" }> = {
  link:     { label: "Liên kết", variant: "default" },
  page:     { label: "Trang",    variant: "info" },
  category: { label: "Danh mục", variant: "success" },
};

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableNavRow({
  item,
  index,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  item: MenuItem;
  index: number;
  onEdit: (i: MenuItem) => void;
  onDelete: (i: MenuItem) => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const cfg = TYPE_CFG[item.type] ?? TYPE_CFG.link;

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => { setIsDragging(false); onDragEnd(); }}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={isDragging
        ? { scale: 1.015, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }
        : { scale: 1,     boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className="group flex cursor-default items-center gap-3 rounded-lg border border-secondary-200 bg-white px-3 py-2.5 transition-colors hover:border-secondary-300 hover:bg-secondary-50"
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault(); // prevents text-selection on mousedown
          controls.start(e);
        }}
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Order badge */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[11px] font-bold text-secondary-500">
        {index}
      </span>

      {/* Visibility indicator */}
      {item.isVisible
        ? <EyeIcon className="h-4 w-4 shrink-0 text-secondary-400" />
        : <EyeSlashIcon className="h-4 w-4 shrink-0 text-secondary-300" />
      }

      {/* Label */}
      <span className="flex-1 select-none truncate text-sm font-medium text-secondary-800">
        {item.label}
      </span>

      {/* URL on hover */}
      <span className="hidden max-w-[200px] select-none truncate font-mono text-xs text-secondary-400 group-hover:block">
        {item.url}
      </span>

      <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip content="Chỉnh sửa" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onEdit(item)}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Xóa" placement="top">
          <Button
            variant="ghost" size="xs"
            className="text-error-500 hover:bg-error-50"
            onClick={() => onDelete(item)}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FlatNavEditor({
  menu,
  onMenuChanged,
}: {
  menu: Menu;
  onMenuChanged: (m: Menu) => void;
}) {
  const { showToast } = useToast();
  const [formTarget, setFormTarget] = useState<MenuItem | null | "new">(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const rootItems = useCallback(
    (items: MenuItem[]) =>
      items.filter((i) => !i.parentId).sort((a, b) => a.sortOrder - b.sortOrder),
    []
  );

  const [items, setItems] = useState<MenuItem[]>(() => rootItems(menu.items));

  // Always-fresh ref so drag-end callback reads latest order
  const itemsRef = useRef(items);
  useEffect(() => { itemsRef.current = items; }, [items]);

  // Sync when menu prop changes from parent (add/edit/delete)
  useEffect(() => {
    setItems(rootItems(menu.items));
  }, [menu.items, rootItems]);

  // ── Reorder live ──────────────────────────────────────────────────────────

  function handleReorder(newOrder: MenuItem[]) {
    setItems(newOrder);
  }

  // ── Mark dirty when pointer released; persist only on explicit save ───────

  const handleDragEnd = useCallback(() => {
    const current = itemsRef.current;
    const reindexed = current.map((item, idx) => ({ ...item, sortOrder: idx + 1 }));
    const nonRoot = menu.items.filter((i) => i.parentId);
    onMenuChanged({ ...menu, items: [...reindexed, ...nonRoot] });
    setIsDirty(true);
  }, [menu, onMenuChanged]);

  async function handleSaveOrder() {
    setIsSaving(true);
    try {
      await reorderMenuItems(menu.id, itemsRef.current.map((i) => i.id));
      setIsDirty(false);
      showToast("Đã lưu thứ tự", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  // ── Add / Edit ────────────────────────────────────────────────────────────

  function handleSaved(saved: MenuItem) {
    const next = [...menu.items];
    const idx = next.findIndex((i) => i.id === saved.id);
    if (idx >= 0) next[idx] = saved;
    else next.push(saved);
    onMenuChanged({ ...menu, items: next });
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteMenuItem(menu.id, deleteTarget.id);
      onMenuChanged({ ...menu, items: menu.items.filter((i) => i.id !== deleteTarget.id) });
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">
          {items.length} mục
          {items.length > 1 && (
            <span className="ml-1.5 text-secondary-300">
              · kéo <Bars3Icon className="inline h-3 w-3" /> để sắp xếp
            </span>
          )}
        </p>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleSaveOrder}
              isLoading={isSaving}
            >
              Lưu thứ tự
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            leftIcon={<PlusIcon className="h-4 w-4" />}
            onClick={() => setFormTarget("new")}
          >
            Thêm mục
          </Button>
        </div>
      </div>

      {/* Sortable list */}
      {items.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-secondary-200 py-10">
          <p className="text-sm text-secondary-400">Chưa có mục nào. Thêm mục đầu tiên.</p>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={items}
          onReorder={handleReorder}
          as="div"
          className="flex flex-col gap-1.5"
          style={{ touchAction: "none" }}
        >
          {items.map((item, idx) => (
            <SortableNavRow
              key={item.id}
              item={item}
              index={idx + 1}
              onEdit={(i) => setFormTarget(i)}
              onDelete={(i) => setDeleteTarget(i)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Form modal */}
      {formTarget !== null && (
        <MenuItemFormModal
          menuId={menu.id}
          item={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa mục menu"
        description={`Xóa mục "${deleteTarget?.label}"?`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
    </div>
  );
}
