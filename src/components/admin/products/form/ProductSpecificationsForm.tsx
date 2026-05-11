"use client";

import { useRef, useState } from "react";
import {
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import { Accordion } from "@/src/components/ui/Accordion";
import type { AccordionItemDef } from "@/src/components/ui/Accordion";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpecRow {
  id: string;
  group: string;
  key: string;
  value: string;
}

export interface ProductSpecificationsFormProps {
  specs: SpecRow[];
  onChange: (specs: SpecRow[]) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function groupSpecs(specs: SpecRow[]): Record<string, SpecRow[]> {
  const groups: Record<string, SpecRow[]> = {};
  for (const spec of specs) {
    if (!groups[spec.group]) groups[spec.group] = [];
    groups[spec.group].push(spec);
  }
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductSpecificationsForm({
  specs,
  onChange,
}: ProductSpecificationsFormProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const newGroupInputRef = useRef<HTMLInputElement>(null);

  // ── Spec row operations ──────────────────────────────────────────────────

  function updateSpec(id: string, patch: Partial<SpecRow>) {
    onChange(specs.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function deleteSpec(id: string) {
    onChange(specs.filter((s) => s.id !== id));
  }

  function addSpecToGroup(group: string) {
    onChange([
      ...specs,
      { id: generateId(), group, key: "", value: "" },
    ]);
  }

  function moveSpec(id: string, direction: "up" | "down") {
    const idx = specs.findIndex((s) => s.id === id);
    if (idx < 0) return;
    // Only move within the same group
    const group = specs[idx].group;
    const groupSpecs = specs.filter((s) => s.group === group);
    const groupIdx = groupSpecs.findIndex((s) => s.id === id);

    if (direction === "up" && groupIdx === 0) return;
    if (direction === "down" && groupIdx === groupSpecs.length - 1) return;

    // Swap in the full list
    const swapWith =
      direction === "up"
        ? groupSpecs[groupIdx - 1]
        : groupSpecs[groupIdx + 1];

    const next = [...specs];
    const aIdx = next.findIndex((s) => s.id === id);
    const bIdx = next.findIndex((s) => s.id === swapWith.id);
    [next[aIdx], next[bIdx]] = [next[bIdx], next[aIdx]];
    onChange(next);
  }

  // ── Group operations ──────────────────────────────────────────────────────

  function addGroup(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    // Add a starter row for the new group
    onChange([
      ...specs,
      { id: generateId(), group: trimmed, key: "", value: "" },
    ]);
    setNewGroupName("");
    setShowNewGroupInput(false);
  }

  // ── Build Accordion items ────────────────────────────────────────────────

  const grouped = groupSpecs(specs);
  const groupNames = Object.keys(grouped);

  const accordionItems: AccordionItemDef[] = groupNames.map((group) => {
    const rows = grouped[group];
    return {
      value: group,
      label: (
        <span className="font-medium">
          {group}{" "}
          <span className="text-xs font-normal text-secondary-400">
            ({rows.length})
          </span>
        </span>
      ),
      children: (
        <div className="space-y-2">
          {rows.map((spec) => (
            <div key={spec.id} className="flex items-center gap-2">
              {/* Up/Down */}
              <div className="flex flex-col gap-0.5 shrink-0">
                <button
                  type="button"
                  aria-label="Di chuyển lên"
                  onClick={() => moveSpec(spec.id, "up")}
                  className="p-0.5 rounded text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
                >
                  <ChevronUpIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Di chuyển xuống"
                  onClick={() => moveSpec(spec.id, "down")}
                  className="p-0.5 rounded text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 transition-colors"
                >
                  <ChevronDownIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Key */}
              <div className="flex-1 min-w-0">
                <Input
                  size="sm"
                  value={spec.key}
                  onChange={(e) =>
                    updateSpec(spec.id, { key: e.target.value })
                  }
                  placeholder="Thuộc tính…"
                />
              </div>

              {/* Value */}
              <div className="flex-1 min-w-0">
                <Input
                  size="sm"
                  value={spec.value}
                  onChange={(e) =>
                    updateSpec(spec.id, { value: e.target.value })
                  }
                  placeholder="Giá trị…"
                />
              </div>

              {/* Delete */}
              <button
                type="button"
                aria-label="Xóa thuộc tính"
                onClick={() => deleteSpec(spec.id)}
                className="shrink-0 p-1.5 rounded text-secondary-400 hover:text-error-600 hover:bg-error-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add row to group */}
          <button
            type="button"
            onClick={() => addSpecToGroup(group)}
            className="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Thêm thuộc tính
          </button>
        </div>
      ),
    };
  });

  return (
    <div className="space-y-4">
      {/* Accordion of groups */}
      {accordionItems.length > 0 ? (
        <Accordion items={accordionItems} multiple variant="separated" />
      ) : (
        <p className="text-sm text-secondary-400">
          Chưa có nhóm thông số nào. Nhấn "Thêm nhóm" để bắt đầu.
        </p>
      )}

      {/* Add new group */}
      {showNewGroupInput ? (
        <div className="flex items-end gap-2 pt-2">
          <div className="flex-1">
            <Input
              ref={newGroupInputRef}
              label="Tên nhóm mới"
              size="sm"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addGroup(newGroupName);
                }
                if (e.key === "Escape") {
                  setShowNewGroupInput(false);
                  setNewGroupName("");
                }
              }}
              placeholder="VD: Thông số kỹ thuật, Kết nối…"
              autoFocus
            />
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => addGroup(newGroupName)}
            disabled={!newGroupName.trim()}
          >
            Thêm
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowNewGroupInput(false);
              setNewGroupName("");
            }}
          >
            Hủy
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<PlusIcon />}
          onClick={() => {
            setShowNewGroupInput(true);
            setTimeout(() => newGroupInputRef.current?.focus(), 50);
          }}
        >
          Thêm nhóm
        </Button>
      )}
    </div>
  );
}
