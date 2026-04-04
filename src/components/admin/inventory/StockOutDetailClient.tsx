"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { updateStockOutStatus } from "@/src/services/inventory.service";
import { Tooltip } from "@/src/components/ui/Tooltip";
import type { StockOutRecord, StockOutStatus, StockOutReason } from "@/src/types/inventory.types";

const REASON_LABELS: Record<StockOutReason, string> = {
  internal_use: "Internal Use",
  damage:       "Damage / Write-off",
  loss:         "Loss",
  transfer:     "Transfer",
  promotional:  "Promotional / Sample",
  other:        "Other",
};

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const STATUS_FLOW: Record<StockOutStatus, StockOutStatus | null> = {
  pending:   "packing",
  packing:   "packed",
  packed:    null,
  cancelled: null,
};

const STATUS_LABELS: Record<StockOutStatus, string> = {
  pending:   "Start Packing",
  packing:   "Mark Packed",
  packed:    "",
  cancelled: "",
};

export function StockOutDetailClient({ initialRecord }: { initialRecord: StockOutRecord }) {
  const { showToast } = useToast();
  const [record, setRecord] = useState(initialRecord);
  const [isSaving, setIsSaving] = useState(false);

  const nextStatus = STATUS_FLOW[record.status];
  const canCancel = record.status === "pending";

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
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/inventory/stock-out" className="hover:text-secondary-700 transition-colors">
              Stock Out
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
            href="/inventory/stock-out"
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
          {nextStatus && (
            <Button variant="primary" onClick={handleAdvance} disabled={isSaving} isLoading={isSaving}>
              {STATUS_LABELS[record.status]}
            </Button>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Reason</p>
            <p className="mt-1 text-sm font-medium text-secondary-800">
              {REASON_LABELS[record.reason] ?? record.reason}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Scheduled</p>
            <p className="mt-1 text-sm text-secondary-800">{formatDate(record.scheduledDate)}</p>
          </div>
          {record.completedDate && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Completed</p>
              <p className="mt-1 text-sm text-secondary-800">{formatDate(record.completedDate)}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Created By</p>
            <p className="mt-1 text-sm text-secondary-800">{record.createdBy}</p>
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
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3">Note</th>
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
                  <td className="px-4 py-3 text-center font-semibold text-secondary-900">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary-500">{item.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
