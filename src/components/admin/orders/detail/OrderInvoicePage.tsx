"use client";

import Link from "next/link";
import { ArrowLeftIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { formatVND } from "@/src/lib/format";
import type { Order } from "@/src/types/order.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year:  "numeric",
    month: "2-digit",
    day:   "2-digit",
  });
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod:           "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  credit_card:   "Credit Card",
  momo:          "MoMo",
  zalopay:       "ZaloPay",
  vnpay:         "VNPay",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderInvoicePageProps {
  order: Order;
}

export function OrderInvoicePage({ order }: OrderInvoicePageProps) {
  const { address } = order.shipping;

  return (
    <div className="min-h-screen bg-secondary-50 p-6 print:bg-white print:p-0">
      {/* ── Toolbar (hidden on print) ── */}
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/orders/${order.id}`}
          className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to Order
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <PrinterIcon className="h-4 w-4" aria-hidden="true" />
          Print / Save PDF
        </button>
      </div>

      {/* ── Invoice document ── */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-secondary-200 bg-white p-10 shadow-sm print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-secondary-100 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-secondary-900">
              INVOICE
            </h1>
            <p className="mt-1 font-mono text-sm text-secondary-500">{order.id}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-secondary-900">Computer Store</p>
            <p className="text-sm text-secondary-500">admin@computerstore.vn</p>
            <p className="text-sm text-secondary-500">1900 1234</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3">
          {/* Invoice date */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Invoice Date</p>
            <p className="mt-1.5 text-sm font-medium text-secondary-800">{formatDate(order.createdAt)}</p>
          </div>
          {/* Order Status */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Order Status</p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={order.status} size="sm" />
              <span className="text-xs text-secondary-500 capitalize">{order.status}</span>
            </div>
          </div>
          {/* Payment */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Payment</p>
            <div className="mt-1.5 flex items-center gap-2">
              <StatusBadge status={order.paymentStatus} size="sm" />
              <span className="text-xs text-secondary-500">
                {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Discount / Coupon callout */}
        {(order.discountAmount > 0 || order.couponCode) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-success-200 bg-success-50 px-4 py-3">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-success-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {order.couponCode && (
                <span className="font-mono text-sm font-semibold text-success-700">
                  {order.couponCode}
                </span>
              )}
              {!order.couponCode && (
                <span className="text-sm font-medium text-success-700">Promotion applied</span>
              )}
            </div>
            <span className="ml-auto text-sm font-semibold text-success-700">
              −{formatVND(order.discountAmount)}
            </span>
          </div>
        )}

        {/* Bill to / Ship to */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Bill To</p>
            <p className="mt-1 font-medium text-secondary-800">{order.customer.name}</p>
            <p className="text-sm text-secondary-500">{order.customer.email}</p>
            <p className="text-sm text-secondary-500">{order.customer.phone}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Ship To</p>
            <p className="mt-1 font-medium text-secondary-800">{address.fullName}</p>
            <p className="text-sm text-secondary-500">{address.phone}</p>
            <p className="text-sm text-secondary-500">
              {[address.street, address.ward, address.district, address.city]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>

        {/* Line items table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-secondary-100">
          <table className="w-full text-sm">
            <thead className="bg-secondary-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {order.lineItems.map((item) => (
                <tr key={item.id} className="text-secondary-700">
                  <td className="px-4 py-3">
                    <p className="font-medium text-secondary-800">{item.productName}</p>
                    <p className="text-xs text-secondary-500">{item.variantName}</p>
                    <p className="text-xs font-mono text-secondary-400">{item.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatVND(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-secondary-900">
                    {formatVND(item.quantity * item.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-secondary-600">
              <span>Subtotal</span>
              <span>{formatVND(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-success-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{formatVND(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-secondary-600">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? "Free" : formatVND(order.shippingFee)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-secondary-600">
                <span>Tax</span>
                <span>{formatVND(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-double border-secondary-200 pt-3 text-base font-bold text-secondary-900">
              <span>Grand Total</span>
              <span>{formatVND(order.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Shipping info */}
        {(order.shipping.carrier || order.shipping.trackingNumber) && (
          <div className="mt-8 rounded-xl border border-secondary-100 bg-secondary-50 px-4 py-3 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400 mb-1">
              Shipping
            </p>
            {order.shipping.carrier && (
              <p className="text-secondary-700">Carrier: {order.shipping.carrier}</p>
            )}
            {order.shipping.trackingNumber && (
              <p className="font-mono text-secondary-700">
                Tracking: {order.shipping.trackingNumber}
              </p>
            )}
            {order.shipping.estimatedDelivery && (
              <p className="text-secondary-500">
                Est. delivery: {formatDate(order.shipping.estimatedDelivery)}
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 border-t border-secondary-100 pt-6 text-center text-xs text-secondary-400">
          Thank you for your purchase. For questions, contact us at support@computerstore.vn
        </div>
      </div>
    </div>
  );
}
