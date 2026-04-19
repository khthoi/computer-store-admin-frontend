"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/src/components/ui/Badge";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import {
  RowActions,
  RowActionView,
  RowActionEdit,
  RowActionDelete,
  RowActionClone,
} from "@/src/components/admin/DataTable";
import { deleteVariant, cloneVariant } from "@/src/services/product.service";
import { useToast } from "@/src/components/ui/Toast";
import { formatVND } from "@/src/lib/format";
import type { ProductVariant } from "@/src/types/product.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface VariantsPanelProps {
  productId: string;
  initialVariants: ProductVariant[];
}

/**
 * VariantsPanel — client component that renders the variants table for both
 * the product detail page and the product edit page.
 *
 * Owns its own variant list state so deletions are reflected immediately
 * without a full page reload.
 */
export function VariantsPanel({ productId, initialVariants }: VariantsPanelProps) {
  const { showToast } = useToast();
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [deleteTarget, setDeleteTarget] = useState<ProductVariant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [cloningVariantId, setCloningVariantId] = useState<string | null>(null);

  const handleCloneVariant = useCallback(async (variant: ProductVariant) => {
    setCloningVariantId(variant.id);
    try {
      const clone = await cloneVariant(productId, variant.id);
      setVariants((prev) => [...prev, clone]);
      showToast(`Đã nhân bản "${variant.name}" thành công`, "success");
    } catch {
      showToast("Nhân bản phiên bản thất bại", "error");
    } finally {
      setCloningVariantId(null);
    }
  }, [productId, showToast]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteVariant(deleteTarget.id);
      setVariants((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (variants.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-secondary-500">Chưa có phiên bản nào.</p>
        <Link
          href={`/products/${productId}/variants/new`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          Thêm phiên bản đầu tiên
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header row — count + Add Variant button */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-secondary-500">
          {variants.length} phiên bản
        </p>
        <Link
          href={`/products/${productId}/variants/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4" aria-hidden="true" />
          Thêm phiên bản
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-secondary-100">
              <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
                Phiên bản
              </th>
              <th className="pb-3 pr-4 text-left text-xs font-medium uppercase tracking-wide text-secondary-500">
                SKU
              </th>
              <th className="pb-3 pr-4 text-right text-xs font-medium uppercase tracking-wide text-secondary-500">
                Giá
              </th>
              <th className="pb-3 pr-4 text-center text-xs font-medium uppercase tracking-wide text-secondary-500">
                Tồn kho
              </th>
              <th className="pb-3 pr-4 text-center text-xs font-medium uppercase tracking-wide text-secondary-500">
                Trạng thái
              </th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wide text-secondary-500">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-50">
            {variants.map((v) => (
              <tr key={v.id} className="transition-colors hover:bg-secondary-50/50">
                <td className="py-3 pr-4">
                  <p className="font-medium text-secondary-800">{v.name}</p>
                  <p className="mt-0.5 text-xs text-secondary-400">
                    {formatDateTime(v.updatedAt)}
                  </p>
                </td>
                <td className="py-3 pr-4">
                  <span className="font-mono text-xs text-secondary-600">{v.sku}</span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <span className="font-medium tabular-nums text-secondary-800">
                    {formatVND(v.price)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-center">
                  {v.stock === 0 ? (
                    <Badge variant="error" size="sm">Out of stock</Badge>
                  ) : v.stock <= 5 ? (
                    <Badge variant="warning" size="sm">{v.stock} left</Badge>
                  ) : (
                    <span className="text-secondary-700">{v.stock.toLocaleString()}</span>
                  )}
                </td>
                <td className="py-3 pr-4 text-center">
                  <StatusBadge status={v.status} size="sm" />
                </td>
                <td className="py-3 text-right">
                  <RowActions>
                    <RowActionView
                      href={`/products/${productId}/variants/${v.id}`}
                      ariaLabel={`Xem phiên bản ${v.name}`}
                    />
                    <RowActionClone
                      ariaLabel={`Nhân bản phiên bản ${v.name}`}
                      isLoading={cloningVariantId === v.id}
                      onClick={() => void handleCloneVariant(v)}
                    />
                    <RowActionEdit
                      href={`/products/${productId}/variants/${v.id}/edit`}
                      ariaLabel={`Chỉnh sửa phiên bản ${v.name}`}
                    />
                    <RowActionDelete
                      ariaLabel={`Xoá phiên bản ${v.name}`}
                      onClick={() => setDeleteTarget(v)}
                    />
                  </RowActions>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
