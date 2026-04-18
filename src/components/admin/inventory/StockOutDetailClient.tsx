"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { updateStockOutStatus } from "@/src/services/inventory.service";
import type { StockOutLineItem, StockOutRecord, StockOutStatus, StockOutReason } from "@/src/types/inventory.types";

type LineItemRow = StockOutLineItem & Record<string, unknown>;

const REASON_LABELS: Record<StockOutReason, string> = {
  internal_use: "Internal Use",
  damage: "Damage / Write-off",
  loss: "Loss",
  transfer: "Transfer",
  promotional: "Promotional / Sample",
  other: "Other",
};

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_FLOW: Record<StockOutStatus, StockOutStatus | null> = {
  pending: "packing",
  packing: "packed",
  packed: null,
  cancelled: null,
};

const STATUS_LABELS: Record<StockOutStatus, string> = {
  pending: "Start Packing",
  packing: "Mark Packed",
  packed: "",
  cancelled: "",
};

const LINE_ITEM_COLUMNS: ColumnDef<LineItemRow>[] = [
  {
    key: "productName",
    header: "Sản phẩm / SKU",
    render: (_, row) => (
      <div>
        <div>
          <Tooltip content={row.productName as string} placement="top">
            <Link
              href={`/products/${row.productId as string}`}
              className="inline-block max-w-[200px] truncate font-medium text-primary-600 hover:underline"
            >
              {row.productName as string}
            </Link>
          </Tooltip>
        </div>
        <div>
          <Tooltip content={row.variantName as string} placement="top">
            <span className="inline-block max-w-[200px] truncate">
              <Link
                href={`/products/${row.productId as string}/variants/${row.variantId as string}`}
                className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
              >
                {row.variantName as string}
              </Link>
            </span>
          </Tooltip>
        </div>
        <p className="font-mono text-xs text-secondary-400">{row.sku as string}</p>
      </div>
    ),
  },
  {
    key: "quantity",
    header: "Số lượng",
    align: "center",
    render: (v) => (
      <span className="font-semibold text-secondary-900">{v as number}</span>
    ),
  },
  {
    key: "note",
    header: "Ghi chú",
    render: (v) => (
      <span className="text-xs text-secondary-500">{(v as string | undefined) ?? "—"}</span>
    ),
  },
];

export function StockOutDetailClient({ initialRecord }: { initialRecord: StockOutRecord }) {
  const { showToast } = useToast();
  const [record, setRecord] = useState(initialRecord);
  const [isSaving, setIsSaving] = useState(false);

  const nextStatus = STATUS_FLOW[record.status];
  const canCancel = record.status === "pending";

  const lineItems = useMemo(
    () => record.lineItems as LineItemRow[],
    [record.lineItems]
  );

  async function handleAdvance() {
    if (!nextStatus) return;
    setIsSaving(true);
    try {
      const updated = await updateStockOutStatus(record.id, nextStatus);
      setRecord(updated);
      showToast(`Status updated to "${nextStatus}".`, "success");
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    setIsSaving(true);
    try {
      const updated = await updateStockOutStatus(record.id, "cancelled");
      setRecord(updated);
      showToast("Stock-out cancelled.", "success");
    } catch {
      showToast("Failed to cancel.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{record.id}</h1>
            <StatusBadge status={record.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            href="/inventory/stock-out"
            className="rounded-lg"
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Quay lại
          </Button>
          {canCancel && (
            <Button variant="danger" className="rounded-lg" onClick={handleCancel} disabled={isSaving} isLoading={isSaving}>
              Huỷ phiếu
            </Button>
          )}
          {nextStatus && (
            <Button variant="primary" className="rounded-lg" onClick={handleAdvance} disabled={isSaving} isLoading={isSaving}>
              {STATUS_LABELS[record.status]}
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Lý do xuất kho</p>
            <p className="mt-1 text-sm font-medium text-secondary-800">
              {REASON_LABELS[record.reason] ?? record.reason}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Dự kiến</p>
            <p className="mt-1 text-sm text-secondary-800">{formatDate(record.scheduledDate)}</p>
          </div>
          {record.completedDate && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Hoàn thành lúc</p>
              <p className="mt-1 text-sm text-secondary-800">{formatDate(record.completedDate)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tạo bởi</p>
            <p className="mt-1 text-sm text-secondary-800">{record.createdBy}</p>
          </div>
          {record.note && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ghi chú</p>
              <p className="mt-1 text-sm text-secondary-700">{record.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-secondary-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-secondary-900">Chi tiết các mặt hàng</h2>
        </div>
        <DataTable
          data={lineItems}
          columns={LINE_ITEM_COLUMNS}
          keyField="id"
          className="!rounded-none !border-0 !shadow-none"
          page={1}
          pageSize={lineItems.length || 10}
          totalRows={lineItems.length}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          hidePagination
          emptyMessage="Không có mặt hàng nào."
          searchPlaceholder="Tìm sản phẩm…"
        />
      </div>
    </div>
  );
}
