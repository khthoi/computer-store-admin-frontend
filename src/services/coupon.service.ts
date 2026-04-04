/**
 * Coupon service — thin re-export layer over promotion.service.
 * Coupons are Promotions with isCoupon = true.
 * All logic lives in promotion.service.ts and promotionEngine.ts.
 */
export {
  getPromotionById as getCouponById,
  cancelPromotion as deactivateCoupon,
  duplicatePromotion as duplicateCoupon,
  getPromotionUsage as getCouponUsage,
  getPromotionUsageStats as getCouponUsageStats,
  validateCouponCode,
  generateCouponCode,
  createPromotion as createCoupon,
  updatePromotion as updateCoupon,
} from "@/src/services/promotion.service";

export async function getCouponList() {
  const { getPromotionList } = await import("@/src/services/promotion.service");
  return getPromotionList(true);
}
