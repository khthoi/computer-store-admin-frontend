export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCouponById } from "@/src/services/coupon.service";
import { CouponFormClient } from "@/src/components/admin/promotions/CouponFormClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Edit Coupon ${id} — Admin` };
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coupon = await getCouponById(id);
  if (!coupon) notFound();

  return <CouponFormClient mode="edit" coupon={coupon} />;
}
