"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlassIcon, PlusIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Button } from "@/src/components/ui/Button";
import type { SpecGroup } from "@/src/types/spec_group.types";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecGroupPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** All available spec groups */
  allGroups: SpecGroup[];
  /** IDs of groups already directly assigned or inherited — shown as disabled */
  assignedGroupIds: Set<string>;
  /** Called when the user confirms selection — receives all selected group IDs */
  onAssign: (specGroupIds: string[]) => Promise<void>;
  /** Called when user clicks "Create new group" — opens the form modal */
  onCreateNew: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpecGroupPickerModal({
  isOpen,
  onClose,
  allGroups,
  assignedGroupIds,
  onAssign,
  onCreateNew,
}: SpecGroupPickerModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assigning, setAssigning] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allGroups;
    return allGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [allGroups, query]);

  function handleClose() {
    setQuery("");
    setSelectedIds(new Set());
    onClose();
  }

  function toggleId(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleConfirm() {
    if (selectedIds.size === 0) return;
    setAssigning(true);
    try {
      await onAssign(Array.from(selectedIds));
      handleClose();
    } finally {
      setAssigning(false);
    }
  }

  function handleCreateNew() {
    handleClose();
    onCreateNew();
  }

  const confirmLabel = assigning
    ? "Đang thêm..."
    : selectedIds.size > 1
      ? `Thêm ${selectedIds.size} nhóm`
      : "Thêm nhóm";

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Thêm nhóm thuộc tính"
      size="xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={handleClose} disabled={assigning}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={selectedIds.size === 0 || assigning}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Search */}
        <Input
          placeholder="Tìm nhóm thuộc tính..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          prefixIcon={<MagnifyingGlassIcon className="w-4 h-4 text-secondary-400" />}
          autoFocus
        />

        {/* Selection count hint */}
        {selectedIds.size > 0 && (
          <p className="text-xs text-primary-600 font-medium">
            Đã chọn {selectedIds.size} nhóm
          </p>
        )}

        {/* List */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-secondary-200 divide-y divide-secondary-100">
          {filtered.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-1 text-secondary-400 text-sm">
              <p>Không tìm thấy nhóm nào</p>
            </div>
          ) : (
            filtered.map((group) => {
              const isAssigned = assignedGroupIds.has(group.id);
              const isSelected = selectedIds.has(group.id);

              return (
                <button
                  key={group.id}
                  type="button"
                  disabled={isAssigned}
                  onClick={() => toggleId(group.id)}
                  className={[
                    "w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors",
                    isAssigned
                      ? "opacity-40 cursor-not-allowed bg-secondary-50"
                      : isSelected
                        ? "bg-primary-50"
                        : "hover:bg-secondary-50",
                  ].join(" ")}
                >
                  {/* Checkbox indicator */}
                  <span
                    className={[
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      isSelected
                        ? "border-primary-600 bg-primary-600"
                        : "border-secondary-300",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <CheckIcon className="w-2.5 h-2.5 text-white stroke-[3]" />
                    )}
                  </span>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={[
                        "text-sm font-medium truncate",
                        isSelected ? "text-primary-700" : "text-secondary-800",
                      ].join(" ")}
                    >
                      {group.name}
                      {isAssigned && (
                        <span className="ml-2 text-xs font-normal text-secondary-400">
                          (đã thêm)
                        </span>
                      )}
                    </p>
                    {group.description && (
                      <p className="text-xs text-secondary-400 truncate mt-0.5">
                        {group.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Create new */}
        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium py-1"
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" />
          Tạo nhóm thuộc tính mới
        </button>
      </div>
    </Modal>
  );
}
