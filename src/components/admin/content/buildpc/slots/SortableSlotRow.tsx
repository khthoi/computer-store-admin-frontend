"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  Bars3Icon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Toggle } from "@/src/components/ui/Toggle";
import type { BuildPCSlot } from "@/src/types/buildpc.types";

// ─── Component ────────────────────────────────────────────────────────────────

export interface SortableSlotRowProps {
  slot: BuildPCSlot;
  index: number;
  onEdit: (s: BuildPCSlot) => void;
  onDelete: (s: BuildPCSlot) => void;
  onToggleActive: (s: BuildPCSlot, active: boolean) => void;
}

export function SortableSlotRow({
  slot,
  index,
  onEdit,
  onDelete,
  onToggleActive,
}: SortableSlotRowProps) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);

  return (
    <Reorder.Item
      value={slot}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{
        userSelect: "none",
        zIndex: isDragging ? 50 : "auto",
        position: "relative",
      }}
      animate={
        isDragging
          ? { scale: 1.015, boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }
          : { scale: 1, boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className={[
        "group flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 transition-colors",
        slot.isActive
          ? "border-secondary-200 hover:border-secondary-300"
          : "border-secondary-100 bg-secondary-50/60 opacity-60",
      ].join(" ")}
    >
      {/* Drag handle */}
      <span
        className="shrink-0 touch-none cursor-grab text-secondary-300 hover:text-secondary-500 active:cursor-grabbing"
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
      >
        <Bars3Icon className="h-4 w-4" />
      </span>

      {/* Order badge */}
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-500">
        {index}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-secondary-800">
            {slot.tenKhe}
          </p>
          <code className="shrink-0 rounded bg-secondary-100 px-1.5 py-0.5 text-[10px] font-mono text-secondary-500">
            {slot.maKhe}
          </code>
          {slot.batBuoc && (
            <Badge variant="error" size="sm">Bắt buộc</Badge>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[11px] text-secondary-400">
            {slot.danhMucTen}
          </span>
          <span className="text-[11px] text-secondary-300">·</span>
          <span className="text-[11px] text-secondary-400">
            Số lượng: {slot.soLuong}
          </span>
          {slot.moTa && (
            <>
              <span className="text-[11px] text-secondary-300">·</span>
              <span className="max-w-xs truncate text-[11px] text-secondary-400">
                {slot.moTa}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Active toggle */}
      <Tooltip content={slot.isActive ? "Đang bật" : "Đang tắt"} placement="top">
        <span>
          <Toggle
            checked={slot.isActive}
            onChange={(e) => onToggleActive(slot, e.target.checked)}
            size="sm"
          />
        </span>
      </Tooltip>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Tooltip content="Chỉnh sửa" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onEdit(slot)}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <Tooltip content="Xóa khe" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onDelete(slot)}>
            <TrashIcon className="h-3.5 w-3.5 text-error-500" />
          </Button>
        </Tooltip>
      </div>
    </Reorder.Item>
  );
}
