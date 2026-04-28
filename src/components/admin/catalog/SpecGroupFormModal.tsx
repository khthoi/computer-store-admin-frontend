"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Button } from "@/src/components/ui/Button";
import type { SpecGroup, SpecGroupFormData } from "@/src/types/spec_group.types";

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SpecGroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** When provided, the modal is in edit mode; otherwise create mode */
  editTarget?: SpecGroup | null;
  onSubmit: (data: SpecGroupFormData) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpecGroupFormModal({
  isOpen,
  onClose,
  editTarget,
  onSubmit,
}: SpecGroupFormModalProps) {
  const isEdit = !!editTarget;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (editTarget) {
      setName(editTarget.name);
      setDescription(editTarget.description);
    } else {
      setName("");
      setDescription("");
    }
    setNameError("");
  }, [isOpen, editTarget]);

  async function handleSubmit() {
    if (!name.trim()) {
      setNameError("Tên nhóm thuộc tính là bắt buộc");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Sửa nhóm thuộc tính` : "Thêm nhóm thuộc tính"}
      size="xl"
      animated
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo nhóm"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Tên nhóm thuộc tính"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setNameError("");
          }}
          placeholder="VD: Hiệu năng GPU"
          required
          errorMessage={nameError || undefined}
          autoFocus
        />

        <Textarea
          label="Mô tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả ngắn về nhóm thuộc tính này..."
          rows={3}
          showCharCount
          maxCharCount={250}
        />

      </div>
    </Modal>
  );
}
