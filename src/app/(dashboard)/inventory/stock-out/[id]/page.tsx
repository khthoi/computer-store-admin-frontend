export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getStockOutById } from "@/src/services/inventory.service";
import { StockOutDetailClient } from "@/src/components/admin/inventory/StockOutDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StockOutDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getStockOutById(id);
  if (!record) notFound();
  return <StockOutDetailClient initialRecord={record} />;
}
