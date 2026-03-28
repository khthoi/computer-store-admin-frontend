"use client";

import { useState, useCallback, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import {
  CategoryTreeView,
  type CategoryNode,
} from "@/src/components/admin/catalog/CategoryTreeView";
import {
  CategoryFormModal,
  type CategoryFormData,
} from "@/src/components/admin/catalog/CategoryFormModal";
import { SpecGroupPanel } from "@/src/components/admin/catalog/SpecGroupPanel";
import { SpecGroupEditor } from "@/src/components/admin/catalog/SpecGroupEditor";
import { SpecGroupFormModal } from "@/src/components/admin/catalog/SpecGroupFormModal";
import { SpecGroupPickerModal } from "@/src/components/admin/catalog/SpecGroupPickerModal";
import type { DanhMuc, DanhMucNode } from "@/src/types/category.types";
import type {
  SpecGroup,
  SpecGroupFormData,
  SpecType,
  SpecTypeFormData,
  CategorySpecGroupsView,
  EffectiveSpecGroup,
} from "@/src/types/spec_group.types";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/src/services/category.service";
import {
  getSpecGroups,
  createSpecGroup,
  updateSpecGroup,
  addSpecType,
  updateSpecType,
  deleteSpecType,
  reorderSpecTypes,
} from "@/src/services/spec_group.service";
import {
  getCategorySpecGroupsView,
  assignSpecGroup,
  removeSpecGroupAssignment,
  reorderSpecGroupsForCategory,
} from "@/src/services/category_spec.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toTreeNode(node: DanhMucNode): CategoryNode {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    productCount: node.productCount,
    children: node.children?.map(toTreeNode),
  };
}

function toFormData(cat: DanhMuc): Partial<CategoryFormData> {
  return {
    name: cat.name,
    slug: cat.slug,
    parentId: cat.parentId ?? undefined,
    description: cat.description,
    displayOrder: cat.displayOrder,
    active: cat.active,
  };
}

function collectDescendantIds(node: DanhMucNode): Set<string> {
  const ids = new Set<string>([node.id]);
  node.children?.forEach((child) => {
    collectDescendantIds(child).forEach((id) => ids.add(id));
  });
  return ids;
}

