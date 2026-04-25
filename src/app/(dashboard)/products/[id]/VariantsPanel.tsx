"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  DataTable,
  RowActions,
  RowActionView,
  RowActionEdit,
  RowActionDelete,
  RowActionClone,
  type ColumnDef,
} from "@/src/components/admin/DataTable";
import {
  deleteVariant,
  cloneVariant,
  setDefaultVariant,
} from "@/src/services/product.service";
import { useToast } from "@/src/components/ui/Toast";
import { formatVND } from "@/src/lib/format";
import type { ProductVariant } from "@/src/types/product.types";

// Pending clone: maps localPendingId → sourceVariantId
type PendingMap = Map<string, string>;

// ─── Types ────────────────────────────────────────────────────────────────────

type VariantRow = ProductVariant & Record<string, unknown>;

interface VariantsPanelProps {
  productId: string;
  initialVariants: ProductVariant[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function VariantsPanel({ productId, initialVariants }: VariantsPanelProps) {
  const { showToast } = useToast();
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // pending: localId → sourceVariantId
  const [pendingClones, setPendingClones] = useState<PendingMap>(new Map());
  const [savingCloneId, setSavingCloneId] = useState<string | null>(null);

  // ── Set default ───────────────────────────────────────────────────────────

  const handleSetDefault = useCallback((variantId: string) => {
    void setDefaultVariant(productId, variantId)
      .then(() => {
        setVariants((prev) =>
          prev.map((v) => ({ ...v, isDefault: v.id === variantId }))
        );
        showToast("Đã đặt phiên bản mặc định.", "success");
      })
      .catch(() => {
        showToast("Không thể đặt phiên bản mặc định.", "error");
      });
  }, [productId, showToast]);

  // ── Clone — Flow B: create local pending first ────────────────────────────

  const handleCloneVariant = useCallback((variant: ProductVariant) => {
    const pendingId = `PENDING-VAR-${Date.now()}`;
    const pendingClone: ProductVariant = {
      ...variant,
      id: pendingId,
      name: `Copy of ${variant.name}`,
      sku: `${variant.sku}-copy`,
      status: "inactive" as const,
      isDefault: false,
      stock: 0,
      updatedAt: new Date().toISOString(),
    };
    setPendingClones((prev) => new Map(prev).set(pendingId, variant.id));
    setVariants((prev) => [...prev, pendingClone]);
  }, []);

  const handleSavePending = useCallback(async (pendingId: string) => {
    const sourceId = pendingClones.get(pendingId);
    if (!sourceId) return;
    setSavingCloneId(pendingId);
    try {
      const clone = await cloneVariant(productId, sourceId);
      setVariants((prev) => prev.map((v) => v.id === pendingId ? clone : v));
      setPendingClones((prev) => {
        const m = new Map(prev);
        m.delete(pendingId);
        return m;
      });
      showToast("Đã nhân bản phiên bản thành công", "success");
    } catch {
      showToast("Nhân bản phiên bản thất bại", "error");
    } finally {
      setSavingCloneId(null);
    }
  }, [pendingClones, productId, showToast]);

  const handleCancelPending = useCallback((pendingId: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== pendingId));
    setPendingClones((prev) => {
      const m = new Map(prev);
      m.delete(pendingId);
      return m;
    });
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVariant(deleteTarget.id);
      setVariants((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast("Đã xoá phiên bản.", "success");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, showToast]);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<VariantRow>[] = [
    {
      key: "name",
      header: "Phiên bản",
      width: "w-90",
      render: (_val, row) => {
        const isDefault = !!row.isDefault;
        return (
          <div>
            <Tooltip content={row.name} placement="top" anchorToContent>
              <p className="font-medium text-secondary-800 truncate max-w-xs">{row.name}</p>
            </Tooltip>
            <div className="mt-1 flex items-center gap-2">
              {isDefault ? (
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
        );
      },
    },
    {
      key: "sku",
      header: "SKU",
      width: "w-35",
      render: (_val, row) => (
        <Tooltip content={row.sku} placement="top" anchorToContent>
          <span className="font-mono text-xs text-secondary-600 truncate max-w-[180px] block">
            {row.sku as string}
          </span>
        </Tooltip>
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
        if (s <= 5) return <Badge variant="warning" size="sm">{s} còn lại</Badge>;
        return <span className="text-secondary-700">{s.toLocaleString()}</span>;
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      align: "center",
      render: (_val, row) => (
        <StatusBadge status={row.status as ProductVariant["status"]} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (_val, row) => {
        const rowId = row.id as string;
        const isPending = pendingClones.has(rowId);
        const isSaving = savingCloneId === rowId;

        if (isPending) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => void handleSavePending(rowId)}
                className="rounded-md bg-primary-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {isSaving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleCancelPending(rowId)}
                className="rounded-md border border-secondary-300 bg-white px-2.5 py-1.5 text-xs font-medium text-secondary-700 hover:bg-secondary-50 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          );
        }

        return (
          <RowActions>
            <RowActionView
              href={`/products/${productId}/variants/${rowId}`}
              ariaLabel={`Xem phiên bản ${row.name as string}`}
            />
            <RowActionClone
              ariaLabel={`Nhân bản phiên bản ${row.name as string}`}
              isLoading={false}
              onClick={() => handleCloneVariant(row as unknown as ProductVariant)}
            />
            <RowActionEdit
              href={`/products/${productId}/variants/${rowId}/edit`}
              ariaLabel={`Chỉnh sửa phiên bản ${row.name as string}`}
            />
            <RowActionDelete
              ariaLabel={`Xoá phiên bản ${row.name as string}`}
              onClick={() => setDeleteTarget(row as unknown as ProductVariant)}
            />
          </RowActions>
        );
      },
    },
  ];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header row — count + Add Variant button */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-secondary-500
        ">{variants.length} phiên bản</p>
        <Link
          href={`/products/${productId}/variants/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Thêm phiên bản
        </Link>
      </div>

      <DataTable<VariantRow>
        data={variants as VariantRow[]}
        columns={columns}
        keyField="id"
        page={1}
        pageSize={variants.length || 10}
        totalRows={variants.length}
        onPageChange={() => { }}
        onPageSizeChange={() => { }}
        hidePagination
        emptyMessage="Chưa có phiên bản nào."
        emptyAction={
          <Link
            href={`/products/${productId}/variants/new`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Thêm phiên bản đầu tiên
          </Link>
        }
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá phiên bản"
        description={`Bạn có chắc chắn muốn xoá phiên bản "${deleteTarget?.name}" (${deleteTarget?.sku})? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá phiên bản"
        requiredPhrase={deleteTarget?.sku}
        isConfirming={isDeleting}
      />
    </>
  );
}
