export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { PromotionFormClient } from "@/src/components/admin/promotions/PromotionFormClient";

export const metadata: Metadata = { title: "New Promotion — Admin" };

export default function NewPromotionPage() {
  return <PromotionFormClient mode="create" />;
}
