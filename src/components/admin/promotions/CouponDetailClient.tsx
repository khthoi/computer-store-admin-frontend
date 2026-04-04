/**
 * CouponDetailClient — re-uses PromotionDetailClient.
 * Coupons are Promotions with isCoupon = true; all detail logic is shared.
 * The component detects isCoupon and shows code badge + per-customer limit info automatically.
 */
export { PromotionDetailClient as CouponDetailClient } from "./PromotionDetailClient";
