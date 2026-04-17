"use client";

import { SpecificationGroupEditor } from "./SpecificationGroupEditor";
import type { SpecificationGroup } from "@/src/types/product.types";

// ─── SpecificationEditor ──────────────────────────────────────────────────────

interface SpecificationEditorProps {
  groups: SpecificationGroup[];
  onChange: (groups: SpecificationGroup[]) => void;
}

export function SpecificationEditor({ groups, onChange }: SpecificationEditorProps) {
  if (groups.length === 0) return null;

  function handleGroupChange(updated: SpecificationGroup) {
    onChange(groups.map((g) => (g.id === updated.id ? updated : g)));
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
        Thông số kỹ thuật
      </h2>
      {groups.map((group) => (
        <SpecificationGroupEditor
          key={group.id}
          group={group}
          onChange={handleGroupChange}
        />
      ))}
    </div>
  );
}
