export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromotionById, getPromotionUsage } from "@/src/services/promotion.service";
import { PromotionFormClient } from "@/src/components/admin/promotions/promotions/PromotionFormClient";
import { PromotionUsageSection } from "@/src/components/admin/promotions/promotions/PromotionUsageSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const promotion = await getPromotionById(id);
  return { title: `${promotion?.name ?? id} — Admin` };
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, usage] = await Promise.all([
    getPromotionById(id),
    getPromotionUsage(id).catch(() => []),
  ]);
  if (!promotion) notFound();

  return (
    <div>
      <PromotionFormClient mode="view" promotion={promotion} />
      <PromotionUsageSection promotion={promotion} initialUsage={usage} />
    </div>
  );
}
