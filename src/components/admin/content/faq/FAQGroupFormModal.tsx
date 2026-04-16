"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Textarea } from "@/src/components/ui/Textarea";
import { Toggle } from "@/src/components/ui/Toggle";
import { createFAQGroup, updateFAQGroup } from "@/src/services/content.service";
import type { FAQGroup, FAQGroupFormData } from "@/src/types/content.types";

export interface FAQGroupFormModalProps {
  group?: FAQGroup | null;
  onClose: () => void;
  onSaved: (group: FAQGroup) => void;
}

const DEFAULT: FAQGroupFormData = {
  name: "", slug: "", description: "", sortOrder: 0, isVisible: true,
};

function toSlug(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

export function FAQGroupFormModal({ group, onClose, onSaved }: FAQGroupFormModalProps) {
  const [form, setForm] = useState<FAQGroupFormData>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FAQGroupFormData, string>>>({});
  const [slugManual, setSlugManual] = useState(false);

  useEffect(() => {
    if (group) {
      setForm({
        name: group.name, slug: group.slug,
        description: group.description, sortOrder: group.sortOrder, isVisible: group.isVisible,
      });
      setSlugManual(true);
    } else {
      setForm(DEFAULT);
      setSlugManual(false);
    }
    setErrors({});
  }, [group]);

  function set<K extends keyof FAQGroupFormData>(key: K, value: FAQGroupFormData[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugManual) next.slug = toSlug(value as string);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = "Tên nhóm không được để trống";
    if (!form.slug.trim()) errs.slug = "Slug không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = group ? await updateFAQGroup(group.id, form) : await createFAQGroup(form);
      onSaved(saved);
      onClose();
    } finally { setIsSaving(false); }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={group ? "Chỉnh sửa nhóm FAQ" : "Thêm nhóm FAQ"} size="xl" animated>
      <div className="p-5 space-y-4">
        <Input
          label="Tên nhóm *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ví dụ: Đặt hàng & Thanh toán"
          errorMessage={errors.name}
        />
        <Input
          label="Slug"
          value={form.slug}
          onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
          errorMessage={errors.slug}
          prefixIcon={<span className="text-xs text-secondary-400">faq/</span>}
        />
        <Textarea
          label="Mô tả"
          value={form.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="Mô tả ngắn về nhóm câu hỏi này"
          showCharCount
          maxCharCount={250}
        />
        <Toggle
          label="Hiển thị"
          checked={form.isVisible}
          onChange={(e) => set("isVisible", e.target.checked)}
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-secondary-100 px-5 py-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} isLoading={isSaving}>{group ? "Lưu" : "Tạo nhóm"}</Button>
      </div>
    </Modal>
  );
}
