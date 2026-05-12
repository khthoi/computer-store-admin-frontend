"use client";

import { useEffect, useState } from "react";
import { CategoryTreeSelect, buildBreadcrumb } from "@/src/components/admin/CategoryTreeSelect";
import type { CategoryNode } from "@/src/components/admin/CategoryTreeSelect";
import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/Input";
import { Select } from "@/src/components/ui/Select";
import { Toggle } from "@/src/components/ui/Toggle";
import { useToast } from "@/src/components/ui/Toast";
import { getAdminCategoryNodeTree } from "@/src/services/category.service";
import { addMenuItem, updateMenuItem } from "@/src/services/content.service";
import type { MenuItem, MenuItemFormData, MenuItemType } from "@/src/types/content.types";

export interface MenuItemFormModalProps {
  menuId: string;
  item?: MenuItem | null;
  nextSortOrder?: number;
  onClose: () => void;
  onSaved: (item: MenuItem) => void;
}

const TYPE_OPTIONS = [
  { value: "link", label: "Liên kết tùy chỉnh", description: "URL bất kỳ, nội bộ hoặc ngoài" },
  { value: "page", label: "Trang tĩnh", description: "Trang nội dung của website" },
  { value: "category", label: "Danh mục sản phẩm", description: "URL tự sinh theo cây danh mục" },
];

const URL_HINT: Record<string, string> = {
  link: "/promotions hoặc https://example.com",
  page: "/chinh-sach-bao-hanh",
  category: "/products/linh-kien-may-tinh/gpu",
};

const URL_HELPER: Record<string, string> = {
  category: "Cấu trúc: /products/{slug-cha}/{slug-con}/{slug-chắt}",
};

const DEFAULT: MenuItemFormData = {
  parentId: null,
  type: "link",
  label: "",
  url: "",
  target: "_self",
  sortOrder: 1,
  isVisible: true,
};

type FormErrors = Partial<Record<keyof MenuItemFormData | "categoryId", string>>;

function buildCategoryUrl(categoryId: string, categories: CategoryNode[]) {
  const breadcrumb = buildBreadcrumb(categoryId, categories) ?? [];
  const slugPath = breadcrumb
    .map((node) => node.slug?.trim())
    .filter((slug): slug is string => Boolean(slug));

  return slugPath.length > 0 ? `/products/${slugPath.join("/")}` : "";
}

function findCategoryIdByUrl(url: string | undefined, categories: CategoryNode[]): string {
  const normalizedUrl = (url ?? "").trim().replace(/\/+$/, "");
  if (!normalizedUrl) return "";

  const stack = [...categories];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;

    if (buildCategoryUrl(node.id, categories) === normalizedUrl) {
      return node.id;
    }

    if (node.children?.length) {
      stack.push(...node.children);
    }
  }

  return "";
}

export function MenuItemFormModal({ menuId, item, nextSortOrder, onClose, onSaved }: MenuItemFormModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState<MenuItemFormData>(DEFAULT);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  useEffect(() => {
    getAdminCategoryNodeTree().then(setCategoryTree).catch(() => setCategoryTree([]));
  }, []);

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
      setForm({ ...DEFAULT, sortOrder: nextSortOrder ?? 1 });
    }

    setSelectedCategoryId("");
    setErrors({});
  }, [item, nextSortOrder]);

  useEffect(() => {
    if (form.type !== "category" || categoryTree.length === 0 || selectedCategoryId) return;
    setSelectedCategoryId(findCategoryIdByUrl(form.url, categoryTree));
  }, [form.type, form.url, categoryTree, selectedCategoryId]);

  function set<K extends keyof MenuItemFormData>(key: K, value: MenuItemFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const nextErrors: FormErrors = {};

    if (!form.label.trim()) nextErrors.label = "Nhãn không được để trống";
    if (form.type === "category") {
      if (!selectedCategoryId) nextErrors.categoryId = "Vui lòng chọn danh mục sản phẩm";
      if (!form.url?.trim()) nextErrors.url = "Không thể tự sinh URL cho danh mục đã chọn";
    } else if (!form.url?.trim()) {
      nextErrors.url = "URL không được để trống";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
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
      showToast(item ? "Đã cập nhật mục menu" : "Đã thêm mục menu", "success");
    } catch {
      showToast("Lưu thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={item ? "Chỉnh sửa mục" : "Thêm mục menu"}
      size="3xl"
      animated
    >
      <div className="space-y-4 p-5">
        <Select
          label="Loại mục"
          required
          value={form.type}
          onChange={(value) => {
            const nextType = value as MenuItemType;
            set("type", nextType);

            if (nextType !== "category") {
              setSelectedCategoryId("");
              return;
            }

            if (selectedCategoryId) {
              set("url", buildCategoryUrl(selectedCategoryId, categoryTree));
              return;
            }

            const matchedCategoryId = findCategoryIdByUrl(form.url, categoryTree);
            setSelectedCategoryId(matchedCategoryId);
            set("url", matchedCategoryId ? buildCategoryUrl(matchedCategoryId, categoryTree) : "");
          }}
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

        {form.type === "category" ? (
          <>
            <CategoryTreeSelect
              label="Danh mục sản phẩm"
              required
              categories={categoryTree}
              value={selectedCategoryId || undefined}
              placeholder="Chọn danh mục để tự sinh URL…"
              helperText="URL sẽ tự sinh theo đúng cây danh mục đã chọn"
              errorMessage={errors.categoryId}
              onChange={(id) => {
                const nextId = id.trim();
                setSelectedCategoryId(nextId);
                set("url", nextId ? buildCategoryUrl(nextId, categoryTree) : "");
                setErrors((prev) => ({ ...prev, categoryId: undefined, url: undefined }));
              }}
            />

            <Input
              label="URL"
              required
              value={form.url ?? ""}
              onChange={() => undefined}
              placeholder={URL_HINT.category}
              helperText={URL_HELPER.category}
              errorMessage={errors.url}
              disabled
            />
          </>
        ) : (
          <Input
            label="URL"
            required
            value={form.url ?? ""}
            onChange={(e) => set("url", e.target.value)}
            placeholder={URL_HINT[form.type] ?? URL_HINT.link}
            helperText={URL_HELPER[form.type]}
            errorMessage={errors.url}
          />
        )}

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
        <Button variant="ghost" onClick={onClose}>
          Hủy
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          {item ? "Lưu thay đổi" : "Thêm mục"}
        </Button>
      </div>
    </Modal>
  );
}
