"use client";

import { SpecificationItemEditor } from "@/src/components/admin/variant/SpecificationItemEditor";
import type { SpecificationItem } from "@/src/types/product.types";

// ─── SpecificationItemInput ───────────────────────────────────────────────────

interface SpecificationItemInputProps {
  item: SpecificationItem;
  onChange: (item: SpecificationItem) => void;
}

export function SpecificationItemInput({ item, onChange }: SpecificationItemInputProps) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4 py-3 border-b border-secondary-100 last:border-0">
      {/* Type label — read-only */}
      <div className="pt-2">
        <span className="text-xs font-medium text-secondary-500">{item.typeLabel}</span>
        {item.description && (
          <span className="mt-0.5 block text-[10px] text-secondary-400">{item.description}</span>
        )}
        {item.maKyThuat && (
          <code className="mt-1 inline-block rounded bg-secondary-100 px-1.5 py-0.5 font-mono text-[10px] text-secondary-500">
            {item.maKyThuat}
          </code>
        )}
      </div>

      {/* Value editor */}
      <SpecificationItemEditor
        value={item.value}
        onChange={(html) => onChange({ ...item, value: html })}
        placeholder={`Enter value for ${item.typeLabel}…`}
      />
    </div>
  );
}
