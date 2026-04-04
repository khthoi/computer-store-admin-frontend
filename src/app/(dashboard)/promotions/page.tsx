export const dynamic = "force-dynamic";

import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import { getPromotionList } from "@/src/services/promotion.service";
import { PromotionsListClient } from "@/src/components/admin/promotions/PromotionsListClient";

export default async function PromotionsPage() {
  const all = await getPromotionList();
  return (
    <div className="p-6 space-y-4">
      <PromotionsListClient initialPromotions={all} />
    </div>
  );
}
