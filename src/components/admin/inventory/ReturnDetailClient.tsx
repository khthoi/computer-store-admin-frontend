"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { updateReturnStatus } from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import { MarkReceivedModal } from "@/src/components/admin/inventory/MarkReceivedModal";
import type { ReturnRequest, ReturnRequestStatus } from "@/src/types/inventory.types";

function formatDate(s?: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
  });
}

const REASON_LABELS: Record<string, string> = {
  defective: "Defective Product",
  wrong_item: "Wrong Item Sent",
  damaged_in_transit: "Damaged in Transit",
  not_as_described: "Not as Described",
  customer_changed_mind: "Customer Changed Mind",
  other: "Other",
};

const CONDITION_BADGES: Record<string, string> = {
  good: "text-success-700 bg-success-50 border-success-200",
  damaged: "text-warning-700 bg-warning-50 border-warning-200",
  unusable: "text-error-700 bg-error-50 border-error-200",
};

export function ReturnDetailClient({
  initialReturn,
  backHref = "/inventory/returns",
}: {
  initialReturn: ReturnRequest;
  backHref?: string;
}) {
  const { showToast } = useToast();
  const [ret, setRet] = useState(initialReturn);
  const [isSaving, setIsSaving] = useState(false);
  const [markReceivedOpen, setMarkReceivedOpen] = useState(false);

  const canApprove = ret.status === "requested";
  const canReject = ret.status === "requested";
  const canMarkReceived = ret.status === "approved";
  const canComplete = ret.status === "received";

  async function handleStatus(status: ReturnRequestStatus, adminNote?: string) {
    setIsSaving(true);
    try {
      const updated = await updateReturnStatus(ret.id, status, adminNote);
      setRet(updated);
      showToast(`Return ${status}.`, "success");
    } catch {
      showToast("Failed to update return status.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMarkReceived(adminNote: string) {
    await handleStatus("received", adminNote || undefined);
    setMarkReceivedOpen(false);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href={backHref} className="hover:text-secondary-700 transition-colors">
              Returns
            </Link>
            <span aria-hidden="true">›</span>
            <span className="font-mono text-secondary-600">{ret.id}</span>
          </nav>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{ret.id}</h1>
            <StatusBadge status={ret.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back
          </Link>
          {canReject && (
            <Button variant="danger" onClick={() => handleStatus("rejected")} disabled={isSaving} isLoading={isSaving}>
              Reject
            </Button>
          )}
          {canApprove && (
            <Button variant="secondary" onClick={() => handleStatus("approved")} disabled={isSaving} isLoading={isSaving}>
              Approve
            </Button>
          )}
          {canMarkReceived && (
            <Button variant="primary" onClick={() => setMarkReceivedOpen(true)} disabled={isSaving}>
              Mark Received
            </Button>
          )}
          {canComplete && (
            <Button variant="primary" onClick={() => handleStatus("completed")} disabled={isSaving} isLoading={isSaving}>
              Complete
            </Button>
          )}
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
        <div className="space-y-6">
          {/* Return details */}
          <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-secondary-900">Return Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Order</p>
                <Link
                  href={`/orders/${ret.orderId}`}
                  className="mt-1 block font-mono text-sm font-medium text-primary-600 hover:underline"
                >
                  {ret.orderId}
                </Link>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Customer</p>
                <p className="mt-1 text-sm font-medium text-secondary-800">{ret.customerName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Reason</p>
                <p className="mt-1 text-sm text-secondary-700">
                  {REASON_LABELS[ret.reason] ?? ret.reason}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Resolution</p>
                <div className="mt-1">
                  <StatusBadge status={ret.resolution} size="sm" />
                </div>
              </div>
              {ret.refundAmount > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Refund Amount</p>
                  <p className="mt-1 text-sm font-semibold text-secondary-900">{formatVND(ret.refundAmount)}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Requested</p>
                <p className="mt-1 text-sm text-secondary-700">{formatDate(ret.requestedAt)}</p>
              </div>
              {ret.approvedAt && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Approved</p>
                  <p className="mt-1 text-sm text-secondary-700">{formatDate(ret.approvedAt)}</p>
                </div>
              )}
              {ret.receivedAt && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Received</p>
                  <p className="mt-1 text-sm text-secondary-700">{formatDate(ret.receivedAt)}</p>
                </div>
              )}
              {ret.completedAt && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Completed</p>
                  <p className="mt-1 text-sm text-secondary-700">{formatDate(ret.completedAt)}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {(ret.customerNote || ret.adminNote) && (
              <div className="mt-5 space-y-3 border-t border-secondary-100 pt-4">
                {ret.customerNote && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Customer Note</p>
                    <p className="mt-1 text-sm text-secondary-700">{ret.customerNote}</p>
                  </div>
                )}
                {ret.adminNote && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Admin Note</p>
                    <p className="mt-1 text-sm text-secondary-700">{ret.adminNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Line items */}
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
            <div className="border-b border-secondary-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-secondary-900">Returned Items</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary-50 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
                  <tr>
                    <th className="px-4 py-3">Product / SKU</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100">
                  {ret.lineItems.map((item) => (
                    <tr key={item.id} className="text-secondary-700">
                      <td className="px-4 py-3">
                        <p className="font-medium text-secondary-800">{item.productName}</p>
                        <p className="text-xs text-secondary-500">{item.variantName}</p>
                        <p className="font-mono text-xs text-secondary-400">{item.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3">
                        {item.condition ? (
                          <span
                            className={[
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize",
                              CONDITION_BADGES[item.condition] ?? "text-secondary-600 bg-secondary-100 border-secondary-200",
                            ].join(" ")}
                          >
                            {item.condition}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary-500">{item.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column — status timeline */}
        <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-secondary-900">Status Timeline</h3>
          <ol className="space-y-4">
            {(
              [
                { label: "Requested", date: ret.requestedAt, done: true },
                { label: "Approved", date: ret.approvedAt, done: !!ret.approvedAt },
                { label: "Received", date: ret.receivedAt, done: !!ret.receivedAt },
                { label: "Completed", date: ret.completedAt, done: !!ret.completedAt },
              ] as { label: string; date?: string; done: boolean }[]
            ).map((step) => (
              <li key={step.label} className="flex items-start gap-3">
                <span
                  className={[
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    step.done
                      ? "bg-success-100 text-success-700"
                      : "bg-secondary-100 text-secondary-400",
                  ].join(" ")}
                >
                  {step.done ? "✓" : "○"}
                </span>
                <div>
                  <p className={["text-sm font-medium", step.done ? "text-secondary-900" : "text-secondary-400"].join(" ")}>
                    {step.label}
                  </p>
                  {step.date && (
                    <p className="text-xs text-secondary-400">{formatDate(step.date)}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <MarkReceivedModal
        isOpen={markReceivedOpen}
        onClose={() => setMarkReceivedOpen(false)}
        onConfirm={handleMarkReceived}
        lineItems={ret.lineItems}
        isConfirming={isSaving}
      />
    </div>
  );
}
