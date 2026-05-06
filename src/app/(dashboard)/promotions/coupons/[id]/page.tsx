export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromotionById, getPromotionUsage } from "@/src/services/promotion.service";
import { PromotionFormClient } from "@/src/components/admin/promotions/PromotionFormClient";
import { PromotionUsageSection } from "@/src/components/admin/promotions/PromotionUsageSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const coupon = await getPromotionById(id);
  return { title: `${coupon?.code ?? id} — Admin` };
}

export default async function CouponDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [coupon, usage] = await Promise.all([
    getPromotionById(id),
    getPromotionUsage(id).catch(() => []),
  ]);
  if (!coupon || !coupon.isCoupon) notFound();

  return (
    <div>
      <PromotionFormClient mode="view" promotion={coupon} />
      <PromotionUsageSection promotion={coupon} initialUsage={usage} />
    </div>
  );
}
