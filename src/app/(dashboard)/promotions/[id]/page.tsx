export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromotionById, getPromotionUsage } from "@/src/services/promotion.service";
import { PromotionDetailClient } from "@/src/components/admin/promotions/PromotionDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Promotion ${id} — Admin` };
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [promotion, usage] = await Promise.all([
    getPromotionById(id),
    getPromotionUsage(id),
  ]);
  if (!promotion) notFound();

  return <PromotionDetailClient promotion={promotion} initialUsage={usage} />;
}
