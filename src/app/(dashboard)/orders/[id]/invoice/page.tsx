import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/src/services/order.service";
import { OrderInvoicePage } from "@/src/components/admin/orders/OrderInvoicePage";

// ─── Route config ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice ${id} — Admin`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return <OrderInvoicePage order={order} />;
}
