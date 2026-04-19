"use client";

import { useState, useMemo } from "react";
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
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
  /** Called when the user confirms selection of a group to assign */
  onAssign: (specGroupId: string) => Promise<void>;
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return allGroups;
    return allGroups.filter((g) => g.name.toLowerCase().includes(q));
  }, [allGroups, query]);

  function handleClose() {
    setQuery("");
    setSelectedId(null);
    onClose();
  }

  async function handleConfirm() {
    if (!selectedId) return;
    setAssigning(true);
    try {
      await onAssign(selectedId);
      handleClose();
    } finally {
      setAssigning(false);
    }
  }

  function handleCreateNew() {
    handleClose();
    onCreateNew();
  }

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
            disabled={!selectedId || assigning}
          >
            {assigning ? "Đang thêm..." : "Thêm nhóm"}
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

        {/* List */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-secondary-200 divide-y divide-secondary-100">
          {filtered.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-1 text-secondary-400 text-sm">
              <p>Không tìm thấy nhóm nào</p>
            </div>
          ) : (
            filtered.map((group) => {
              const isAssigned = assignedGroupIds.has(group.id);
              const isSelected = selectedId === group.id;

              return (
                <button
                  key={group.id}
                  type="button"
                  disabled={isAssigned}
                  onClick={() => setSelectedId(isSelected ? null : group.id)}
                  className={[
                    "w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors",
                    isAssigned
                      ? "opacity-40 cursor-not-allowed bg-secondary-50"
                      : isSelected
                        ? "bg-primary-50"
                        : "hover:bg-secondary-50",
                  ].join(" ")}
                >
                  {/* Selection indicator */}
                  <span
                    className={[
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-primary-600 bg-primary-600"
                        : "border-secondary-300",
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
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
