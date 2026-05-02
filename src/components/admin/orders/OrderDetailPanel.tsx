import Link from "next/link";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Badge } from "@/src/components/ui/Badge";
import { formatVND } from "@/src/lib/format";
import type { Order } from "@/src/types/order.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    year:   "numeric",
    month:  "2-digit",
    day:    "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod:           "Cash on Delivery",
  bank_transfer: "Bank Transfer",
  credit_card:   "Credit Card",
  momo:          "MoMo",
  zalopay:       "ZaloPay",
  vnpay:         "VNPay",
};

const CHANNEL_LABELS: Record<string, string> = {
  website: "Website",
  pos:     "POS",
  phone:   "Phone",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface OrderDetailPanelProps {
  order: Order;
  refundedQtyByVariantId?: Record<string, number>;
}

export function OrderDetailPanel({ order, refundedQtyByVariantId = {} }: OrderDetailPanelProps) {
  return (
    <div className="space-y-4">
      {/* ── Order meta ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-sm font-semibold text-secondary-700">{order.id}</p>
            <p className="mt-0.5 text-xs text-secondary-400">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} />
            <span className="inline-flex items-center rounded-full border border-secondary-200 bg-secondary-50 px-2.5 py-0.5 text-xs font-medium text-secondary-600">
              {CHANNEL_LABELS[order.channel] ?? order.channel}
            </span>
          </div>
        </div>

        {order.couponCode && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-success-200 bg-success-50 px-3 py-1 text-xs font-medium text-success-700">
            Coupon: {order.couponCode}
          </div>
        )}
      </div>

      {/* ── Customer ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-500">
          Customer
        </h3>
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
          >
            {getInitials(order.customer.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-secondary-900">{order.customer.name}</p>
            <p className="text-sm text-secondary-500">{order.customer.email}</p>
            <p className="text-sm text-secondary-500">{order.customer.phone}</p>
          </div>
          <Link
            href={`/customers/${order.customer.userId}`}
            className="shrink-0 text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
          >
            View profile →
          </Link>
        </div>

        {order.customerNote && (
          <p className="mt-3 text-sm text-secondary-600">
            <span className="font-semibold text-secondary-800">Note: </span>
            {order.customerNote}
          </p>
        )}
      </div>

      {/* ── Payment ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-secondary-500">
          Payment
        </h3>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.paymentStatus} size="md" />
          <span className="text-sm text-secondary-600">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        </div>
      </div>

      {/* ── Line items ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="px-5 py-3 border-b border-secondary-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-secondary-500">
            Items ({order.lineItems.reduce((s, li) => s + li.quantity, 0)})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-secondary-500 border-b border-secondary-100">
                <th className="px-5 pb-3 pt-3">Product</th>
                <th className="pb-3 pt-3 pr-4 text-center">Qty</th>
                <th className="pb-3 pt-3 pr-4 text-right">Unit Price</th>
                <th className="pb-3 pt-3 pr-5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {order.lineItems.map((item) => {
                const refundedQty  = refundedQtyByVariantId[item.variantId] ?? 0;
                const isFullyDone  = refundedQty >= item.quantity;
                const isPartial    = refundedQty > 0 && !isFullyDone;
                return (
                <tr key={item.id} className={isFullyDone ? "opacity-60" : ""}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          className="h-10 w-10 shrink-0 rounded border border-secondary-100 object-cover"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-10 w-10 shrink-0 rounded border border-secondary-100 bg-secondary-50"
                        />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          className="font-medium text-secondary-800 hover:text-primary-600 hover:underline line-clamp-1"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-secondary-500">{item.variantName}</p>
                        <p className="text-xs font-mono text-secondary-400">{item.sku}</p>
                        {isFullyDone && (
                          <Badge variant="error" size="sm" dot className="mt-1">Đã hoàn toàn bộ</Badge>
                        )}
                        {isPartial && (
                          <Badge variant="warning" size="sm" dot className="mt-1">
                            Đã hoàn {refundedQty}/{item.quantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-center text-secondary-700">{item.quantity}</td>
                  <td className="py-3 pr-4 text-right text-secondary-600">
                    {formatVND(item.unitPrice)}
                  </td>
                  <td className="py-3 pr-5 text-right font-medium text-secondary-800">
                    {formatVND(item.quantity * item.unitPrice)}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-secondary-100 px-5 py-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1.5 text-sm">
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
              <div className="flex justify-between border-t-2 border-double border-secondary-200 pt-2 text-base font-bold text-secondary-900">
                <span>Grand Total</span>
                <span>{formatVND(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
