// ─── Promotion domain types — full spec-compliant ────────────────────────────

// ── Enums ─────────────────────────────────────────────────────────────────────

export type PromotionType =
  | "standard"
  | "bxgy"
  | "bundle"
  | "bulk"
  | "free_shipping";

export type PromotionStatus =
  | "draft"
  | "active"
  | "scheduled"
  | "paused"
  | "ended"
  | "cancelled";

export type StackingPolicy =
  | "exclusive"
  | "stackable"
  | "stackable_with_coupons_only";

export type ScopeType = "global" | "category" | "product" | "variant" | "brand";

export type ConditionType =
  | "min_order_value"
  | "min_item_quantity"
  | "min_item_quantity_per_product"
  | "customer_group"
  | "first_order_only"
  | "required_products"
  | "required_categories"
  | "payment_method"
  | "platform";

export type ConditionOperator =
  | "gte"
  | "lte"
  | "eq"
  | "in"
  | "all_in_cart"
  | "any_in_cart";

export type ActionType =
  | "percentage_discount"
  | "fixed_discount_item"
  | "fixed_discount_cart"
  | "free_item"
  | "bxgy"
  | "bundle_discount"
  | "bulk_discount"
  | "free_shipping";

export type ApplicationLevel = "per_item" | "cart_total" | "cheapest_item";
export type DiscountType = "percentage" | "fixed";
export type DeliveryMode = "auto_add" | "customer_selects";

// ── Sub-structures ─────────────────────────────────────────────────────────────

export interface PromotionScope {
  id: string;
  promotionId: string;
  scopeType: ScopeType;
  /** null when scopeType = 'global' */
  scopeRefId?: string;
  /** Human-readable label for display */
  scopeRefLabel?: string;
}

export interface PromotionCondition {
  id: string;
  promotionId: string;
  type: ConditionType;
  operator: ConditionOperator;
  /** JSON-serialized value: number | string | string[] */
  value: string;
}

export interface BxgyFields {
  /** How many qualifying items must be in cart */
  buyQuantity: number;
  /** null = any product matching scope */
  buyProductId?: string;
  buyProductLabel?: string;
  /** How many free/discounted items the customer receives */
  getQuantity: number;
  /** null = same as buy product */
  getProductId?: string;
  getProductLabel?: string;
  /** 100 = fully free, 50 = half price */
  getDiscountPercent: number;
  deliveryMode: DeliveryMode;
  maxApplicationsPerOrder: number;
  /** Only used when deliveryMode = 'customer_selects' */
  eligibleFreeProductIds?: string[];
}

export interface BulkTier {
  minQuantity: number;
  /** null = no upper bound */
  maxQuantity?: number;
  discountValue: number;
  discountType: DiscountType;
}

export interface BundleComponent {
  id: string;
  scope: "category" | "product" | "variant";
  refId: string;
  refLabel?: string;
  minQuantity: number;
}

export interface PromotionAction {
  id: string;
  promotionId: string;
  actionType: ActionType;
  applicationLevel: ApplicationLevel;
  discountType?: DiscountType;
  discountValue?: number;
  /** Cap the maximum discount (for percentage discounts) */
  maxDiscountAmount?: number;
  /** BXGY-specific fields */
  bxgy?: BxgyFields;
  /** Bundle-specific fields */
  requiredComponents?: BundleComponent[];
  /** Bulk/tiered-specific fields */
  tiers?: BulkTier[];
}

// ── Core entity ────────────────────────────────────────────────────────────────

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: PromotionType;
  /** true = this is a coupon (requires code entry) */
  isCoupon: boolean;
  /** Only set when isCoupon = true */
  code?: string;
  status: PromotionStatus;
  priority: number;
  stackingPolicy: StackingPolicy;
  startDate: string;
  endDate: string;
  /** null = unlimited */
  totalUsageLimit?: number;
  /** null = unlimited per customer */
  perCustomerLimit?: number;
  usageCount: number;
  scopes: PromotionScope[];
  conditions: PromotionCondition[];
  actions: PromotionAction[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Usage audit ────────────────────────────────────────────────────────────────

export interface PromotionUsage {
  id: string;
  promotionId: string;
  customerId: string;
  customerName: string;
  orderId: string;
  discountAmount: number;
  appliedAt: string;
}

// ── Summary (for list table) ───────────────────────────────────────────────────

export interface PromotionSummary {
  id: string;
  name: string;
  type: PromotionType;
  isCoupon: boolean;
  code?: string;
  status: PromotionStatus;
  priority: number;
  stackingPolicy: StackingPolicy;
  startDate: string;
  endDate: string;
  totalUsageLimit?: number;
  perCustomerLimit?: number;
  usageCount: number;
  /** Pre-computed for table display: "Global" | "3 Products" | "Electronics" */
  scopeDisplay: string;
  /** Pre-computed for table display: "20%" | "₫100k off" | "BXGY" */
  discountDisplay: string;
  createdBy: string;
  createdAt: string;
}

// ── Cart types (for promotion engine) ─────────────────────────────────────────

export interface CartLineItem {
  lineId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  categoryId: string;
  brandId?: string;
  unitPrice: number;
  quantity: number;
  isFreeGift?: boolean;
  promotionId?: string;
}

export interface Cart {
  id: string;
  customerId: string;
  customerGroup: "guest" | "registered" | "vip";
  lineItems: CartLineItem[];
  subtotal: number;
  appliedCouponCode?: string;
}

export interface CartAppliedPromotion {
  promotionId: string;
  promotionName: string;
  discountAmount: number;
  affectedLineIds: string[];
  freeItems?: { productId: string; variantId: string; quantity: number; unitPrice: number }[];
  /** Debug: full resolution log */
  resolutionLog?: string;
}

// ── Form payload types ─────────────────────────────────────────────────────────

export interface PromotionFormPayload {
  name: string;
  description?: string;
  type: PromotionType;
  isCoupon: boolean;
  code?: string;
  status: PromotionStatus;
  priority: number;
  stackingPolicy: StackingPolicy;
  startDate: string;
  endDate: string;
  totalUsageLimit?: number;
  perCustomerLimit?: number;
  scopes: Omit<PromotionScope, "id" | "promotionId">[];
  conditions: Omit<PromotionCondition, "id" | "promotionId">[];
  actions: Omit<PromotionAction, "id" | "promotionId">[];
}
