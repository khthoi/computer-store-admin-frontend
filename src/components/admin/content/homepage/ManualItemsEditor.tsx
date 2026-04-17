"use client";

import { useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { PlusIcon, TrashIcon, Bars3Icon, PhotoIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ProductPickerModal } from "./ProductPickerModal";
import type { SectionItem } from "@/src/types/homepage.types";

// ─── Sortable row ─────────────────────────────────────────────────────────────

function SortableItemRow({
  item,
  index,
  onRemove,
}: {
  item: SectionItem;
  index: number;
  onRemove: (id: number) => void;
}) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={item}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={isDragging
        ? { scale: 1.015, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }
        : { scale: 1,     boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className="group flex items-center gap-3 rounded-xl border border-secondary-200 bg-white px-3 py-2.5 transition-colors hover:border-secondary-300"
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

      {/* Thumbnail */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary-50 overflow-hidden border border-secondary-100">
        {item.hinhAnh
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={item.hinhAnh} alt="" className="h-full w-full object-cover" />
          : <PhotoIcon className="h-5 w-5 text-secondary-300" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="select-none truncate text-sm font-medium text-secondary-800">{item.tenSanPham}</p>
        <p className="select-none text-xs text-secondary-400 font-mono">{item.SKU}</p>
      </div>

      {/* Price */}
      <p className="select-none shrink-0 text-sm font-semibold text-primary-600">
        {item.giaBan.toLocaleString("vi-VN")}đ
      </p>

      {/* Remove */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Xóa khỏi danh sách" placement="top">
          <Button
            variant="ghost"
            size="xs"
            className="text-error-500 hover:bg-error-50"
            onClick={() => onRemove(item.phienBanId)}
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface ManualItemsEditorProps {
  items: SectionItem[];
  onChange: (items: SectionItem[]) => void;
}

export function ManualItemsEditor({ items, onChange }: ManualItemsEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const itemsRef = useRef(items);
  const syncItems = (next: SectionItem[]) => { onChange(next); itemsRef.current = next; };

  function handleReorder(newOrder: SectionItem[]) {
    syncItems(newOrder);
  }

  function handleRemove(phienBanId: number) {
    syncItems(itemsRef.current.filter((i) => i.phienBanId !== phienBanId));
  }

  function handlePickerConfirm(picked: SectionItem[]) {
    syncItems(picked);
    setShowPicker(false);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-secondary-700">
          Sản phẩm đã chọn
          {items.length > 0 && (
            <span className="ml-1.5 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-bold text-primary-700">
              {items.length}
            </span>
          )}
        </p>
        <Button
          size="sm"
          variant="outline"
          leftIcon={<PlusIcon className="h-4 w-4" />}
          onClick={() => setShowPicker(true)}
        >
          {items.length === 0 ? "Thêm sản phẩm" : "Chỉnh sửa danh sách"}
        </Button>
      </div>

      {/* Sortable list */}
      {items.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setShowPicker(true)}
          onKeyDown={(e) => e.key === "Enter" && setShowPicker(true)}
          className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-secondary-200 py-10 text-center transition-colors hover:border-primary-300 hover:bg-primary-50/40"
        >
          <PlusIcon className="h-8 w-8 text-secondary-300" />
          <p className="text-sm text-secondary-400">Nhấn để chọn sản phẩm hiển thị</p>
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
            <SortableItemRow
              key={item.phienBanId}
              item={item}
              index={idx + 1}
              onRemove={handleRemove}
            />
          ))}
        </Reorder.Group>
      )}

      {items.length > 0 && (
        <p className="text-[10px] text-secondary-400">
          Kéo <Bars3Icon className="inline h-3 w-3" /> để điều chỉnh thứ tự hiển thị
        </p>
      )}

      {/* Product picker modal */}
      {showPicker && (
        <ProductPickerModal
          initialItems={items}
          onClose={() => setShowPicker(false)}
          onConfirm={handlePickerConfirm}
        />
      )}
    </div>
  );
}
