"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CubeIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  GlobeAltIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import {
  DataTable,
  RowActions,
  RowActionView,
  RowActionEdit,
  RowActionDelete,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { Checkbox } from "@/src/components/ui/Checkbox";
import { formatVND } from "@/src/lib/format";
import {
  deleteProduct,
  deleteVariant,
  bulkUpdateStatus,
  bulkUpdateVariantStatus,
} from "@/src/services/product.service";
import type { Product, ProductVariant } from "@/src/types/product.types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductsTableProps {
  initialProducts: Product[];
}

/**
 * DataTable requires T extends Record<string, unknown>.
 * Intersect Product with the index signature to satisfy the constraint
 * while keeping all Product field types accessible in column renderers.
 */
type ProductRow = Product & Record<string, unknown>;

type SelectionMode = "none" | "products" | "variants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function StockCell({ stock }: { stock: number }) {
  const cls =
    stock === 0
      ? "font-semibold text-error-600"
      : stock <= 5
        ? "font-semibold text-error-500"
        : stock <= 20
          ? "font-semibold text-warning-600"
          : "text-secondary-700";
  return <span className={cls}>{stock.toLocaleString()}</span>;
}

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

  /** Called by DataTable when product-row checkboxes change. */
  const handleProductSelectionChange = useCallback((keys: string[]) => {
    setSelectedProductIds(keys);
    // Selecting any product clears variant selection
    if (keys.length > 0) setSelectedVariantIds([]);
  }, []);

  /** Called by variant-row checkbox in renderSubRow. */
  const handleVariantCheck = useCallback((variantId: string, checked: boolean) => {
    if (checked) {
      // Selecting a variant clears product selection (DataTable syncs via selectedKeys)
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

  // ── Column definitions ─────────────────────────────────────────────────────
  //
  // Column layout (10 cells per row):
  //   col 0  — checkbox        (DataTable selectable)
  //   col 1  — expand toggle   (DataTable getSubRows)
  //   col 2  — image/empty     products have NO image; variants show thumbnail
  //   col 3  — product name + slug
  //   col 4  — category
  //   col 5  — base price
  //   col 6  — total stock
  //   col 7  — status
  //   col 8  — updated at
  //   col 9  — row actions

  const columns: ColumnDef<ProductRow>[] = useMemo(
    () => [
      // col 2 — Image slot: products have no thumbnail, intentionally empty
      {
        key: "thumbnailUrl",  // key only used as React key; render ignores value
        header: "",
        width: "w-14",
        render: () => (
          // Spacer keeps the column present for alignment with variant sub-rows
          <span className="block w-10 h-10" aria-hidden="true" />
        ),
      },
      // col 3 — Product name + slug
      {
        key: "name",
        header: "Sản phẩm",
        sortable: true,
        tooltip: true,
        render: (value, row) => (
          <div className="min-w-0">
            <p className="font-medium text-secondary-900 truncate max-w-lg">
              {value as string}
            </p>
            <p className="text-xs text-secondary-400 truncate max-w-xs mt-0.5">
              {row.slug as string}
            </p>
          </div>
        ),
      },
      // col 4 — Category
      {
        key: "category",
        header: "Danh mục",
        width: "w-28",
        align: "center",
        render: (value) => (
          <span className="text-sm text-secondary-600">{value as string}</span>
        ),
      },
      // col 5 — Base price (derived from variants; no basePrice field on Product)
      {
        key: "variants",
        header: "Giá cơ bản",
        sortable: false,
        align: "right",
        width: "w-36",
        render: (_value, row) => {
          const prices = (row.variants as ProductVariant[]).map((v) => v.price);
          const min = prices.length > 0 ? Math.min(...prices) : undefined;
          return (
            <span className="font-medium text-secondary-800 tabular-nums text-sm">
              {min !== undefined ? formatVND(min) : "—"}
            </span>
          );
        },
      },
      // col 6 — Total stock
      {
        key: "totalStock",
        header: "Tồn kho",
        sortable: true,
        align: "center",
        width: "w-32",
        render: (value) => <StockCell stock={value as number} />,
      },
      // col 7 — Status
      {
        key: "status",
        header: "Trạng thái",
        width: "w-28",
        align: "center",
        render: (value) => (
          <StatusBadge
            status={value as "published" | "draft" | "archived"}
            size="sm"
          />
        ),
      },
      // col 8 — Updated at
      {
        key: "updatedAt",
        header: "Updated",
        sortable: true,
        align: "center",
        width: "w-28",
        render: (value) => (
          <span className="text-xs text-secondary-500 tabular-nums">
            {formatDate(value as string)}
          </span>
        ),
      },
      // col 9 — Row actions
      {
        key: "id",
        header: "",
        align: "right",
        width: "w-24",
        render: (value, row) => {
          const id = value as string;
          const product = row as unknown as Product;
          return (
            <RowActions>
              <RowActionView href={`/products/${id}`} ariaLabel={`View ${row.name as string}`} />
              <RowActionEdit href={`/products/${id}/edit`} ariaLabel={`Edit ${row.name as string}`} />
              <RowActionDelete ariaLabel={`Delete ${row.name as string}`} onClick={() => handleDeleteClick(product)} />
            </RowActions>
          );
        },
      },
    ],
    [handleDeleteClick]
  );

  // ── Sub-row renderer for variants ──────────────────────────────────────────
  //
  // Variant rows must output exactly 10 <td> cells to match the parent layout:
  //   col 0  — variant Checkbox (selection, mutually exclusive with products)
  //   col 1  — empty            (no further expand)
  //   col 2  — variant thumbnail or CubeIcon fallback
  //   col 3  — variant name + SKU
  //   col 4  — empty            (category belongs to the product)
  //   col 5  — variant price
  //   col 6  — variant stock
  //   col 7  — variant status
  //   col 8  — variant updatedAt
  //   col 9  — variant actions (edit, delete)

  const renderSubRow = useCallback(
    (subRow: Record<string, unknown>, parentRow: ProductRow): ReactNode => {
      const v = subRow as unknown as ProductVariant;
      const productId = parentRow.id as string;
      const isSelected = selectedVariantIds.includes(v.id);

      return (
        <tr
          key={v.id}
          className={[
            "border-t border-secondary-100/60 transition-colors",
            isSelected ? "bg-primary-50/70" : "bg-secondary-50/50 hover:bg-secondary-50",
          ].join(" ")}
        >
          {/* col 0 — variant checkbox */}
          <td className="w-10 px-4 py-2">
            <div className="flex items-center justify-center">
              <Checkbox
                size="sm"
                aria-label={`Select variant ${v.sku}`}
                checked={isSelected}
                onChange={(e) => handleVariantCheck(v.id, e.target.checked)}
              />
            </div>
          </td>

          {/* col 1 — expand placeholder (variants don't expand) */}
          <td className="w-8 px-2 py-2" />

          {/* col 2 — variant thumbnail */}
          <td className="w-14 px-4 py-2">
            {v.thumbnailUrl ? (
              <Image
                src={v.thumbnailUrl}
                alt={v.name}
                width={36}
                height={36}
                className="h-9 w-9 rounded-md object-cover border border-secondary-100"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary-100">
                <CubeIcon className="w-4 h-4 text-secondary-400" aria-hidden="true" />
              </span>
            )}
          </td>

          {/* col 3 — variant name + SKU */}
          <td className="px-4 py-2">
            <p className="text-sm text-secondary-700">{v.name}</p>
            <p className="text-xs text-secondary-400 font-mono mt-0.5">{v.sku}</p>
          </td>

          {/* col 4 — category (belongs to product, empty here) */}
          <td className="w-28 px-4 py-2" />

          {/* col 5 — variant price */}
          <td className="w-36 px-4 py-2 text-right">
            <span className="text-sm tabular-nums text-secondary-700">
              {formatVND(v.price)}
            </span>
          </td>

          {/* col 6 — variant stock */}
          <td className="w-20 px-4 py-2 text-center">
            <StockCell stock={v.stock} />
          </td>

          {/* col 7 — variant status */}
          <td className="w-28 px-4 py-2 text-center">
            <StatusBadge status={v.status} size="sm" />
          </td>

          {/* col 8 — variant updatedAt */}
          <td className="w-28 px-4 py-2 text-center">
            <span className="text-xs text-secondary-500 tabular-nums">
              {formatDate(v.updatedAt)}
            </span>
          </td>

          {/* col 9 — variant actions */}
          <td className="w-24 px-4 py-2">
            <RowActions>
              <RowActionView href={`/products/${productId}/variants/${v.id}`} ariaLabel={`View variant ${v.sku}`} />
              <RowActionEdit href={`/products/${productId}/variants/${v.id}/edit`} ariaLabel={`Edit variant ${v.sku}`} />
              <RowActionDelete ariaLabel={`Delete variant ${v.sku}`} onClick={() => setDeleteVariantTarget({ id: v.id, name: v.name, sku: v.sku })} />
            </RowActions>
          </td>
        </tr>
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

  // ── Shared button styles ───────────────────────────────────────────────────

  const bulkBtnBase =
    "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Variant bulk action bar ──────────────────────────────────────────
          Visible only when variant rows are selected. Styled to match
          DataTable's internal product bulk-action bar for consistency.    */}
      {selectionMode === "variants" && (
        <div
          role="toolbar"
          aria-label="Variant bulk actions"
          className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5"
        >
          <span className="text-sm font-medium text-primary-700">
            {selectedVariantIds.length}&nbsp;
            {selectedVariantIds.length === 1 ? "variant" : "variants"} đã chọn
          </span>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleBulkVariantSetActive}
              className={`${bulkBtnBase} border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50 focus-visible:ring-primary-500`}
            >
              <CheckCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Kích hoạt
            </button>
            <button
              type="button"
              onClick={handleBulkVariantSetInactive}
              className={`${bulkBtnBase} border-secondary-200 bg-white text-secondary-700 hover:bg-secondary-50 focus-visible:ring-primary-500`}
            >
              <XCircleIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Lưu trữ
            </button>
            <button
              type="button"
              onClick={() => setShowBulkVariantDeleteConfirm(true)}
              className={`${bulkBtnBase} border-error-300 bg-white text-error-600 hover:bg-error-50 focus-visible:ring-error-500`}
            >
              <TrashIcon className="w-3.5 h-3.5" aria-hidden="true" />
              Xoá
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSelectedVariantIds([])}
            className="ml-auto text-xs text-secondary-500 hover:text-secondary-800 focus-visible:outline-none"
          >
            Bỏ chọn
          </button>
        </div>
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