function buildParentOptions(
  nodes: DanhMucNode[],
  excludeIds: Set<string>,
  depth = 0
): { value: string; label: string }[] {
  const prefix = depth > 0 ? "└" + "─".repeat(depth) + " " : "";
  return nodes.flatMap((node) => {
    if (excludeIds.has(node.id)) return [];
    return [
      { value: node.id, label: prefix + node.name },
      ...buildParentOptions(node.children ?? [], excludeIds, depth + 1),
    ];
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoriesPageClientProps {
  initialTree: DanhMucNode[];
  initialFlat: DanhMuc[];
  initialAllSpecGroups: SpecGroup[];
}

// ─── Empty spec view ──────────────────────────────────────────────────────────

const EMPTY_SPEC_VIEW: CategorySpecGroupsView = {
  directIncludes: [],
  inheritedIncludes: [],
  directExcludes: [],
};

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoriesPageClient({
  initialTree,
  initialFlat,
  initialAllSpecGroups,
}: CategoriesPageClientProps) {
  const { showToast } = useToast();

  // ── Category tree state ────────────────────────────────────────────────────
  const [tree, setTree] = useState<DanhMucNode[]>(initialTree);
  const [flat, setFlat] = useState<DanhMuc[]>(initialFlat);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // ── Selection ──────────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSpecGroupId, setSelectedSpecGroupId] = useState<string | null>(null);

  // ── Spec group view for selected category ─────────────────────────────────
  const [specView, setSpecView] = useState<CategorySpecGroupsView>(EMPTY_SPEC_VIEW);
  const [specViewLoading, setSpecViewLoading] = useState(false);

  // ── All spec groups (for picker) ──────────────────────────────────────────
  const [allSpecGroups, setAllSpecGroups] = useState<SpecGroup[]>(initialAllSpecGroups);

  // ── Spec group form modal ─────────────────────────────────────────────────
  const [specGroupFormOpen, setSpecGroupFormOpen] = useState(false);
  const [editingSpecGroup, setEditingSpecGroup] = useState<SpecGroup | null>(null);

  // ── Spec group picker modal ───────────────────────────────────────────────
  const [specPickerOpen, setSpecPickerOpen] = useState(false);

  // ── Local spec types per group (optimistic) ───────────────────────────────
  const [localSpecTypes, setLocalSpecTypes] = useState<Map<string, SpecType[]>>(new Map());

  // ── Derived ───────────────────────────────────────────────────────────────
  const editingCat = editingCategoryId ? flat.find((c) => c.id === editingCategoryId) : null;

  const selectedCategory = selectedCategoryId
    ? flat.find((c) => c.id === selectedCategoryId)
    : null;

  const selectedSpecGroup: EffectiveSpecGroup | null = selectedSpecGroupId
    ? ([...specView.directIncludes, ...specView.inheritedIncludes].find(
        (g) => g.id === selectedSpecGroupId
      ) ?? null)
    : null;

  const assignedGroupIds = new Set<string>([
    ...specView.directIncludes.map((g) => g.id),
    ...specView.inheritedIncludes.map((g) => g.id),
  ]);

  // ── Load spec view when category selected ─────────────────────────────────
  useEffect(() => {
    if (!selectedCategoryId) {
      setSpecView(EMPTY_SPEC_VIEW);
      setSelectedSpecGroupId(null);
      return;
    }
    setSpecViewLoading(true);
    getCategorySpecGroupsView(selectedCategoryId)
      .then((view) => {
        setSpecView(view);
        setSelectedSpecGroupId(null);
      })
      .catch(() => showToast("Không thể tải nhóm thuộc tính.", "error"))
      .finally(() => setSpecViewLoading(false));
  }, [selectedCategoryId]);

  async function reloadSpecView() {
    if (!selectedCategoryId) return;
    setSpecViewLoading(true);
    try {
      const view = await getCategorySpecGroupsView(selectedCategoryId);
      setSpecView(view);
    } catch {
      showToast("Không thể tải nhóm thuộc tính.", "error");
    } finally {
      setSpecViewLoading(false);
    }
  }

  // ── Category tree helpers ──────────────────────────────────────────────────

  function findNode(nodes: DanhMucNode[], id: string): DanhMucNode | null {
    for (const node of nodes) {
      if (node.id === id) return node;
      const found = findNode(node.children ?? [], id);
      if (found) return found;
    }
    return null;
  }

  const parentOptions = useCallback(() => {
    if (!editingCategoryId) return buildParentOptions(tree, new Set<string>());
    const editingNode = findNode(tree, editingCategoryId);
    const excluded = editingNode
      ? collectDescendantIds(editingNode)
      : new Set<string>([editingCategoryId]);
    return buildParentOptions(tree, excluded);
  }, [tree, editingCategoryId]);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  function handleOpenCreate() {
    setEditingCategoryId(null);
    setCategoryModalOpen(true);
  }

  function handleOpenEditCategory(id: string) {
    setEditingCategoryId(id);
    setCategoryModalOpen(true);
  }

  async function handleSaveCategory(data: CategoryFormData) {
    setIsSavingCategory(true);
    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, data);
        showToast("Đã cập nhật danh mục.", "success");
      } else {
        await createCategory(data);
        showToast("Đã thêm danh mục.", "success");
      }
      setCategoryModalOpen(false);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    try {
      await deleteCategory(id);
      setFlat((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      showToast("Đã xóa danh mục.", "success");
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  }

  async function handleReorderCategories(parentId: string | null, newOrder: CategoryNode[]) {
    const orderedIds = newOrder.map((n) => n.id);

    function reorderInTree(nodes: DanhMucNode[]): DanhMucNode[] {
      if (parentId === null) {
        const map = new Map(nodes.map((n) => [n.id, n]));
        return orderedIds.map((id) => map.get(id)!).filter(Boolean);
      }
      return nodes.map((node) => {
        if (node.id === parentId) {
          const map = new Map((node.children ?? []).map((n) => [n.id, n]));
          return {
            ...node,
            children: orderedIds.map((id) => map.get(id)!).filter(Boolean),
          };
        }
        return { ...node, children: reorderInTree(node.children ?? []) };
      });
    }

    setTree((prev) => reorderInTree(prev));
    try {
      await reorderCategories(parentId, orderedIds);
    } catch {
      showToast("Không thể lưu thứ tự. Vui lòng thử lại.", "error");
    }
  }

  // ── Spec group assignment ──────────────────────────────────────────────────

  async function handleAssignSpecGroup(specGroupId: string) {
    if (!selectedCategoryId) return;
    await assignSpecGroup(selectedCategoryId, specGroupId, "include");
    showToast("Đã thêm nhóm thuộc tính.", "success");
    await reloadSpecView();
  }

  async function handleRemoveDirect(specGroupId: string) {
    if (!selectedCategoryId) return;
    await removeSpecGroupAssignment(selectedCategoryId, specGroupId);
    if (selectedSpecGroupId === specGroupId) setSelectedSpecGroupId(null);
    showToast("Đã gỡ nhóm thuộc tính.", "success");
    await reloadSpecView();
  }

  async function handleSuppressInherited(specGroupId: string) {
    if (!selectedCategoryId) return;
    await assignSpecGroup(selectedCategoryId, specGroupId, "exclude");
    if (selectedSpecGroupId === specGroupId) setSelectedSpecGroupId(null);
    showToast("Đã ẩn nhóm kế thừa.", "success");
    await reloadSpecView();
  }

  async function handleRestoreExcluded(specGroupId: string) {
    if (!selectedCategoryId) return;
    await removeSpecGroupAssignment(selectedCategoryId, specGroupId);
    showToast("Đã khôi phục kế thừa.", "success");
    await reloadSpecView();
  }

  async function handleReorderDirectGroups(orderedIds: string[]) {
    if (!selectedCategoryId) return;
    await reorderSpecGroupsForCategory(selectedCategoryId, orderedIds);
  }

  // ── Spec group form (create / edit) ───────────────────────────────────────

  function handleOpenCreateSpecGroup() {
    setEditingSpecGroup(null);
    setSpecGroupFormOpen(true);
  }

  async function handleSaveSpecGroup(data: SpecGroupFormData) {
    if (editingSpecGroup) {
      const updated = await updateSpecGroup(editingSpecGroup.id, data);
      setAllSpecGroups((prev) =>
        prev.map((g) => (g.id === updated.id ? updated : g))
      );
      showToast("Đã cập nhật nhóm thuộc tính.", "success");
      await reloadSpecView();
    } else {
      const created = await createSpecGroup(data);
      setAllSpecGroups((prev) => [...prev, created]);
      showToast("Đã tạo nhóm thuộc tính.", "success");
      // Optionally refresh allSpecGroups from server
      const refreshed = await getSpecGroups();
      setAllSpecGroups(refreshed);
    }
  }

  // ── Spec type CRUD (Panel 3) ──────────────────────────────────────────────

  function getLocalSpecTypes(groupId: string, fallback: SpecType[]): SpecType[] {
    return localSpecTypes.get(groupId) ?? fallback;
  }

  function setGroupLocalSpecTypes(groupId: string, types: SpecType[]) {
    setLocalSpecTypes((prev) => new Map(prev).set(groupId, types));
  }

  async function handleUpdateGroupMeta(id: string, data: { name?: string; description?: string }) {
    await updateSpecGroup(id, data);
    showToast("Đã cập nhật nhóm.", "success");
    await reloadSpecView();
  }

  async function handleAddSpecType(groupId: string, data: SpecTypeFormData): Promise<SpecType> {
    const newType = await addSpecType(groupId, data);
    showToast("Đã thêm thuộc tính.", "success");
    return newType;
  }

  async function handleUpdateSpecType(id: string, data: Partial<SpecTypeFormData>) {
    await updateSpecType(id, data);
    showToast("Đã cập nhật thuộc tính.", "success");
  }

  async function handleDeleteSpecType(id: string) {
    await deleteSpecType(id);
    showToast("Đã xóa thuộc tính.", "success");
  }

  async function handleReorderSpecTypes(groupId: string, orderedIds: string[]) {
    await reorderSpecTypes(groupId, orderedIds);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const treeNodes = tree.map(toTreeNode);

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-secondary-100 bg-white">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Danh mục</h1>
          <p className="mt-0.5 text-sm text-secondary-500">
            Quản lý cây danh mục và thuộc tính kỹ thuật của sản phẩm.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <PlusIcon className="h-4 w-4 mr-1" aria-hidden="true" />
          Thêm danh mục
        </Button>
      </div>

      {/* Three-panel body */}
      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        {/* Panel 1 — Category tree */}
        <div className="w-100 shrink-0 overflow-y-auto">
          <CategoryTreeView
            categories={treeNodes}
            onEdit={handleOpenEditCategory}
            onDelete={handleDeleteCategory}
            onReorder={handleReorderCategories}
            selectedId={selectedCategoryId ?? undefined}
            onSelect={(id) => setSelectedCategoryId(id)}
          />
        </div>

        {/* Panel 2 — Spec group assignments */}
        <div className="w-100 shrink-0 overflow-hidden">
          {selectedCategory ? (
            <SpecGroupPanel
              categoryName={selectedCategory.name}
              view={specView}
              selectedSpecGroupId={selectedSpecGroupId}
              onSelectSpecGroup={setSelectedSpecGroupId}
              onAddGroup={() => setSpecPickerOpen(true)}
              onRemoveDirect={handleRemoveDirect}
              onSuppressInherited={handleSuppressInherited}
              onRestoreExcluded={handleRestoreExcluded}
              onReorderDirect={handleReorderDirectGroups}
              loading={specViewLoading}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-secondary-100 shadow-sm text-secondary-400 text-sm p-6 text-center">
              <p>Chọn một danh mục ở bên trái để xem và quản lý nhóm thuộc tính.</p>
            </div>
          )}
        </div>

        {/* Panel 3 — Spec group editor */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {selectedSpecGroup ? (
            <SpecGroupEditor
              group={selectedSpecGroup}
              onUpdateGroup={handleUpdateGroupMeta}
              onAddSpecType={handleAddSpecType}
              onUpdateSpecType={handleUpdateSpecType}
              onDeleteSpecType={handleDeleteSpecType}
              onReorderSpecTypes={handleReorderSpecTypes}
              localSpecTypes={getLocalSpecTypes(selectedSpecGroup.id, selectedSpecGroup.specTypes)}
              onSpecTypesChange={(types) => setGroupLocalSpecTypes(selectedSpecGroup.id, types)}
              onNavigateToCategory={(categoryId) => setSelectedCategoryId(categoryId)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-secondary-100 shadow-sm text-secondary-400 text-sm p-6 text-center">
              <p>
                {selectedCategory
                  ? "Chọn một nhóm thuộc tính ở bên cạnh để xem chi tiết."
                  : "Chọn danh mục và nhóm thuộc tính để bắt đầu."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Category form modal */}
      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCat ? toFormData(editingCat) : undefined}
        parentOptions={parentOptions()}
        isSaving={isSavingCategory}
      />

      {/* Spec group picker modal */}
      <SpecGroupPickerModal
        isOpen={specPickerOpen}
        onClose={() => setSpecPickerOpen(false)}
        allGroups={allSpecGroups}
        assignedGroupIds={assignedGroupIds}
        onAssign={handleAssignSpecGroup}
        onCreateNew={handleOpenCreateSpecGroup}
      />

      {/* Spec group form modal */}
      <SpecGroupFormModal
        isOpen={specGroupFormOpen}
        onClose={() => setSpecGroupFormOpen(false)}
        editTarget={editingSpecGroup}
        onSubmit={handleSaveSpecGroup}
      />
    </div>
  );
}
