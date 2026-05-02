"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/Toast";
import { OrderDetailPanel } from "@/src/components/admin/orders/OrderDetailPanel";
import { OrderStatusStepper } from "@/src/components/admin/orders/OrderStatusStepper";
import { OrderShippingPanel } from "@/src/components/admin/orders/OrderShippingPanel";
import { OrderNotesPanel } from "@/src/components/admin/orders/OrderNotesPanel";
import { OrderActivityLog } from "@/src/components/admin/orders/OrderActivityLog";
import { OrderReturnRequestsCard } from "@/src/components/admin/orders/OrderReturnRequestsCard";
import { PaymentInfoCard } from "@/src/components/admin/orders/PaymentInfoCard";
import {
  getOrderById,
  updateOrderStatus,
  updateOrderShipping,
  addOrderNote,
  cancelOrder,
  getOrderReturnRequests,
} from "@/src/services/order.service";
import type { Order, OrderStatus, OrderReturnRequest } from "@/src/types/order.types";
import type { ShippingInfo } from "@/src/components/admin/orders/OrderShippingPanel";

// ─── Cancel Dialog ────────────────────────────────────────────────────────────

interface CancelOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderId: string;
  isConfirming: boolean;
}

function CancelOrderDialog({ isOpen, onClose, onConfirm, orderId, isConfirming }: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");

  function handleClose() {
    setReason("");
    onClose();
  }

  function handleConfirm() {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  }

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={handleClose}
        className="absolute inset-0 bg-secondary-900/60 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-dialog-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        <div className="px-6 pb-6 pt-6">
          {/* Icon + title */}
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error-100 text-error-600"
              aria-hidden="true"
            >
              <ExclamationTriangleIcon className="w-6 h-6" />
            </span>
            <div className="min-w-0 pt-1.5">
              <h2 id="cancel-dialog-title" className="text-base font-semibold text-secondary-900">
                Cancel Order {orderId}
              </h2>
              <p className="mt-1 text-sm text-secondary-600">
                This action cannot be undone. Please provide a reason for cancellation.
              </p>
            </div>
          </div>

          {/* Reason input */}
          <div className="mt-5">
            <label
              htmlFor="cancel-reason"
              className="mb-1.5 block text-sm font-medium text-secondary-700"
            >
              Cancellation reason <span aria-hidden="true" className="text-error-600">*</span>
            </label>
            <textarea
              id="cancel-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation, out of stock, duplicate order…"
              className="w-full resize-none rounded-lg border border-secondary-300 px-3 py-2 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-secondary-50"
              disabled={isConfirming}
            />
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isConfirming}
              className="flex items-center justify-center rounded-xl border border-secondary-200 px-5 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50 disabled:pointer-events-none disabled:opacity-50"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!reason.trim() || isConfirming}
              className="flex items-center justify-center gap-2 rounded-xl bg-error-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-error-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConfirming && (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isConfirming ? "Cancelling…" : "Cancel Order"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface OrderDetailPageClientProps {
  order: Order;
}

export function OrderDetailPageClient({ order: initialOrder }: OrderDetailPageClientProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [order, setOrder]                           = useState<Order>(initialOrder);
  const [isSavingStatus, setIsSavingStatus]         = useState(false);
  const [isSavingShipping, setIsSavingShipping]     = useState(false);
  const [isAddingNote, setIsAddingNote]             = useState(false);
  const [isCancelling, setIsCancelling]             = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen]     = useState(false);
  const [returnRequests, setReturnRequests]         = useState<OrderReturnRequest[]>([]);

  useEffect(() => {
    getOrderReturnRequests(order.id).then(setReturnRequests).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.id]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleStatusChange(newStatus: OrderStatus) {
    setIsSavingStatus(true);
    try {
      await updateOrderStatus(order.id, { status: newStatus });
      const refreshed = await getOrderById(order.id);
      if (refreshed) setOrder(refreshed);
      showToast(`Order status updated to "${newStatus}".`, "success");
    } catch {
      showToast("Failed to update order status.", "error");
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function handleShippingUpdate(info: Partial<ShippingInfo>) {
    setIsSavingShipping(true);
    try {
      const updated = await updateOrderShipping(order.id, {
        carrier:           info.carrier,
        trackingNumber:    info.trackingNumber,
        estimatedDelivery: info.estimatedDelivery,
      });
      setOrder(updated);
      showToast("Shipping info saved.", "success");
    } catch {
      showToast("Failed to save shipping info.", "error");
    } finally {
      setIsSavingShipping(false);
    }
  }

  async function handleAddNote(text: string) {
    setIsAddingNote(true);
    try {
      const note = await addOrderNote(order.id, {
        text,
        authorName: "Admin",
        authorRole: "Admin",
      });
      setOrder((prev) => ({
        ...prev,
        internalNotes: [...prev.internalNotes, note],
      }));
    } catch {
      showToast("Failed to add note.", "error");
    } finally {
      setIsAddingNote(false);
    }
  }

  async function handleCancel(reason: string) {
    setIsCancelling(true);
    try {
      await cancelOrder(order.id, reason);
      const refreshed = await getOrderById(order.id);
      if (refreshed) setOrder(refreshed);
      setCancelDialogOpen(false);
      showToast("Order cancelled.", "success");
    } catch {
      showToast("Failed to cancel order.", "error");
    } finally {
      setIsCancelling(false);
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  const isCancellable = !["cancelled", "delivered", "returned"].includes(order.status);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/orders" className="transition-colors hover:text-secondary-700">
              Orders
            </Link>
            <span aria-hidden="true">›</span>
            <span className="font-mono text-secondary-600">{order.id}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-bold text-secondary-900">
            Order {order.id}
          </h1>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>

          <Link
            href={`/orders/${order.id}/invoice`}
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />
            Invoice
          </Link>

          {isCancellable && (
            <Button variant="danger" onClick={() => setCancelDialogOpen(true)}>
              <XCircleIcon className="h-4 w-4" aria-hidden="true" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">

        {/* ── Left column ── */}
        <div className="space-y-6">
          <OrderStatusStepper
            currentStatus={order.status}
            activityLog={order.activityLog}
            onStatusChange={handleStatusChange}
            isSaving={isSavingStatus}
          />
          <OrderDetailPanel order={order} />
          <OrderActivityLog entries={order.activityLog} />
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">
          <PaymentInfoCard orderCode={order.id} />

          <OrderReturnRequestsCard requests={returnRequests} />

          <OrderShippingPanel
            shipping={order.shipping}
            onUpdate={handleShippingUpdate}
            isSaving={isSavingShipping}
          />
          <OrderNotesPanel
            notes={order.internalNotes}
            onAddNote={handleAddNote}
            isAdding={isAddingNote}
          />

        </div>
      </div>

      {/* ── Dialogs ── */}
      <CancelOrderDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
        orderId={order.id}
        isConfirming={isCancelling}
      />

    </div>
  );
}
