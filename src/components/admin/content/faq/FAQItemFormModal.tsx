"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Toggle } from "@/src/components/ui/Toggle";
import { Select } from "@/src/components/ui/Select";
import { RichTextEditor } from "@/src/components/editor/DynamicRichTextEditor";
import { createFAQItem, updateFAQItem } from "@/src/services/content.service";
import type { FAQItem, FAQItemFormData, FAQGroup } from "@/src/types/content.types";

export interface FAQItemFormModalProps {
  item?: FAQItem | null;
  groups: FAQGroup[];
  defaultGroupId?: string;
  defaultSortOrder?: number;
  onClose: () => void;
  onSaved: (item: FAQItem) => void;
}

export function FAQItemFormModal({
  item, groups, defaultGroupId, defaultSortOrder = 1, onClose, onSaved,
}: FAQItemFormModalProps) {
  const [form, setForm] = useState<FAQItemFormData>({
    groupId: defaultGroupId ?? groups[0]?.id ?? "",
    question: "", answer: "",
    sortOrder: defaultSortOrder,
    isVisible: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FAQItemFormData, string>>>({});

  useEffect(() => {
    if (item) {
      setForm({
        groupId: item.groupId, question: item.question,
        answer: item.answer, sortOrder: item.sortOrder, isVisible: item.isVisible,
      });
    } else {
      setForm({
        groupId: defaultGroupId ?? groups[0]?.id ?? "",
        question: "", answer: "",
        sortOrder: defaultSortOrder,
        isVisible: true,
      });
    }
    setErrors({});
  }, [item, defaultGroupId, defaultSortOrder, groups]);

  function set<K extends keyof FAQItemFormData>(key: K, value: FAQItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.question.trim()) errs.question = "Câu hỏi không được để trống";
    if (!form.answer.trim()) errs.answer = "Câu trả lời không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = item ? await updateFAQItem(item.id, form) : await createFAQItem(form);
      onSaved(saved);
      onClose();
    } finally { setIsSaving(false); }
  }

  // Build options with slug as description
  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: g.name,
    description: g.slug,
  }));

  return (
    <Modal isOpen={true} onClose={onClose} title={item ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"} size="4xl" animated>
      <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4">
        {/* Group selector — UI Select with slug description + boldLabel */}
        <Select
          label="Nhóm câu hỏi"
          options={groupOptions}
          value={form.groupId}
          onChange={(v) => set("groupId", Array.isArray(v) ? v[0] : v)}
          boldLabel
          searchable
        />

        {/* Question */}
        <Input
          label="Câu hỏi *"
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          placeholder="Nhập câu hỏi thường gặp"
          errorMessage={errors.question}
        />

        {/* Answer */}
        <RichTextEditor
          label="Câu trả lời *"
          value={form.answer}
          onChange={(html) => set("answer", html)}
          placeholder="Viết câu trả lời chi tiết..."
          minHeight={200}
          errorMessage={errors.answer}
        />

        {/* Visibility */}
        <Toggle
          label="Hiển thị"
          checked={form.isVisible}
          onChange={(e) => set("isVisible", e.target.checked)}
        />
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-secondary-100 px-5 py-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} isLoading={isSaving}>{item ? "Lưu" : "Thêm câu hỏi"}</Button>
      </div>
    </Modal>
  );
}
