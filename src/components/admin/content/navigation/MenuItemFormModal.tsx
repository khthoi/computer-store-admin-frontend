"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { addMenuItem, updateMenuItem } from "@/src/services/content.service";
import type { MenuItem, MenuItemFormData, MenuItemType } from "@/src/types/content.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MenuItemFormModalProps {
  menuId: string;
  item?: MenuItem | null;
  onClose: () => void;
  onSaved: (item: MenuItem) => void;
}

// ─── Options ──────────────────────────────────────────────────────────────────

const TYPE_OPTIONS = [
  { value: "link",     label: "Liên kết tùy chỉnh", description: "URL bất kỳ, nội bộ hoặc ngoài" },
  { value: "page",     label: "Trang tĩnh",          description: "Trang nội dung của website" },
  { value: "category", label: "Danh mục sản phẩm",   description: "URL tự sinh theo cây danh mục" },
];

const URL_HINT: Record<string, string> = {
  link:     "/promotions hoặc https://example.com",
  page:     "/chinh-sach-bao-hanh",
  category: "/products/linh-kien-may-tinh/gpu",
};

const URL_HELPER: Record<string, string> = {
  category: "Cấu trúc: /products/{slug-cha}/{slug-con}/{slug-chắt}",
};

// ─── Default ──────────────────────────────────────────────────────────────────

const DEFAULT: MenuItemFormData = {
  parentId: null, type: "link", label: "", url: "",
  target: "_self", sortOrder: 1, isVisible: true,
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MenuItemFormModal({ menuId, item, onClose, onSaved }: MenuItemFormModalProps) {
  const [form, setForm] = useState<MenuItemFormData>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof MenuItemFormData, string>>>({});

  useEffect(() => {
    if (item) {
      setForm({
        parentId: null,
        type: item.type as MenuItemType,
        label: item.label,
        url: item.url ?? "",
        target: item.target,
        sortOrder: item.sortOrder,
        isVisible: item.isVisible,
      });
    } else {
      setForm(DEFAULT);
    }
    setErrors({});
  }, [item]);

  function set<K extends keyof MenuItemFormData>(key: K, value: MenuItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const errs: typeof errors = {};
    if (!form.label.trim()) errs.label = "Nhãn không được để trống";
    if (!form.url?.trim()) errs.url = "URL không được để trống";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = item
        ? await updateMenuItem(menuId, item.id, form)
        : await addMenuItem(menuId, form);
      onSaved(saved);
      onClose();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={item ? "Chỉnh sửa mục" : "Thêm mục menu"}
      size="md"
      animated
    >
      <div className="p-5 space-y-4">
        <Select
          label="Loại mục"
          required
          value={form.type}
          onChange={(v) => set("type", v as MenuItemType)}
          options={TYPE_OPTIONS}
        />

        <Input
          label="Nhãn hiển thị"
          required
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          placeholder="VD: Laptop, Khuyến mãi, GPU…"
          errorMessage={errors.label}
        />

        <Input
          label="URL"
          required
          value={form.url ?? ""}
          onChange={(e) => set("url", e.target.value)}
          placeholder={URL_HINT[form.type] ?? URL_HINT.link}
          helperText={URL_HELPER[form.type]}
          errorMessage={errors.url}
        />

        <div className="flex flex-col gap-2.5 rounded-lg border border-secondary-100 bg-secondary-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.target === "_blank"}
              onChange={(e) => set("target", e.target.checked ? "_blank" : "_self")}
            />
            <span className="text-sm text-secondary-700">Mở trong tab mới</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              checked={form.isVisible}
              onChange={(e) => set("isVisible", e.target.checked)}
            />
            <span className="text-sm text-secondary-700">Hiển thị</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-secondary-100 px-5 py-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          {item ? "Lưu thay đổi" : "Thêm mục"}
        </Button>
      </div>
    </Modal>
  );
}
