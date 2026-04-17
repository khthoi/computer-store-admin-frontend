"use client";

import { useState, useRef } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  PlusIcon, PencilIcon, TrashIcon, Bars3Icon,
  EyeIcon, EyeSlashIcon, PhotoIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { Modal } from "@/src/components/ui/Modal";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ImageField, emptyImageField, imageFieldFromUrl } from "@/src/components/ui/ImageField";
import type { ImageFieldValue } from "@/src/components/ui/ImageField";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { saveCategoryShortcuts } from "@/src/services/content.service";
import type { CategoryShortcut, CategoryShortcutFormData } from "@/src/types/content.types";

// ─── Default form ─────────────────────────────────────────────────────────────

const DEFAULT_FORM: CategoryShortcutFormData = {
  label: "",
  url: "",
  active: true,
  sortOrder: 0,
};

// ─── Shortcut Form Modal ──────────────────────────────────────────────────────

function ShortcutFormModal({
  item,
  onClose,
  onSave,
}: {
  item: CategoryShortcut | null;
  onClose: () => void;
  onSave: (data: CategoryShortcutFormData) => void;
}) {
  const [form, setForm] = useState<CategoryShortcutFormData>(
    item
      ? { iconUrl: item.iconUrl, label: item.label, url: item.url, active: item.active, sortOrder: item.sortOrder }
      : DEFAULT_FORM
  );
  const [iconImage, setIconImage] = useState<ImageFieldValue>(
    item?.iconUrl ? imageFieldFromUrl(item.iconUrl) : emptyImageField()
  );

  function set<K extends keyof CategoryShortcutFormData>(k: K, v: CategoryShortcutFormData[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  const canSave = !!(form.label.trim() && form.url.trim());

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Hủy</Button>
      <Button variant="primary" onClick={() => onSave(form)} disabled={!canSave}>
        {item ? "Cập nhật" : "Thêm mục"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={item ? "Sửa mục danh mục" : "Thêm mục danh mục"}
      size="xl"
      footer={footer}
      animated
    >
      <div className="flex flex-col gap-5">
        {/* Preview */}
        <div className="flex items-center gap-3 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm overflow-hidden">
            {form.iconUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={form.iconUrl} alt="" className="h-10 w-10 object-contain" />
              : <PhotoIcon className="h-7 w-7 text-secondary-200" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-secondary-800">
              {form.label || <span className="italic text-secondary-400">Tên danh mục</span>}
            </p>
            <p className="text-xs text-secondary-500 font-mono truncate max-w-xs">
              {form.url || "/products/..."}
            </p>
          </div>
        </div>

        {/* Icon upload */}
        <ImageField
          label="Icon danh mục"
          value={iconImage}
          onChange={(v) => {
            setIconImage(v);
            set("iconUrl", v.displayUrl ?? undefined);
          }}
          aspectRatioHint="1:1 — Kích thước đề nghị 64 × 64 px"
          allowedTypes={["image"]}
        />

        <Input
          label="Tên hiển thị"
          required
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="VD: Laptop, GPU, Bàn phím"
        />

        <Input
          label="URL đích"
          required
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          placeholder="/products/laptop"
          helperText="Đường dẫn đến trang danh mục khi người dùng nhấp"
        />

        <Toggle
          label="Hiển thị"
          checked={form.active}
          onChange={(e) => set("active", e.target.checked)}
        />
      </div>
    </Modal>
  );
}

// ─── Sortable shortcut row ────────────────────────────────────────────────────

function SortableShortcutRow({
  item,
  index,
  onToggle,
  onEdit,
  onDelete,
  onDragEnd,
}: {
  item: CategoryShortcut;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (c: CategoryShortcut) => void;
  onDelete: (c: CategoryShortcut) => void;
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
      className={[
        "group flex cursor-default items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        item.active
          ? "border-secondary-200 bg-white hover:border-secondary-300 hover:bg-secondary-50"
          : "border-secondary-100 bg-secondary-50 opacity-60",
      ].join(" ")}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => { e.preventDefault(); controls.start(e); }}
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Order badge */}
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[11px] font-bold text-secondary-500">
        {index}
      </span>

      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-secondary-100 bg-secondary-50 overflow-hidden">
        {item.iconUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.iconUrl} alt="" className="h-6 w-6 object-contain" />
          : <PhotoIcon className="h-4 w-4 text-secondary-300" />}
      </div>

      {/* Label */}
      <span className="flex-1 select-none truncate text-sm font-medium text-secondary-800">{item.label}</span>

      {/* URL on hover */}
      <span className="hidden max-w-[200px] select-none truncate font-mono text-xs text-secondary-400 group-hover:block">
        {item.url}
      </span>

      {/* Toggle visibility */}
      <button type="button" onClick={() => onToggle(item.id)}
        className="shrink-0 text-secondary-400 hover:text-secondary-600 transition-colors">
        {item.active ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip content="Chỉnh sửa" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onEdit(item)}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Xóa" placement="top">
          <Button variant="ghost" size="xs" className="text-error-500 hover:bg-error-50"
            onClick={() => onDelete(item)}>
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CategoryShortcutEditor({
  initialItems,
}: {
  initialItems: CategoryShortcut[];
}) {
  const { showToast } = useToast();
  const [items, setItems] = useState<CategoryShortcut[]>(
    [...initialItems].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const itemsRef = useRef(items);
  // keep ref fresh so drag-end closure reads latest order
  const syncRef = (next: CategoryShortcut[]) => { setItems(next); itemsRef.current = next; };

  const [formTarget, setFormTarget] = useState<CategoryShortcut | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryShortcut | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  function markDirty() { setIsDirty(true); }

  function handleReorder(newOrder: CategoryShortcut[]) {
    syncRef(newOrder);
    markDirty();
  }

  function handleDragEnd() {
    // sortOrder is re-assigned on save; nothing extra needed here
  }

  function handleSaved(data: CategoryShortcutFormData) {
    if (formTarget === "new") {
      const newItem: CategoryShortcut = {
        id: `cs-${Date.now()}`,
        ...data,
        sortOrder: itemsRef.current.length + 1,
      };
      syncRef([...itemsRef.current, newItem]);
    } else if (formTarget) {
      syncRef(itemsRef.current.map((c) => (c.id === formTarget.id ? { ...formTarget, ...data } : c)));
    }
    setFormTarget(null);
    markDirty();
  }

  function handleToggleActive(id: string) {
    syncRef(itemsRef.current.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
    markDirty();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    syncRef(itemsRef.current.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
    markDirty();
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const formData: CategoryShortcutFormData[] = itemsRef.current.map((c, idx) => ({
        emoji: c.emoji,
        iconUrl: c.iconUrl,
        label: c.label,
        url: c.url,
        active: c.active,
        sortOrder: idx + 1,
      }));
      await saveCategoryShortcuts(formData);
      setIsDirty(false);
      showToast("Đã lưu danh mục nổi bật", "success");
    } catch {
      showToast("Lưu thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-secondary-400">{items.length} mục</p>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button size="sm" variant="primary" onClick={handleSave} isLoading={isSaving}>
              Lưu thay đổi
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
          <p className="text-sm text-secondary-400">Chưa có mục nào.</p>
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
            <SortableShortcutRow
              key={item.id}
              item={item}
              index={idx + 1}
              onToggle={handleToggleActive}
              onEdit={(c) => setFormTarget(c)}
              onDelete={(c) => setDeleteTarget(c)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Reorder.Group>
      )}

      {/* Slider preview */}
      {items.filter((c) => c.active).length > 0 && (
        <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-secondary-400">
            Xem trước slider
          </p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {items.filter((c) => c.active).map((item) => (
              <div
                key={item.id}
                className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl bg-white px-4 py-3 text-center shadow-sm"
                style={{ minWidth: 72 }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-secondary-100 bg-secondary-50 overflow-hidden">
                  {item.iconUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={item.iconUrl} alt="" className="h-9 w-9 object-contain" />
                    : <PhotoIcon className="h-6 w-6 text-secondary-300" />}
                </div>
                <p className="text-xs font-medium text-secondary-700 whitespace-nowrap">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form modal */}
      {formTarget !== null && (
        <ShortcutFormModal
          item={formTarget === "new" ? null : formTarget}
          onClose={() => setFormTarget(null)}
          onSave={handleSaved}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Xóa mục danh mục"
        description={`Xóa mục "${deleteTarget?.label}"?`}
        confirmLabel="Xóa"
        variant="danger"
      />
    </div>
  );
}
