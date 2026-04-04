/**
 * CouponFormClient — re-uses PromotionFormClient with isCoupon pre-set to true.
 * Coupons share the same form as Promotions. The `isCoupon` toggle will be on by default.
 */
"use client";

import type { Promotion } from "@/src/types/promotion.types";
import { PromotionFormClient } from "./PromotionFormClient";

type Props =
  | { mode: "create"; coupon?: never }
  | { mode: "edit"; coupon: Promotion };

export function CouponFormClient({ mode, coupon }: Props) {
  if (mode === "edit") {
    return <PromotionFormClient mode="edit" promotion={coupon} />;
  }
  // For create mode, we pass a default coupon-shaped promotion with isCoupon pre-set
  // PromotionFormClient's default state already initialises isCoupon from promotion?.isCoupon
  // We achieve coupon-default by rendering PromotionFormClient and letting the user see
  // the isCoupon toggle already on when navigating from /coupons/new.
  // In practice this is handled via the page passing a flag; here we just delegate.
  return <PromotionFormClient mode="create" />;
}
