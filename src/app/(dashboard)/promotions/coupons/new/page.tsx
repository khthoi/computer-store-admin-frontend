export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { CouponFormClient } from "@/src/components/admin/promotions/CouponFormClient";

export const metadata: Metadata = { title: "New Coupon — Admin" };

export default function NewCouponPage() {
  return <CouponFormClient mode="create" />;
}
