// ─── Coupon domain types ─────────────────────────────────────────────────────

export type CouponDiscountType = "percentage" | "fixed";

export type CouponStatus = "active" | "inactive" | "expired";

export interface Coupon {
  id: string;
  /** Unique uppercase code the customer enters at checkout, e.g. "SUMMER20" */
  code: string;
  discountType: CouponDiscountType;
  discountValue: number;
  /** Cap for percentage coupons — max VND discount regardless of order size */
  maxDiscountAmount?: number;
  minOrderValue?: number;
  /** undefined = unlimited total uses */
  totalUsageLimit?: number;
  /** Max uses per individual customer */
  perCustomerLimit?: number;
  usageCount: number;
  status: CouponStatus;
  /** ISO date string "YYYY-MM-DD" */
  startDate: string;
  expiryDate: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponSummary
  extends Pick<
    Coupon,
    | "id"
    | "code"
    | "discountType"
    | "discountValue"
    | "maxDiscountAmount"
    | "status"
    | "expiryDate"
    | "usageCount"
    | "totalUsageLimit"
    | "createdBy"
    | "createdAt"
  > {}
