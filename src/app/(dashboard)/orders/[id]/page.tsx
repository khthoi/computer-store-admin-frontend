import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderById } from "@/src/services/order.service";
import { OrderDetailPageClient } from "@/src/components/admin/orders/OrderDetailPageClient";

// ─── Route config ─────────────────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order ${id} — Admin`,
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return <OrderDetailPageClient order={order} />;
}
