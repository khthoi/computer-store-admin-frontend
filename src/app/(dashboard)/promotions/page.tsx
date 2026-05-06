export const dynamic = "force-dynamic";

import { getPromotionList } from "@/src/services/promotion.service";
import { PromotionsListClient } from "@/src/components/admin/promotions/PromotionsListClient";

const PAGE_SIZE = 10;

export default async function PromotionsPage() {
  const [promoResult, couponResult] = await Promise.all([
    getPromotionList({ page: 1, limit: PAGE_SIZE, isCoupon: false }),
    getPromotionList({ page: 1, limit: PAGE_SIZE, isCoupon: true }),
  ]);

  return (
    <div className="p-6 space-y-4">
      <PromotionsListClient
        initialPromos={promoResult.data}
        initialPromoTotal={promoResult.total}
        initialCoupons={couponResult.data}
        initialCouponTotal={couponResult.total}
      />
    </div>
  );
}
