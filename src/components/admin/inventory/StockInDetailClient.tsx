"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import { receiveStockIn, updateStockInStatus } from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { StockInLineItem, StockInRecord } from "@/src/types/inventory.types";

type LineItemRow = StockInLineItem & Record<string, unknown>;

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

export function StockInDetailClient({ initialRecord }: { initialRecord: StockInRecord }) {
  const { showToast } = useToast();
  const [record, setRecord] = useState(initialRecord);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>(
    Object.fromEntries(record.lineItems.map((l) => [l.id, l.quantityReceived]))
  );
  const [isSaving, setIsSaving] = useState(false);

  const canReceive = record.status === "pending" || record.status === "partial";
  const canCancel = record.status === "pending";

  async function handleReceive() {
    setIsSaving(true);
    try {
      const updated = await receiveStockIn(record.id, receivedQtys);
      setRecord(updated);
      showToast("Stock received and inventory updated.", "success");
    } catch {
      showToast("Failed to receive stock.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCancel() {
    setIsSaving(true);
    try {
      const updated = await updateStockInStatus(record.id, "cancelled");
      setRecord(updated);
      showToast("Stock-in cancelled.", "success");
    } catch {
      showToast("Failed to cancel.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  const lineItems = record.lineItems as LineItemRow[];

  const columns = useMemo<ColumnDef<LineItemRow>[]>(() => [
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
      key: "quantityOrdered",
      header: "Số lượng đặt",
      align: "center",
    },
    {
      key: "quantityReceived",
      header: "Đã nhận",
      align: "center",
      render: (_, row) => {
        if (canReceive) {
          return (
            <input
              type="number"
              min={0}
              max={row.quantityOrdered as number}
              value={receivedQtys[row.id as string] ?? 0}
              onChange={(e) =>
                setReceivedQtys((prev) => ({
                  ...prev,
                  [row.id as string]: Math.min(
                    row.quantityOrdered as number,
                    Math.max(0, parseInt(e.target.value, 10) || 0)
                  ),
                }))
              }
              className="w-20 rounded-lg border border-secondary-300 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          );
        }
        const received = row.quantityReceived as number;
        const ordered = row.quantityOrdered as number;
        return (
          <span className={[
            "font-semibold",
            received >= ordered ? "text-success-700" : received > 0 ? "text-warning-700" : "text-secondary-500",
          ].join(" ")}>
            {received}
          </span>
        );
      },
    },
    {
      key: "costPrice",
      header: "Chi phí/Đơn vị",
      align: "right",
      render: (v) => formatVND(v as number),
    },
    {
      key: "lineTotal",
      header: "Tổng cộng",
      align: "right",
      render: (_, row) => (
        <span className="font-semibold text-secondary-900">
          {formatVND((row.costPrice as number) * (row.quantityOrdered as number))}
        </span>
      ),
    },
  ], [canReceive, receivedQtys]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/inventory/stock-in" className="hover:text-secondary-700 transition-colors">
              Nhập hàng
            </Link>
            <span aria-hidden="true">›</span>
            <span className="font-mono text-secondary-600">{record.id}</span>
          </nav>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{record.id}</h1>
            <StatusBadge status={record.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            href="/inventory/stock-in"
            variant="secondary"
            leftIcon={<ArrowLeftIcon />}
          >
            Quay lại
          </Button>
          {canCancel && (
            <Button variant="danger" onClick={handleCancel} disabled={isSaving} isLoading={isSaving}>
              Huỷ phiếu
            </Button>
          )}
          {canReceive && (
            <Button variant="primary" onClick={handleReceive} disabled={isSaving} isLoading={isSaving}>
              Đã nhận hàng
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mã phiếu</p>
            <p className="mt-1 font-mono text-sm font-medium text-secondary-800">{record.receiptCode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Nhà cung cấp</p>
            <p className="mt-1 text-sm font-medium text-secondary-800">{record.supplierName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tên kho</p>
            <p className="mt-1 text-sm text-secondary-800">{record.warehouseName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ngày dự kiến</p>
            <p className="mt-1 text-sm text-secondary-800">{formatDate(record.expectedDate)}</p>
          </div>
          {record.receivedDate && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ngày nhận</p>
              <p className="mt-1 text-sm text-secondary-800">{formatDate(record.receivedDate)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tạo bởi</p>
            <p className="mt-1 text-sm text-secondary-800">{record.createdBy}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Tổng chi phí</p>
            <p className="mt-1 text-sm font-semibold text-secondary-900">{formatVND(record.totalCost)}</p>
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
          columns={columns}
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
        {/* Total cost row */}
        <div className="flex items-center justify-end gap-6 border-t-2 border-secondary-200 px-6 py-3">
          <span className="text-sm font-semibold text-secondary-700">Tổng chi phí</span>
          <span className="text-base font-bold text-secondary-900">{formatVND(record.totalCost)}</span>
        </div>
      </div>
    </div>
  );
}
