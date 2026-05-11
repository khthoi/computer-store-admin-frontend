"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import { Checkbox } from "@/src/components/ui/Checkbox";
import {
  createRole,
  updateRole,
  getPermissions,
  type BackendPermission,
} from "@/src/services/role.service";
import type { VaiTro } from "@/src/types/role.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Provide to edit an existing role; omit to create a new one */
  role?: VaiTro | null;
  onSaved: (role: VaiTro) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RoleFormModal({ isOpen, onClose, role, onSaved }: RoleFormModalProps) {
  const isEdit = Boolean(role);

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    role?.permissions ?? []
  );
  const [nameError, setNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [allPerms, setAllPerms] = useState<BackendPermission[]>([]);
  const [permsLoading, setPermsLoading] = useState(true);

  // Reset form and fetch permissions when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setSelectedPermissions(role?.permissions ?? []);
    setNameError("");
    setPermsLoading(true);
    getPermissions()
      .then(setAllPerms)
      .finally(() => setPermsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, role?.id]);

  // Build permission groups from API data, grouped by module
  const permissionGroups = useMemo(() => {
    const groupMap = new Map<string, { maQuyen: string; tenQuyen: string }[]>();
    for (const p of allPerms) {
      if (!groupMap.has(p.module)) groupMap.set(p.module, []);
      groupMap.get(p.module)!.push({ maQuyen: p.maQuyen, tenQuyen: p.tenQuyen });
    }
    return Array.from(groupMap.entries()).map(([group, permissions]) => ({ group, permissions }));
  }, [allPerms]);

  const togglePermission = useCallback((perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  }, []);

  const toggleGroup = useCallback((groupCodes: string[]) => {
    const allSelected = groupCodes.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !groupCodes.includes(p)));
    } else {
      setSelectedPermissions((prev) => {
        const next = new Set(prev);
        groupCodes.forEach((p) => next.add(p));
        return Array.from(next);
      });
    }
  }, [selectedPermissions]);

  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError("Tên vai trò không được để trống.");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = isEdit && role
        ? await updateRole(
            role.id,
            { name: name.trim(), description: description.trim(), permissionCodes: selectedPermissions },
            allPerms,
          )
        : await createRole(
            { name: name.trim(), description: description.trim(), permissionCodes: selectedPermissions },
            allPerms,
          );
      onSaved(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, role, name, description, selectedPermissions, allPerms, onSaved, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Chỉnh sửa vai trò" : "Thêm vai trò mới"}
      size="xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Tạo vai trò"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Name */}
        <Input
          label="Tên vai trò"
          placeholder="VD: Quản lý kho"
          value={name}
          onChange={(e) => { setName(e.target.value); setNameError(""); }}
          errorMessage={nameError}
          required
        />

        {/* Description */}
        <Textarea
          label="Mô tả"
          placeholder="Mô tả ngắn về vai trò này và phạm vi quyền hạn…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        {/* Permissions */}
        <div>
          <p className="mb-3 text-sm font-medium text-secondary-700">
            Quyền hạn ({selectedPermissions.length} / {allPerms.length} đã chọn)
          </p>
          <div className="max-h-72 space-y-4 overflow-y-auto rounded-lg border border-secondary-200 p-4">
            {permsLoading ? (
              <div className="py-6 text-center text-sm text-secondary-500">Đang tải quyền hạn…</div>
            ) : (
              permissionGroups.map((group) => {
                const groupCodes = group.permissions.map((p) => p.maQuyen);
                const selectedCount = groupCodes.filter((c) => selectedPermissions.includes(c)).length;
                const allSelected = selectedCount === groupCodes.length;
                const someSelected = selectedCount > 0 && !allSelected;

                return (
                  <div key={group.group}>
                    {/* Group header with select-all */}
                    <div className="mb-2 flex items-center gap-2">
                      <Checkbox
                        size="sm"
                        checked={allSelected}
                        indeterminate={someSelected}
                        onChange={() => toggleGroup(groupCodes)}
                      />
                      <span className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
                        {group.group}
                      </span>
                    </div>
                    {/* Individual permissions */}
                    <div className="grid grid-cols-2 gap-1.5 pl-6">
                      {group.permissions.map((p) => (
                        <label
                          key={p.maQuyen}
                          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-secondary-50"
                        >
                          <Checkbox
                            size="sm"
                            checked={selectedPermissions.includes(p.maQuyen)}
                            onChange={() => togglePermission(p.maQuyen)}
                          />
                          <span className="text-xs text-secondary-700">{p.tenQuyen}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
