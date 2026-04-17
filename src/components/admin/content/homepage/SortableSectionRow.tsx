"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  Bars3Icon, EyeIcon, EyeSlashIcon,
  PencilIcon, TrashIcon, DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Button } from "@/src/components/ui/Button";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { DropdownAction } from "@/src/components/ui/DropdownAction";
import { TYPE_OPTIONS } from "@/src/components/ui/SectionTypePicker";
import type { HomepageSection } from "@/src/types/homepage.types";

// ─── Type → Badge variant mapping ────────────────────────────────────────────

const TYPE_BADGE_VARIANT = {
  category:     "info",
  promotion:    "warning",
  brand:        "success",
  manual:       "default",
  new_arrivals: "primary",
  best_selling: "error",
} as const;

const LAYOUT_LABELS = {
  carousel: "Carousel",
  grid_3:   "Grid 3",
  grid_4:   "Grid 4",
  grid_6:   "Grid 6",
};

// ─── Component ────────────────────────────────────────────────────────────────

export interface SortableSectionRowProps {
  section: HomepageSection;
  index: number;
  onEdit: (s: HomepageSection) => void;
  onDelete: (s: HomepageSection) => void;
  onDuplicate: (s: HomepageSection) => void;
}

export function SortableSectionRow({
  section,
  index,
  onEdit,
  onDelete,
  onDuplicate,
}: SortableSectionRowProps) {
  const controls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const typeCfg = TYPE_OPTIONS.find((t) => t.value === section.type);
  const TypeIcon = typeCfg?.icon;

  // Build description line
  const metaParts: string[] = [];
  metaParts.push(LAYOUT_LABELS[section.layout] ?? section.layout);
  metaParts.push(`${section.maxProducts} SP`);
  if (section.ngayBatDau || section.ngayKetThuc) {
    metaParts.push(
      [section.ngayBatDau, section.ngayKetThuc].filter(Boolean).join(" → ")
    );
  }

  return (
    <Reorder.Item
      value={section}
      dragControls={controls}
      dragListener={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      style={{ userSelect: "none", zIndex: isDragging ? 50 : "auto", position: "relative" }}
      animate={isDragging
        ? { scale: 1.015, boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }
        : { scale: 1,     boxShadow: "0 0px 0px rgba(0,0,0,0.00)" }
      }
      className={[
        "group flex items-center gap-3 rounded-xl border bg-white px-4 py-3.5 transition-colors",
        section.isVisible
          ? "border-secondary-200 hover:border-secondary-300"
          : "border-secondary-100 bg-secondary-50/60 opacity-60",
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
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-secondary-500">
        {index}
      </span>

      {/* Type icon */}
      {TypeIcon && (
        <div
          className={[
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            typeCfg.color,
          ].join(" ")}
        >
          <TypeIcon className={`h-5 w-5 ${typeCfg.iconColor}`} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="select-none truncate text-sm font-semibold text-secondary-800">
            {section.title}
          </p>
          {section.badgeLabel && (
            <span
              className="shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase text-white"
              style={{ backgroundColor: section.badgeColor || "#ef4444" }}
            >
              {section.badgeLabel}
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <Badge
            variant={TYPE_BADGE_VARIANT[section.type] ?? "default"}
            size="sm"
          >
            {typeCfg?.label ?? section.type}
          </Badge>
          <span className="text-[11px] text-secondary-400">
            {metaParts.join(" · ")}
          </span>
        </div>
      </div>

      {/* Visibility indicator */}
      <Tooltip content={section.isVisible ? "Đang hiển thị" : "Đang ẩn"} placement="top">
        <span className="shrink-0 text-secondary-400">
          {section.isVisible
            ? <EyeIcon className="h-4 w-4" />
            : <EyeSlashIcon className="h-4 w-4" />}
        </span>
      </Tooltip>

      {/* Actions — stay visible when dropdown is open, regardless of hover */}
      <div className={[
        "flex shrink-0 items-center gap-1 transition-opacity",
        dropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
      ].join(" ")}>
        <Tooltip content="Chỉnh sửa" placement="top">
          <Button variant="ghost" size="xs" onClick={() => onEdit(section)}>
            <PencilIcon className="h-3.5 w-3.5" />
          </Button>
        </Tooltip>
        <DropdownAction
          size="xs"
          onOpenChange={setDropdownOpen}
          items={[
            {
              key: "duplicate",
              label: "Nhân bản",
              icon: <DocumentDuplicateIcon className="h-4 w-4" />,
              onClick: () => onDuplicate(section),
            },
            {
              key: "delete",
              label: "Xóa khối",
              icon: <TrashIcon className="h-4 w-4" />,
              variant: "danger",
              onClick: () => onDelete(section),
            },
          ]}
        />
      </div>
    </Reorder.Item>
  );
}
