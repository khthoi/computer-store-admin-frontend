"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { receiveStockIn, updateStockInStatus } from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { StockInRecord } from "@/src/types/inventory.types";

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/inventory/stock-in" className="hover:text-secondary-700 transition-colors">
              Stock In
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
          <Link
            href="/inventory/stock-in"
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          {canCancel && (
            <Button variant="danger" onClick={handleCancel} disabled={isSaving} isLoading={isSaving}>
              Cancel
            </Button>
          )}
          {canReceive && (
            <Button variant="primary" onClick={handleReceive} disabled={isSaving} isLoading={isSaving}>
              Mark Received
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Receipt Code</p>
            <p className="mt-1 font-mono text-sm font-medium text-secondary-800">{record.receiptCode}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Supplier</p>
            <p className="mt-1 text-sm font-medium text-secondary-800">{record.supplierName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Warehouse</p>
            <p className="mt-1 text-sm text-secondary-800">{record.warehouseName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Expected Date</p>
            <p className="mt-1 text-sm text-secondary-800">{formatDate(record.expectedDate)}</p>
          </div>
          {record.receivedDate && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Received Date</p>
              <p className="mt-1 text-sm text-secondary-800">{formatDate(record.receivedDate)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Created By</p>
            <p className="mt-1 text-sm text-secondary-800">{record.createdBy}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Total Cost</p>
            <p className="mt-1 text-sm font-semibold text-secondary-900">{formatVND(record.totalCost)}</p>
          </div>
          {record.note && (
            <div className="sm:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Note</p>
              <p className="mt-1 text-sm text-secondary-700">{record.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Line items */}
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="border-b border-secondary-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-secondary-900">Line Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary-50 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
              <tr>
                <th className="px-4 py-3">Product / SKU</th>
                <th className="px-4 py-3 text-center">Ordered</th>
                <th className="px-4 py-3 text-center">Received</th>
                <th className="px-4 py-3 text-right">Cost/Unit</th>
                <th className="px-4 py-3 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {record.lineItems.map((item) => (
                <tr key={item.id} className="text-secondary-700">
                  <td className="px-4 py-3">
                    <div>
                      <Tooltip content={item.productName} placement="top">
                        <Link
                          href={`/products/${item.productId}`}
                          className="inline-block max-w-[200px] truncate font-medium text-primary-600 hover:underline"
                        >
                          {item.productName}
                        </Link>
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip content={item.variantName} placement="top">
                        <span className="inline-block max-w-[200px] truncate">
                          <Link
                            href={`/products/${item.productId}/variants/${item.variantId}`}
                            className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
                          >
                            {item.variantName}
                          </Link>
                        </span>
                      </Tooltip>
                    </div>
                    <p className="font-mono text-xs text-secondary-400">{item.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantityOrdered}</td>
                  <td className="px-4 py-3 text-center">
                    {canReceive ? (
                      <input
                        type="number"
                        min={0}
                        max={item.quantityOrdered}
                        value={receivedQtys[item.id] ?? 0}
                        onChange={(e) =>
                          setReceivedQtys((prev) => ({
                            ...prev,
                            [item.id]: Math.min(
                              item.quantityOrdered,
                              Math.max(0, parseInt(e.target.value, 10) || 0)
                            ),
                          }))
                        }
                        className="w-20 rounded-lg border border-secondary-300 px-2 py-1 text-center text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    ) : (
                      <span
                        className={[
                          "font-semibold",
                          item.quantityReceived >= item.quantityOrdered
                            ? "text-success-700"
                            : item.quantityReceived > 0
                            ? "text-warning-700"
                            : "text-secondary-500",
                        ].join(" ")}
                      >
                        {item.quantityReceived}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">{formatVND(item.costPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-secondary-900">
                    {formatVND(item.costPrice * item.quantityOrdered)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-secondary-200">
                <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-secondary-700">
                  Total Cost
                </td>
                <td className="px-4 py-3 text-right text-base font-bold text-secondary-900">
                  {formatVND(record.totalCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
