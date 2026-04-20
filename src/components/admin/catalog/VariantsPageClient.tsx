"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Toggle } from "@/src/components/ui/Toggle";
import { useToast } from "@/src/components/ui/Toast";
import {
  DataTable,
  RowActions,
  RowActionEdit,
  RowActionDelete,
  type ColumnDef,
} from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import type { PhienBanSanPham } from "@/src/types/variant.types";
import { deleteVariant, setDefaultVariant } from "@/src/services/variant.service";
import { formatVND } from "@/src/lib/format";

// ─── Types ────────────────────────────────────────────────────────────────────

type VariantRow = PhienBanSanPham & Record<string, unknown>;

interface VariantsPageClientProps {
  productId: string;
  productName: string;
  initialData: PhienBanSanPham[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantsPageClient({
  productId,
  productName,
  initialData,
}: VariantsPageClientProps) {
  const { showToast } = useToast();
  const [data, setData] = useState<VariantRow[]>(initialData as VariantRow[]);
  const [deleteTarget, setDeleteTarget] = useState<PhienBanSanPham | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleSetDefault(variantId: string) {
    void setDefaultVariant(productId, variantId).then(() => {
      setData((prev) =>
        prev.map((v) => ({ ...v, isDefault: v.id === variantId }))
      );
    });
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVariant(productId, deleteTarget.id);
      setData((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      showToast("Đã xóa phiên bản.", "success");
      setDeleteTarget(null);
    } catch {
      showToast("Có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: ColumnDef<VariantRow>[] = [
    {
      key: "name",
      header: "Phiên bản",
      render: (_val, row) => (
        <div>
          <p className="font-medium text-secondary-900">{row.name as string}</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="font-mono text-xs text-secondary-400">{row.sku as string}</p>
            {row.isDefault ? (
              <Badge variant="success" size="sm">Mặc định</Badge>
            ) : (
              <Toggle
                size="sm"
                label="Đặt mặc định"
                checked={false}
                onChange={() => handleSetDefault(row.id as string)}
              />
            )}
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Giá",
      align: "right",
      render: (_val, row) => (
        <span className="font-medium tabular-nums text-secondary-800">
          {formatVND(row.price as number)}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Tồn kho",
      align: "center",
      render: (_val, row) => {
        const s = row.stock as number;
        if (s === 0) return <Badge variant="error" size="sm">Hết hàng</Badge>;
        if (s <= 5)  return <Badge variant="warning" size="sm">{s} còn lại</Badge>;
        return <span className="text-secondary-700">{s.toLocaleString()}</span>;
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (_val, row) =>
        row.status === "active" ? (
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
          <RowActionEdit
            href={`/products/${productId}/variants/${row.id as string}/edit`}
          />
          <RowActionDelete
            onClick={() => setDeleteTarget(row as unknown as PhienBanSanPham)}
          />
        </RowActions>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Back link */}
      <Link
        href={`/products/${productId}`}
        className="inline-flex items-center gap-1.5 text-sm text-secondary-500 transition-colors hover:text-secondary-700"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        {productName}
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Phiên bản sản phẩm</h1>
          <p className="mt-1 text-sm text-secondary-500">{productName}</p>
        </div>
        <Link
          href={`/products/${productId}/variants/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Thêm phiên bản
        </Link>
      </div>

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

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        keyField="id"
        page={1}
        pageSize={data.length || 10}
        totalRows={data.length}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        hidePagination
        emptyMessage="Chưa có phiên bản nào."
      />
    </div>
  );
}
