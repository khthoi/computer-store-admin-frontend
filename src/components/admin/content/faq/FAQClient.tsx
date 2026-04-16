"use client";

import { useEffect, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  PlusIcon, PencilIcon, TrashIcon,
  HandThumbUpIcon, EyeSlashIcon, Bars3Icon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FAQGroupFormModal } from "./FAQGroupFormModal";
import { FAQItemFormModal } from "./FAQItemFormModal";
import {
  getFAQGroups, getFAQItems,
  deleteFAQGroup, deleteFAQItem,
  reorderFAQGroups, reorderFAQItems,
} from "@/src/services/content.service";
import type { FAQGroup, FAQItem } from "@/src/types/content.types";

// ─── Sortable group row ───────────────────────────────────────────────────────

function SortableGroupRow({
  group, index, isSelected, onSelect, onEdit, onDelete, onDragEnd,
}: {
  group: FAQGroup;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={group}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => { setIsDragging(false); onDragEnd(); }}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={isDragging
        ? { scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }
        : { scale: 1,    boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className={[
        "group flex items-center gap-2 px-3 py-3 border-b border-secondary-100 last:border-0 transition-colors",
        isSelected ? "bg-primary-50" : "hover:bg-secondary-50",
        isDragging ? "bg-white rounded-lg" : "",
      ].join(" ")}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      >
        <Bars3Icon className="h-3.5 w-3.5" />
      </span>

      {/* Order badge */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[11px] font-bold text-secondary-500">
        {index}
      </span>

      {/* Content — clickable */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => e.key === "Enter" && onSelect()}
      >
        <p className={`text-sm font-medium truncate ${isSelected ? "text-primary-700" : "text-secondary-800"}`}>
          {group.name}
        </p>
        <p className="text-xs text-secondary-400">{group.itemCount} câu hỏi</p>
      </div>

      {!group.isVisible && <EyeSlashIcon className="h-4 w-4 text-secondary-300 shrink-0" />}

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="xs" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <PencilIcon className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <TrashIcon className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

// ─── Sortable item row ────────────────────────────────────────────────────────

function SortableItemRow({
  item, index, onEdit, onDelete, onDragEnd,
}: {
  item: FAQItem;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDragEnd: () => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

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
      className="group rounded-xl border border-secondary-200 bg-white p-4"
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <span
          className="mt-1 shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
          onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
        >
          <Bars3Icon className="h-4 w-4" />
        </span>

        {/* Order badge */}
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-700">
          {index}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-secondary-800 select-none">{item.question}</p>
          <p
            className="mt-1 text-sm text-secondary-500 line-clamp-2 select-none"
            dangerouslySetInnerHTML={{ __html: item.answer.replace(/<[^>]*>/g, " ") }}
          />
          <div className="mt-2 flex items-center gap-3 text-xs text-secondary-400">
            <span className="flex items-center gap-1">
              <HandThumbUpIcon className="h-3.5 w-3.5" />
              {item.helpfulCount}
            </span>
            {!item.isVisible && <Badge variant="default" size="sm">Ẩn</Badge>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Tooltip content="Chỉnh sửa" placement="top">
            <Button variant="ghost" size="xs" onClick={onEdit}>
              <PencilIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
          <Tooltip content="Xóa" placement="top">
            <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50" onClick={onDelete}>
              <TrashIcon className="h-3.5 w-3.5" />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FAQClient() {
  const { showToast } = useToast();

  // ── Core data ──────────────────────────────────────────────────────────────
  const [allItems, setAllItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // ── Groups — sortable list ─────────────────────────────────────────────────
  const [groups, setGroups] = useState<FAQGroup[]>([]);
  const groupsRef = useRef<FAQGroup[]>([]);
  const syncGroups = (next: FAQGroup[]) => { setGroups(next); groupsRef.current = next; };
  const [isDirtyGroups, setIsDirtyGroups] = useState(false);
  const [isSavingGroups, setIsSavingGroups] = useState(false);

  // ── Items for selected group — sortable list ───────────────────────────────
  const [groupItems, setGroupItems] = useState<FAQItem[]>([]);
  const groupItemsRef = useRef<FAQItem[]>([]);
  const syncGroupItems = (next: FAQItem[]) => { setGroupItems(next); groupItemsRef.current = next; };
  const [isDirtyItems, setIsDirtyItems] = useState(false);
  const [isSavingItems, setIsSavingItems] = useState(false);

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [groupForm, setGroupForm] = useState<FAQGroup | null | "new">(null);
  const [itemForm, setItemForm] = useState<FAQItem | null | "new">(null);
  const [deleteGroupTarget, setDeleteGroupTarget] = useState<FAQGroup | null>(null);
  const [deleteItemTarget, setDeleteItemTarget] = useState<FAQItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([getFAQGroups(), getFAQItems({ pageSize: 100 })]).then(([grps, itms]) => {
      const sorted = [...grps].sort((a, b) => a.sortOrder - b.sortOrder);
      syncGroups(sorted);
      setAllItems(itms.data);
      const firstId = sorted[0]?.id ?? null;
      setSelectedGroupId(firstId);
      const initialItems = firstId
        ? itms.data.filter((i) => i.groupId === firstId).sort((a, b) => a.sortOrder - b.sortOrder)
        : itms.data.sort((a, b) => a.sortOrder - b.sortOrder);
      syncGroupItems(initialItems);
      setIsLoading(false);
    });
  }, []);

  // ── Select group ───────────────────────────────────────────────────────────
  function selectGroup(id: string | null) {
    setSelectedGroupId(id);
    const filtered = id
      ? allItems.filter((i) => i.groupId === id).sort((a, b) => a.sortOrder - b.sortOrder)
      : [...allItems].sort((a, b) => a.sortOrder - b.sortOrder);
    syncGroupItems(filtered);
    setIsDirtyItems(false);
  }

  // ── Group reorder ──────────────────────────────────────────────────────────
  function handleGroupReorder(newOrder: FAQGroup[]) {
    syncGroups(newOrder);
    setIsDirtyGroups(true);
  }

  async function handleSaveGroupOrder() {
    setIsSavingGroups(true);
    try {
      await reorderFAQGroups(groupsRef.current.map((g) => g.id));
      setIsDirtyGroups(false);
      showToast("Đã lưu thứ tự nhóm", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSavingGroups(false);
    }
  }

  // ── Item reorder ───────────────────────────────────────────────────────────
  function handleItemReorder(newOrder: FAQItem[]) {
    syncGroupItems(newOrder);
    setIsDirtyItems(true);
  }

  async function handleSaveItemOrder() {
    if (!selectedGroupId) return;
    setIsSavingItems(true);
    try {
      await reorderFAQItems(selectedGroupId, groupItemsRef.current.map((i) => i.id));
      setIsDirtyItems(false);
      showToast("Đã lưu thứ tự câu hỏi", "success");
    } catch {
      showToast("Lưu thứ tự thất bại", "error");
    } finally {
      setIsSavingItems(false);
    }
  }

  // ── CRUD: groups ───────────────────────────────────────────────────────────
  function handleGroupSaved(group: FAQGroup) {
    const prev = groupsRef.current;
    const idx = prev.findIndex((g) => g.id === group.id);
    syncGroups(idx >= 0
      ? prev.map((g) => (g.id === group.id ? group : g))
      : [...prev, group]
    );
  }

  async function handleDeleteGroup() {
    if (!deleteGroupTarget) return;
    setIsDeleting(true);
    try {
      await deleteFAQGroup(deleteGroupTarget.id);
      const remaining = groupsRef.current.filter((g) => g.id !== deleteGroupTarget.id);
      syncGroups(remaining);
      // Remove orphaned items from allItems
      setAllItems((prev) => prev.filter((i) => i.groupId !== deleteGroupTarget.id));
      if (selectedGroupId === deleteGroupTarget.id) {
        selectGroup(remaining[0]?.id ?? null);
      }
      setDeleteGroupTarget(null);
    } finally { setIsDeleting(false); }
  }

  // ── CRUD: items ────────────────────────────────────────────────────────────
  function handleItemSaved(item: FAQItem) {
    // Update allItems
    setAllItems((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
      return [...prev, item];
    });
    // Update groupItems in-place (preserve drag order)
    const prev = groupItemsRef.current;
    const idx = prev.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      syncGroupItems(prev.map((i) => (i.id === item.id ? item : i)));
    } else if (item.groupId === selectedGroupId || !selectedGroupId) {
      syncGroupItems([...prev, item]);
    }
  }

  async function handleDeleteItem() {
    if (!deleteItemTarget) return;
    setIsDeleting(true);
    try {
      await deleteFAQItem(deleteItemTarget.id);
      setAllItems((prev) => prev.filter((i) => i.id !== deleteItemTarget.id));
      syncGroupItems(groupItemsRef.current.filter((i) => i.id !== deleteItemTarget.id));
      setDeleteItemTarget(null);
    } finally { setIsDeleting(false); }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="h-64 animate-pulse rounded-xl bg-secondary-100" />
        <div className="lg:col-span-2 space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary-100" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* ── Left: Groups ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-secondary-700">Nhóm câu hỏi</h3>
          <div className="flex items-center gap-2">
            {isDirtyGroups && (
              <Button size="sm" variant="primary" onClick={handleSaveGroupOrder} isLoading={isSavingGroups}>
                Lưu thứ tự
              </Button>
            )}
            <Button size="sm" variant="ghost" leftIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setGroupForm("new")}>
              Thêm
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-secondary-200 bg-white overflow-hidden">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-secondary-400">Chưa có nhóm nào</p>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={groups}
              onReorder={handleGroupReorder}
              as="div"
              style={{ touchAction: "none" }}
            >
              {groups.map((group, idx) => (
                <SortableGroupRow
                  key={group.id}
                  group={group}
                  index={idx + 1}
                  isSelected={selectedGroupId === group.id}
                  onSelect={() => selectGroup(group.id)}
                  onEdit={() => setGroupForm(group)}
                  onDelete={() => setDeleteGroupTarget(group)}
                  onDragEnd={() => {}}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>

      {/* ── Right: Items ─────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-secondary-700">
            {selectedGroup ? selectedGroup.name : "Tất cả câu hỏi"}{" "}
            <span className="font-normal text-secondary-400">({groupItems.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            {isDirtyItems && (
              <Button size="sm" variant="primary" onClick={handleSaveItemOrder} isLoading={isSavingItems}>
                Lưu thứ tự
              </Button>
            )}
            <Button size="sm" leftIcon={<PlusIcon className="h-4 w-4" />} onClick={() => setItemForm("new")}>
              Thêm câu hỏi
            </Button>
          </div>
        </div>

        {groupItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center rounded-xl border border-dashed border-secondary-200">
            <p className="text-sm text-secondary-400">Chưa có câu hỏi nào trong nhóm này</p>
            <Button size="sm" variant="outline" leftIcon={<PlusIcon className="h-4 w-4" />}
              onClick={() => setItemForm("new")}>
              Thêm câu hỏi đầu tiên
            </Button>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={groupItems}
            onReorder={handleItemReorder}
            as="div"
            className="space-y-2"
            style={{ touchAction: "none" }}
          >
            {groupItems.map((item, idx) => (
              <SortableItemRow
                key={item.id}
                item={item}
                index={idx + 1}
                onEdit={() => setItemForm(item)}
                onDelete={() => setDeleteItemTarget(item)}
                onDragEnd={() => {}}
              />
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Group form */}
      {groupForm !== null && (
        <FAQGroupFormModal
          group={groupForm === "new" ? null : groupForm}
          onClose={() => setGroupForm(null)}
          onSaved={handleGroupSaved}
        />
      )}

      {/* Item form */}
      {itemForm !== null && (
        <FAQItemFormModal
          item={itemForm === "new" ? null : itemForm}
          groups={groups}
          defaultGroupId={selectedGroupId ?? undefined}
          defaultSortOrder={groupItemsRef.current.length + 1}
          onClose={() => setItemForm(null)}
          onSaved={handleItemSaved}
        />
      )}

      {/* Delete confirms */}
      <ConfirmDialog
        isOpen={Boolean(deleteGroupTarget)}
        onClose={() => setDeleteGroupTarget(null)}
        onConfirm={handleDeleteGroup}
        title="Xóa nhóm FAQ"
        description={`Xóa nhóm "${deleteGroupTarget?.name}"? Tất cả câu hỏi trong nhóm sẽ bị xóa.`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
      <ConfirmDialog
        isOpen={Boolean(deleteItemTarget)}
        onClose={() => setDeleteItemTarget(null)}
        onConfirm={handleDeleteItem}
        title="Xóa câu hỏi"
        description={`Xóa câu hỏi "${deleteItemTarget?.question}"?`}
        confirmLabel="Xóa"
        variant="danger"
        isConfirming={isDeleting}
      />
    </div>
  );
}
