"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  GlobeAltIcon,
  ArchiveBoxIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { DataTable, type SortDir } from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import {
  deleteProduct,
  deleteVariant,
  bulkUpdateStatus,
  bulkUpdateVariantStatus,
  cloneProduct,
  cloneVariant,
} from "@/src/services/product.service";
import { useToast } from "@/src/components/ui/Toast";
import type { Product, ProductVariant } from "@/src/types/product.types";
import { buildColumns, type ProductRow } from "./_columns";
import { VariantSubRow } from "./_VariantSubRow";
import { VariantBulkBar } from "./_VariantBulkBar";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductsTableProps {
  initialProducts: Product[];
}

type SelectionMode = "none" | "products" | "variants";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ProductsTable — client component owning all interactive state for the
 * Product List page.
 *
 * Selection model:
 *   Products and variants are mutually exclusive selection groups.
 *   Checking a product row clears any variant selections; checking a variant
 *   checkbox clears any product selections. The bulk-action bar adapts to
 *   show the correct actions for whichever entity type is currently selected.
 */
export function ProductsTable({ initialProducts }: ProductsTableProps) {
  const { showToast } = useToast();

  // ── Local product list (updated optimistically on delete) ──────────────────
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // ── Filter / search / sort state ───────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Selection state (products vs variants — mutually exclusive) ────────────
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);

  const selectionMode: SelectionMode =
    selectedProductIds.length > 0 ? "products"
      : selectedVariantIds.length > 0 ? "variants"
        : "none";

  // ── Product delete state ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteBlocked, setDeleteBlocked] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Product bulk delete state ──────────────────────────────────────────────
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // ── Variant delete state ───────────────────────────────────────────────────
  const [deleteVariantTarget, setDeleteVariantTarget] = useState<{
    id: string; name: string; sku: string;
  } | null>(null);
  const [isDeletingVariant, setIsDeletingVariant] = useState(false);

  // ── Variant bulk delete state ──────────────────────────────────────────────
  const [showBulkVariantDeleteConfirm, setShowBulkVariantDeleteConfirm] = useState(false);
  const [isBulkVariantDeleting, setIsBulkVariantDeleting] = useState(false);

  // ── Clone state ────────────────────────────────────────────────────────────
  const [cloningProductId, setCloningProductId] = useState<string | null>(null);
  const [cloningVariantId, setCloningVariantId] = useState<string | null>(null);

  // ── Reset page when any filter changes ────────────────────────────────────
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter, sortKey, sortDir]);

  // ── Filter options derived from current data ───────────────────────────────

  const statusOptions = useMemo(
    () => [
      { value: "published", label: "Published", count: products.filter((p) => p.status === "published").length },
      { value: "draft", label: "Draft", count: products.filter((p) => p.status === "draft").length },
      { value: "archived", label: "Archived", count: products.filter((p) => p.status === "archived").length },
    ],
    [products]
  );

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, label: value, count }));
  }, [products]);

  // ── Filtered → sorted → paginated data ────────────────────────────────────

  const filtered = useMemo(() => {
    let result = products;

    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lower) ||
          p.slug.includes(lower) ||
          p.brands.some((b) => b.toLowerCase().includes(lower)) ||
          p.category.toLowerCase().includes(lower) ||
          p.variants.some((v) => v.sku.toLowerCase().includes(lower))
      );
    }

    if (statusFilter.length) {
      result = result.filter((p) => statusFilter.includes(p.status));
    }

    if (categoryFilter.length) {
      result = result.filter((p) => categoryFilter.includes(p.category));
    }

    return result;
  }, [products, search, statusFilter, categoryFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey];
      const bv = (b as unknown as Record<string, unknown>)[sortKey];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else if (typeof av === "string" && typeof bv === "string") {
        cmp = av.localeCompare(bv);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalRows = sorted.length;

  const filteredPage = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // ── Sort handler ───────────────────────────────────────────────────────────

  const handleSortChange = useCallback((key: string, dir: SortDir) => {
    setSortKey(key);
    setSortDir(dir);
  }, []);

  // ── Selection handlers (mutual exclusivity) ────────────────────────────────

  const handleProductSelectionChange = useCallback((keys: string[]) => {
    setSelectedProductIds(keys);
    if (keys.length > 0) setSelectedVariantIds([]);
  }, []);

  const handleVariantCheck = useCallback((variantId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds([]);
      setSelectedVariantIds((prev) => [...prev, variantId]);
    } else {
      setSelectedVariantIds((prev) => prev.filter((id) => id !== variantId));
    }
  }, []);

  // ── Product delete handlers ────────────────────────────────────────────────

  const handleDeleteClick = useCallback((product: Product) => {
    if (product.hasActiveOrders) {
      setDeleteBlocked(product);
    } else {
      setDeleteTarget(product);
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget]);

  // ── Product bulk handlers ──────────────────────────────────────────────────

  const handleBulkPublish = useCallback((keys: string[]) => {
    void bulkUpdateStatus(keys, "published").then(() => {
      setProducts((prev) =>
        prev.map((p) => keys.includes(p.id) ? { ...p, status: "published" as const } : p)
      );
    });
  }, []);

  const handleBulkArchive = useCallback((keys: string[]) => {
    void bulkUpdateStatus(keys, "archived").then(() => {
      setProducts((prev) =>
        prev.map((p) => keys.includes(p.id) ? { ...p, status: "archived" as const } : p)
      );
    });
  }, []);

  const handleBulkDeleteClick = useCallback((keys: string[]) => {
    const deletable = products
      .filter((p) => keys.includes(p.id) && !p.hasActiveOrders)
      .map((p) => p.id);
    if (deletable.length > 0) setBulkDeleteTargets(deletable);
  }, [products]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all(bulkDeleteTargets.map((id) => deleteProduct(id)));
      setProducts((prev) => prev.filter((p) => !bulkDeleteTargets.includes(p.id)));
      setBulkDeleteTargets([]);
    } finally {
      setIsBulkDeleting(false);
    }
  }, [bulkDeleteTargets]);

  // ── Variant delete handlers ────────────────────────────────────────────────

  const handleVariantDeleteConfirm = useCallback(async () => {
    if (!deleteVariantTarget) return;
    setIsDeletingVariant(true);
    try {
      await deleteVariant(deleteVariantTarget.id);
      setProducts((prev) =>
        prev.map((p) => {
          const newVariants = p.variants.filter((v) => v.id !== deleteVariantTarget.id);
          return {
            ...p,
            variants: newVariants,
            totalStock: newVariants.reduce((s, v) => s + v.stock, 0),
          };
        })
      );
      setSelectedVariantIds((prev) => prev.filter((id) => id !== deleteVariantTarget.id));
      setDeleteVariantTarget(null);
    } finally {
      setIsDeletingVariant(false);
    }
  }, [deleteVariantTarget]);

  // ── Variant bulk handlers ──────────────────────────────────────────────────

  const handleBulkVariantSetActive = useCallback(() => {
    void bulkUpdateVariantStatus(selectedVariantIds, "active").then(() => {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((v) =>
            selectedVariantIds.includes(v.id) ? { ...v, status: "active" as const } : v
          ),
        }))
      );
    });
  }, [selectedVariantIds]);

  const handleBulkVariantSetInactive = useCallback(() => {
    void bulkUpdateVariantStatus(selectedVariantIds, "inactive").then(() => {
      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          variants: p.variants.map((v) =>
            selectedVariantIds.includes(v.id) ? { ...v, status: "inactive" as const } : v
          ),
        }))
      );
    });
  }, [selectedVariantIds]);

  const handleBulkVariantDeleteConfirm = useCallback(async () => {
    setIsBulkVariantDeleting(true);
    try {
      await Promise.all(selectedVariantIds.map((id) => deleteVariant(id)));
      setProducts((prev) =>
        prev.map((p) => {
          const newVariants = p.variants.filter((v) => !selectedVariantIds.includes(v.id));
          return {
            ...p,
            variants: newVariants,
            totalStock: newVariants.reduce((s, v) => s + v.stock, 0),
          };
        })
      );
      setSelectedVariantIds([]);
      setShowBulkVariantDeleteConfirm(false);
    } finally {
      setIsBulkVariantDeleting(false);
    }
  }, [selectedVariantIds]);

  // ── Clone handlers ─────────────────────────────────────────────────────────

  const handleCloneProduct = useCallback(async (product: Product) => {
    setCloningProductId(product.id);
    try {
      const clone = await cloneProduct(product.id);
      setProducts((prev) => [clone, ...prev]);
      showToast(`Đã nhân bản "${product.name}" thành công`, "success");
    } catch {
      showToast("Nhân bản sản phẩm thất bại", "error");
    } finally {
      setCloningProductId(null);
    }
  }, [showToast]);

  const handleCloneVariant = useCallback(async (variant: ProductVariant, productId: string) => {
    setCloningVariantId(variant.id);
    try {
      const clone = await cloneVariant(productId, variant.id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, variants: [...p.variants, clone], totalStock: p.totalStock + clone.stock }
            : p
        )
      );
      showToast(`Đã nhân bản "${variant.name}" thành công`, "success");
    } catch {
      showToast("Nhân bản phiên bản thất bại", "error");
    } finally {
      setCloningVariantId(null);
    }
  }, [showToast]);

  // ── CSV export ─────────────────────────────────────────────────────────────

  const handleExport = useCallback(() => {
    const headers = ["ID", "Name", "Slug", "Category", "Brand", "Base Price", "Total Stock", "Status", "Created At", "Updated At"];
    const rows = sorted.map((p) => [
      p.id, `"${p.name}"`, p.slug, p.category, `"${p.brands.join(", ")}"`,
      p.variants.length > 0 ? Math.min(...p.variants.map((v) => v.price)) : "", p.totalStock, p.status, p.createdAt, p.updatedAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [sorted]);

  // ── Column definitions (built from sub-module) ─────────────────────────────

  const columns = useMemo(
    () => buildColumns(handleDeleteClick, handleCloneProduct, cloningProductId),
    [handleDeleteClick, handleCloneProduct, cloningProductId]
  );

  // ── Sub-row renderer (delegates to VariantSubRow component) ───────────────

  const renderSubRow = useCallback(
    (subRow: Record<string, unknown>, parentRow: ProductRow): ReactNode => {
      const v = subRow as unknown as ProductVariant;
      const productId = parentRow.id as string;
      const isSelected = selectedVariantIds.includes(v.id);
      return (
        <VariantSubRow
          key={v.id}
          variant={v}
          productId={productId}
          isSelected={isSelected}
          onCheck={handleVariantCheck}
          onDeleteClick={setDeleteVariantTarget}
          onCloneClick={(variant) => void handleCloneVariant(variant, productId)}
          isCloning={cloningVariantId === v.id}
        />
      );
    },
    [selectedVariantIds, handleVariantCheck]
  );

  // ── Toolbar actions ────────────────────────────────────────────────────────

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Trạng thái"
        options={statusOptions}
        selected={statusFilter}
        onChange={setStatusFilter}
      />
      <FilterDropdown
        label="Danh mục"
        options={categoryOptions}
        selected={categoryFilter}
        onChange={setCategoryFilter}
        searchable
      />
      <button
        type="button"
        onClick={handleExport}
        className="flex items-center gap-1.5 rounded-lg border border-secondary-200 bg-white px-3 py-2 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <ArrowDownTrayIcon className="w-4 h-4" aria-hidden="true" />
        Xuất
      </button>
    </>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Variant bulk-action bar (visible only when variant rows are selected) */}
      {selectionMode === "variants" && (
        <VariantBulkBar
          count={selectedVariantIds.length}
          onSetActive={handleBulkVariantSetActive}
          onSetInactive={handleBulkVariantSetInactive}
          onDeleteClick={() => setShowBulkVariantDeleteConfirm(true)}
          onClear={() => setSelectedVariantIds([])}
        />
      )}

      {/* ── DataTable ── */}
      <DataTable<ProductRow>
        data={filteredPage as ProductRow[]}
        columns={columns}

        keyField="id"
        selectable
        selectedKeys={selectedProductIds}
        onSelectionChange={handleProductSelectionChange}
        bulkActions={[
          {
            id: "publish",
            label: "Kích hoạt",
            icon: <GlobeAltIcon className="w-3.5 h-3.5" />,
            onClick: handleBulkPublish,
          },
          {
            id: "archive",
            label: "Lưu trữ",
            icon: <ArchiveBoxIcon className="w-3.5 h-3.5" />,
            onClick: handleBulkArchive,
          },
          {
            id: "delete",
            label: "Xoá",
            icon: <TrashIcon className="w-3.5 h-3.5" />,
            isDanger: true,
            onClick: handleBulkDeleteClick,
          },
        ]}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm kiếm theo tên, slug, thương hiệu, danh mục, SKU..."
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        getSubRows={(row) => {
          const product = row as unknown as Product;
          return product.variants.length > 0
            ? (product.variants as unknown as Record<string, unknown>[])
            : undefined;
        }}
        renderSubRow={renderSubRow}
        emptyMessage="No products found."
        emptyAction={
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            Thêm sản phẩm
          </Link>
        }
      />

      {/* ── Product: single delete confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá Sản Phẩm"
        description={`Hành động này sẽ xoá vĩnh viễn "${deleteTarget?.name}" và tất cả các biến thể của nó. Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá Sản Phẩm"
        requiredPhrase={deleteTarget?.name}
        isConfirming={isDeleting}
      />

      {/* ── Product: cannot-delete info ── */}
      <ConfirmDialog
        isOpen={!!deleteBlocked}
        onClose={() => setDeleteBlocked(null)}
        onConfirm={() => setDeleteBlocked(null)}
        title="Không thể xoá sản phẩm"
        description={`"${deleteBlocked?.name}" có đơn hàng đang hoạt động liên quan đến sản phẩm này. Vui lòng hủy tất cả đơn hàng liên quan trước khi xoá.`}
        variant="warning"
        confirmLabel="Đã hiểu"
        cancelLabel="Đóng"
      />

      {/* ── Product: bulk delete confirm ── */}
      <ConfirmDialog
        isOpen={bulkDeleteTargets.length > 0}
        onClose={() => setBulkDeleteTargets([])}
        onConfirm={handleBulkDeleteConfirm}
        title={`Xoá ${bulkDeleteTargets.length} Sản Phẩm`}
        description={`Hành động này sẽ xoá vĩnh viễn ${bulkDeleteTargets.length} sản phẩm và tất cả các biến thể của chúng. Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá Tất Cả"
        requiredPhrase="DELETE"
        isConfirming={isBulkDeleting}
      />

      {/* ── Variant: single delete confirm ── */}
      <ConfirmDialog
        isOpen={!!deleteVariantTarget}
        onClose={() => setDeleteVariantTarget(null)}
        onConfirm={handleVariantDeleteConfirm}
        title="Xoá Biến Thể"
        description={`Hành động này sẽ xoá vĩnh viễn biến thể "${deleteVariantTarget?.name}" (${deleteVariantTarget?.sku}). Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá Biến Thể"
        requiredPhrase={deleteVariantTarget?.sku}
        isConfirming={isDeletingVariant}
      />

      {/* ── Variant: bulk delete confirm ── */}
      <ConfirmDialog
        isOpen={showBulkVariantDeleteConfirm}
        onClose={() => setShowBulkVariantDeleteConfirm(false)}
        onConfirm={handleBulkVariantDeleteConfirm}
        title={`Xoá ${selectedVariantIds.length} Biến Thể`}
        description={`Hành động này sẽ xoá vĩnh viễn ${selectedVariantIds.length} biến thể(s). Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá Tất Cả"
        requiredPhrase="DELETE"
        isConfirming={isBulkVariantDeleting}
      />
    </>
  );
}
