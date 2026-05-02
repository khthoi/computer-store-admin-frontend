export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getStockInById, getBatchesByVariant } from "@/src/services/inventory.service";
import { StockInDetailClient } from "@/src/components/admin/inventory/StockInDetailClient";
import type { StockBatch } from "@/src/types/inventory.types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function StockInDetailPage({ params }: Props) {
  const { id } = await params;
  const record = await getStockInById(id);
  if (!record) notFound();

  let batchMap: Record<string, StockBatch[]> = {};
  if (record.status === "received" || record.status === "partial") {
    const uniqueVariantIds = [...new Set(record.lineItems.map((li) => li.variantId))];
    const results = await Promise.all(
      uniqueVariantIds.map((vid) => getBatchesByVariant(vid).catch(() => [] as StockBatch[]))
    );
    uniqueVariantIds.forEach((vid, i) => {
      batchMap[vid] = results[i].filter((b) => b.importReceiptId === record.id);
    });
  }

  return <StockInDetailClient initialRecord={record} initialBatches={batchMap} />;
}
