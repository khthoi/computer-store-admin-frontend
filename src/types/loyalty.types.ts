// ─── Loyalty domain types ────────────────────────────────────────────────────

export type LoyaltyTransactionType = "earn" | "redeem" | "expire" | "adjust";
export type LoyaltyRedemptionStatus = "completed" | "cancelled" | "expired";

// ONE debit/credit event on a customer's point balance
export interface LoyaltyPointTransaction {
  id: string;
  customerId: string;
  type: LoyaltyTransactionType;
  points: number;           // positive = earn, negative = spend/expire
  balanceBefore: number;
  balanceAfter: number;
  description: string;      // "Order #ORD-001 completed", "Redeemed for SUMMER20"
  referenceType?: "order" | "redemption" | "manual";
  referenceId?: string;     // orderId or redemptionId
  createdAt: string;
}

// Admin-configurable catalog item: "spend N points → get coupon X"
export interface LoyaltyRedemptionCatalog {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  promotionId: string;        // FK → Promotion (is_coupon=TRUE only)
  promotionCode?: string;     // denormalized snapshot
  promotionName?: string;     // denormalized snapshot
  discountDisplay?: string;   // "50,000₫ off" or "10% off"
  isActive: boolean;
  stockLimit?: number;        // null = unlimited
  redeemedCount: number;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

// ONE redemption transaction: customer spent points → received coupon
export interface LoyaltyRedemption {
  id: string;
  customerId: string;
  customerName?: string;
  catalogItemId: string;
  catalogItemName: string;
  pointsSpent: number;
  couponCode: string;         // snapshot of code at time of redemption
  promotionId: string;
  status: LoyaltyRedemptionStatus;
  redeemedAt: string;
  usedAt?: string;            // when coupon was used in an order
  orderId?: string;           // which order used it
}

// Summary card data for customer detail page
export interface CustomerLoyaltySummary {
  currentBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  totalRedemptions: number;
  pendingPoints?: number;     // from recent unconfirmed orders
}

// Form payload for creating/updating a catalog item
export interface LoyaltyRedemptionCatalogPayload {
  name: string;
  description?: string;
  pointsRequired: number;
  promotionId: string;
  isActive: boolean;
  stockLimit?: number;
  validFrom?: string;
  validUntil?: string;
}

// ─── Earn Rules ───────────────────────────────────────────────────────────────

export type EarnRuleScope = "global" | "category" | "brand";
export type EarnRuleBonusTrigger = "first_order" | "birthday" | "manual";

export interface LoyaltyEarnRuleScopeEntry {
  id: string;
  ruleId: string;
  scopeType: "category" | "brand";
  scopeRefId: string;
  scopeRefLabel: string;
  multiplier: number; // e.g. 2.0 = 2x points
}

export interface LoyaltyEarnRule {
  id: string;
  name: string;
  description?: string;
  // Base rate
  pointsPerUnit: number;       // điểm cấp mỗi đơn vị
  spendPerUnit: number;        // số tiền (VND) tương ứng 1 đơn vị (ví dụ 10000)
  // Constraints
  minOrderValue?: number;      // đơn tối thiểu để được tích điểm
  maxPointsPerOrder?: number;  // trần điểm mỗi đơn
  // Bonus
  bonusTrigger?: EarnRuleBonusTrigger;
  bonusPoints?: number;
  // Scope multipliers
  scopes: LoyaltyEarnRuleScopeEntry[];
  // Meta
  isActive: boolean;
  priority: number;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyEarnRulePayload {
  name: string;
  description?: string;
  pointsPerUnit: number;
  spendPerUnit: number;
  minOrderValue?: number;
  maxPointsPerOrder?: number;
  bonusTrigger?: EarnRuleBonusTrigger;
  bonusPoints?: number;
  scopes: Omit<LoyaltyEarnRuleScopeEntry, "id" | "ruleId">[];
  isActive: boolean;
  priority: number;
  validFrom?: string;
  validUntil?: string;
}
