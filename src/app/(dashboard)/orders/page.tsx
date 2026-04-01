import type { Metadata } from "next";
import { getOrders } from "@/src/services/order.service";
import { OrdersTable } from "@/src/components/admin/orders/OrdersTable";

// ─── Route config ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders — Admin",
  description: "Manage customer orders, shipping, and refunds.",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrdersPage() {
  const { data: orders, total } = await getOrders({ pageSize: 1000 });

  return (
    <div className="space-y-6 p-6">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Orders</h1>
          <p className="mt-1 text-sm text-secondary-500">
            {total} order{total !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* ── Table ── */}
      <OrdersTable initialOrders={orders} />
    </div>
  );
}
