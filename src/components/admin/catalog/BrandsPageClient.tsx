"use client";

import { useState, useCallback } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/src/components/ui/Button";
import { Badge } from "@/src/components/ui/Badge";
import { useToast } from "@/src/components/ui/Toast";
import {
  DataTable,
  RowActions,
  RowActionEdit,
  RowActionDelete,
  type ColumnDef,
} from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  BrandFormModal,
  type BrandFormData,
} from "@/src/components/admin/catalog/BrandFormModal";
import type { ThuongHieu } from "@/src/types/brand.types";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "@/src/services/brand.service";

// ─── Types ────────────────────────────────────────────────────────────────────

// DataTable requires T extends Record<string, unknown>
type BrandRow = ThuongHieu & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toFormData(brand: ThuongHieu): Partial<BrandFormData> {
  return {
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    websiteUrl: brand.websiteUrl,
    countryOfOrigin: "",
    active: brand.active,
    logoUrl: brand.logoUrl,
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BrandsPageClientProps {
  initialData: ThuongHieu[];
  initialTotal: number;
}

export function BrandsPageClient({ initialData, initialTotal }: BrandsPageClientProps) {
  const { showToast } = useToast();

  const [data, setData] = useState<BrandRow[]>(initialData as BrandRow[]);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<ThuongHieu | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ThuongHieu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(
    async (params: { q?: string; page?: number; pageSize?: number }) => {
      setIsLoading(true);
      try {
        const result = await getBrands({
          q: params.q ?? searchQuery,
          page: params.page ?? page,
          pageSize: params.pageSize ?? pageSize,
        });
        setData(result.data as BrandRow[]);
        setTotal(result.total);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, page, pageSize]
  );

  function handleSearchChange(q: string) {
    setSearchQuery(q);
    setPage(1);
    fetchData({ q, page: 1 });
  }

  function handlePageChange(p: number) {
    setPage(p);
    fetchData({ page: p });
  }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    fetchData({ pageSize: size, page: 1 });
  }

  function handleOpenCreate() {
    setEditingBrand(null);
    setModalOpen(true);
  }

  function handleOpenEdit(brand: ThuongHieu) {
    setEditingBrand(brand);
    setModalOpen(true);
  }

  async function handleSave(formData: BrandFormData) {
    setIsSaving(true);
    try {
      if (editingBrand) {
        const updated = await updateBrand(editingBrand.id, {
          ...formData,
          logoUrl: formData.logoUrl,
        });
        setData((prev) =>
          prev.map((b) => (b.id === updated.id ? (updated as BrandRow) : b))
        );
        showToast("Đã cập nhật thương hiệu.", "success");
      } else {
        const created = await createBrand(formData);
        setData((prev) => [created as BrandRow, ...prev]);
        setTotal((t) => t + 1);
        showToast("Đã thêm thương hiệu.", "success");
      }
      setModalOpen(false);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBrand(deleteTarget.id);
      setData((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setTotal((t) => t - 1);
      showToast("Đã xóa thương hiệu.", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: ColumnDef<BrandRow>[] = [
    {
      key: "name",
      header: "Thương hiệu",
      render: (_val, row) => (
        <div className="flex items-center gap-3">
          {row.logoUrl ? (
            <img
              src={row.logoUrl as string}
              alt={row.name as string}
              className="h-8 w-8 rounded-md object-contain border border-secondary-100 bg-white p-0.5"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary-100 text-xs font-bold text-secondary-500">
              {(row.name as string).charAt(0)}
            </div>
          )}
          <div>
            <p className="font-medium text-secondary-900">{row.name as string}</p>
            <p className="font-mono text-xs text-secondary-400">{row.slug as string}</p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Mô tả",
      render: (_val, row) => (
        <span className="line-clamp-2 text-sm text-secondary-600">
          {(row.description as string) || "—"}
        </span>
      ),
    },
    {
      key: "productCount",
      header: "Sản phẩm",
      align: "center",
      render: (_val, row) => (
        <span className="font-semibold text-secondary-700">{row.productCount as number}</span>
      ),
    },
    {
      key: "active",
      header: "Trạng thái",
      align: "center",
      render: (_val, row) =>
        row.active ? (
          <Badge variant="success" size="sm">Kích hoạt</Badge>
        ) : (
          <Badge variant="default" size="sm">Tắt</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (_val, row) => (
        <RowActions>
          <RowActionEdit onClick={() => handleOpenEdit(row as unknown as ThuongHieu)} />
          <RowActionDelete
            onClick={() => setDeleteTarget(row as unknown as ThuongHieu)}
          />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Thương hiệu</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Quản lý thương hiệu sản phẩm của cửa hàng.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreate}>
          <PlusIcon className="h-4 w-4" />
          Thêm thương hiệu
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        keyField="id"
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Tìm thương hiệu…"
        page={page}
        pageSize={pageSize}
        totalRows={total}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={isLoading}
        emptyMessage="Chưa có thương hiệu nào."
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Xóa "${deleteTarget?.name}"?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        variant="danger"
        isConfirming={isDeleting}
      />

      {/* Modal */}
      <BrandFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingBrand ? toFormData(editingBrand) : undefined}
        isSaving={isSaving}
      />
    </div>
  );
}
