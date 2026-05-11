"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { SpecificationItemInput } from "./SpecificationItemInput";
import type { SpecificationGroup, SpecificationItem } from "@/src/types/product.types";

// ─── SpecificationGroupEditor ─────────────────────────────────────────────────

interface SpecificationGroupEditorProps {
  group: SpecificationGroup;
  onChange: (group: SpecificationGroup) => void;
}

export function SpecificationGroupEditor({ group, onChange }: SpecificationGroupEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const filterableCount = group.items.filter((it) => it.coTheLoc).length;

  function handleItemChange(updated: SpecificationItem) {
    onChange({
      ...group,
      items: group.items.map((it) => (it.id === updated.id ? updated : it)),
    });
  }

  return (
    <div className="rounded-xl border border-secondary-200 bg-white shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* Thứ tự hiển thị nhóm */}
          {group.displayOrder != null && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-100 text-secondary-500 text-[10px] font-semibold leading-none shrink-0">
              {group.displayOrder}
            </span>
          )}
          <span className="text-sm font-semibold text-secondary-900">{group.label}</span>
          {group.inherited ? (
            <Badge variant="default" size="sm">Kế thừa</Badge>
          ) : (
            <Badge variant="primary" size="sm">Trực tiếp</Badge>
          )}

          {/* Filter visibility */}
          {group.hienThiBoLoc ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700">
              <FunnelIcon className="w-3 h-3" aria-hidden="true" />
              Bộ lọc bật · #{group.thuTuBoLoc}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[11px] text-secondary-400">
              <FunnelIcon className="w-3 h-3" aria-hidden="true" />
              Bộ lọc tắt
            </span>
          )}
          {filterableCount > 0 && (
            <span className="text-[11px] text-secondary-400">
              {filterableCount}/{group.items.length} thuộc tính có thể lọc
            </span>
          )}
        </div>

        {isOpen ? (
          <ChevronDownIcon className="h-4 w-4 text-secondary-400 shrink-0 ml-2" />
        ) : (
          <ChevronRightIcon className="h-4 w-4 text-secondary-400 shrink-0 ml-2" />
        )}
      </button>

      {/* Items */}
      {isOpen && (
        <div className="border-t border-secondary-100 px-6 pb-4">
          <div className="mt-2">
            {group.items.map((item) => (
              <SpecificationItemInput
                key={item.id}
                item={item}
                onChange={handleItemChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
