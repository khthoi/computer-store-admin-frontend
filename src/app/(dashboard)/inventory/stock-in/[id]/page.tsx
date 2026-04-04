export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getStockInById } from "@/src/services/inventory.service";
import { StockInDetailClient } from "@/src/components/admin/inventory/StockInDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StockInDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getStockInById(id);
  if (!record) notFound();
  return <StockInDetailClient initialRecord={record} />;
}
