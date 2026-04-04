export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromotionById } from "@/src/services/promotion.service";
import { PromotionFormClient } from "@/src/components/admin/promotions/PromotionFormClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit Promotion ${id} — Admin` };
}

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await getPromotionById(id);
  if (!promotion) notFound();

  return <PromotionFormClient mode="edit" promotion={promotion} />;
}
