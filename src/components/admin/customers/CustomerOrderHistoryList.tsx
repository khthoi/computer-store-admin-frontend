import Link from "next/link";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { AdminEmptyState } from "@/src/components/admin/shared/AdminEmptyState";
import { formatVND } from "@/src/lib/format";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import type { OrderSummary } from "@/src/types/order.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year:  "numeric",
    month: "2-digit",
    day:   "2-digit",
  });
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod:           "COD",
  bank_transfer: "Bank Transfer",
  credit_card:   "Credit Card",
  momo:          "MoMo",
  zalopay:       "ZaloPay",
  vnpay:         "VNPay",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface CustomerOrderHistoryListProps {
  orders: OrderSummary[];
}

export function CustomerOrderHistoryList({ orders }: CustomerOrderHistoryListProps) {
  if (orders.length === 0) {
    return (
      <AdminEmptyState
        icon={<ClipboardDocumentListIcon className="h-8 w-8" />}
        title="Chưa có lịch sử đơn hàng"
        description="Lịch sử đơn hàng của khách hàng sẽ hiển thị tại đây."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-secondary-100 text-left text-xs font-semibold uppercase tracking-wide text-secondary-500">
            <th className="pb-3 pr-4">Order ID</th>
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3 pr-4">Status</th>
            <th className="pb-3 pr-4">Payment</th>
            <th className="pb-3 pr-4 text-center">Items</th>
            <th className="pb-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-50">
          {orders.map((order) => (
            <tr key={order.id} className="group transition-colors hover:bg-secondary-50/60">
              <td className="py-3 pr-4">
                <Link
                  href={`/orders/${order.id}`}
                  className="font-mono text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {order.id}
                </Link>
              </td>
              <td className="py-3 pr-4 text-secondary-600">
                {formatDate(order.createdAt)}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge status={order.status} size="sm" />
              </td>
              <td className="py-3 pr-4">
                <div className="space-y-0.5">
                  <StatusBadge status={order.paymentStatus} size="sm" />
                  <p className="text-xs text-secondary-400">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </p>
                </div>
              </td>
              <td className="py-3 pr-4 text-center text-secondary-600">
                {order.itemCount}
              </td>
              <td className="py-3 text-right font-semibold text-secondary-900">
                {formatVND(order.grandTotal)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t-2 border-double border-secondary-200">
          <tr>
            <td colSpan={5} className="pt-3 text-sm font-medium text-secondary-500">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </td>
            <td className="pt-3 text-right text-sm font-bold text-secondary-900">
              {formatVND(orders.reduce((sum, o) => sum + o.grandTotal, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
