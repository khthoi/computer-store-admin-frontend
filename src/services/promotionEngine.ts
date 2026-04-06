/**
 * Promotion Engine — pure functions, no side effects, no I/O.
 *
 * Flow: filterByScope → evaluateConditions → calculateDiscount → applyStackingPolicy
 */
import type {
  Promotion,
  Cart,
  CartLineItem,
  CartAppliedPromotion,
  PromotionCondition,
  PromotionScope,
  BulkTier,
} from "@/src/types/promotion.types";

// ─── Scope filtering ──────────────────────────────────────────────────────────

/**
 * Filter cart line items to only those covered by the promotion's scopes.
 * Returns ALL items if scope is global. Returns [] if no items match (promotion ineligible).
 */
export function filterByScope(
  promotion: Promotion,
  cartItems: CartLineItem[]
): CartLineItem[] {
  const scopes = promotion.scopes;
  if (scopes.length === 0) return cartItems; // no scopes → treat as global
  if (scopes.some((s) => s.scopeType === "global")) return cartItems;

  return cartItems.filter((item) =>
    scopes.some((scope) => {
      switch (scope.scopeType) {
        case "category": return item.categoryId === scope.scopeRefId;
        case "product":  return item.productId === scope.scopeRefId;
        case "variant":  return item.variantId === scope.scopeRefId;
        case "brand":    return item.brandId === scope.scopeRefId;
        default:         return false;
      }
    })
  );
}

// ─── Condition evaluation ─────────────────────────────────────────────────────

function parseValue(raw: string): unknown {
  try { return JSON.parse(raw); } catch { return raw; }
}

/**
 * Evaluate a single condition against the cart + customer context.
 * Returns true if the condition is satisfied.
 */
export function evaluateCondition(
  condition: PromotionCondition,
  eligibleItems: CartLineItem[],
  cart: Cart,
  customerUsageCount: number,
  promotion: Promotion
): boolean {
  const val = parseValue(condition.value);

  switch (condition.type) {
    case "min_order_value": {
      const subtotal = eligibleItems.reduce(
        (s, i) => s + i.unitPrice * i.quantity,
        0
      );
      return subtotal >= Number(val);
    }
    case "min_item_quantity": {
      const qty = eligibleItems
        .filter((i) => !i.isFreeGift)
        .reduce((s, i) => s + i.quantity, 0);
      return qty >= Number(val);
    }
    case "min_item_quantity_per_product": {
      const { productId, qty } = val as { productId: string; qty: number };
      const found = cart.lineItems
        .filter((i) => i.productId === productId && !i.isFreeGift)
        .reduce((s, i) => s + i.quantity, 0);
      return found >= qty;
    }
    case "customer_group": {
      const groups = val as string[];
      return groups.includes(cart.customerGroup);
    }
    case "first_order_only": {
      // In a real system, check order history. Mock: always false (has history)
      return false;
    }
    case "required_products": {
      const productIds = val as string[];
      return productIds.every((pid) =>
        cart.lineItems.some((i) => i.productId === pid && !i.isFreeGift)
      );
    }
    case "required_categories": {
      const catIds = val as string[];
      return catIds.some((cid) =>
        cart.lineItems.some((i) => i.categoryId === cid && !i.isFreeGift)
      );
    }
    case "payment_method":
    case "platform": {
      // Not evaluatable at cart time — defer to checkout
      return true;
    }
    default:
      return true;
  }
}

/**
 * Evaluate ALL conditions for a promotion (AND logic).
 * Also checks: date range, status, global usage limit, per-customer limit.
 */
export function evaluateConditions(
  promotion: Promotion,
  eligibleItems: CartLineItem[],
  cart: Cart,
  customerUsageCount: number
): boolean {
  // Date range
  const now = new Date().toISOString().slice(0, 10);
  if (now < promotion.startDate || now > promotion.endDate) return false;

  // Status — also treat "scheduled" as active once the start date has been reached
  const effectivelyActive =
    promotion.status === "active" ||
    (promotion.status === "scheduled" && now >= promotion.startDate);
  if (!effectivelyActive) return false;

  // Global usage limit
  if (
    promotion.totalUsageLimit !== undefined &&
    promotion.usageCount >= promotion.totalUsageLimit
  ) return false;

  // Per-customer limit
  if (
    promotion.perCustomerLimit !== undefined &&
    customerUsageCount >= promotion.perCustomerLimit
  ) return false;

  // All explicit conditions (AND)
  return promotion.conditions.every((c) =>
    evaluateCondition(c, eligibleItems, cart, customerUsageCount, promotion)
  );
}

// ─── Discount calculators ─────────────────────────────────────────────────────

/**
 * Calculate the discount amount for a standard promotion action.
 */
export function calculateStandardDiscount(
  promotion: Promotion,
  eligibleItems: CartLineItem[]
): number {
  const action = promotion.actions[0];
  if (!action) return 0;

  const eligibleSubtotal = eligibleItems
    .filter((i) => !i.isFreeGift)
    .reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  switch (action.actionType) {
    case "percentage_discount": {
      const raw = eligibleSubtotal * ((action.discountValue ?? 0) / 100);
      return action.maxDiscountAmount ? Math.min(raw, action.maxDiscountAmount) : raw;
    }
    case "fixed_discount_item": {
      const count = eligibleItems
        .filter((i) => !i.isFreeGift)
        .reduce((s, i) => s + i.quantity, 0);
      return count * (action.discountValue ?? 0);
    }
    case "fixed_discount_cart":
      return Math.min(action.discountValue ?? 0, eligibleSubtotal);
    case "free_shipping":
      return 0; // shipping discount handled separately
    default:
      return 0;
  }
}

/**
 * Calculate discount for a BXGY promotion.
 * Returns the monetary value of the free/discounted items.
 */
export function resolveBxgy(
  promotion: Promotion,
  eligibleItems: CartLineItem[]
): { discountAmount: number; freeItems: CartAppliedPromotion["freeItems"] } {
  const action = promotion.actions[0];
  const bxgy = action?.bxgy;
  if (!bxgy) return { discountAmount: 0, freeItems: [] };

  const paidItems = eligibleItems.filter((i) => !i.isFreeGift);

  // Count qualifying buy-side items
  const buyItems = bxgy.buyProductId
    ? paidItems.filter((i) => i.productId === bxgy.buyProductId)
    : paidItems;

  const buyQtyTotal = buyItems.reduce((s, i) => s + i.quantity, 0);
  if (buyQtyTotal < bxgy.buyQuantity) return { discountAmount: 0, freeItems: [] };

  // How many sets can be satisfied?
  const rawSets = Math.floor(buyQtyTotal / bxgy.buyQuantity);
  const sets = Math.min(rawSets, bxgy.maxApplicationsPerOrder);
  const freeQty = sets * bxgy.getQuantity;

  const isSameProduct =
    !bxgy.getProductId || bxgy.getProductId === bxgy.buyProductId;

  if (isSameProduct) {
    // Discount the cheapest eligible items
    const sorted = [...buyItems].sort((a, b) => a.unitPrice - b.unitPrice);
    let remaining = freeQty;
    let discount = 0;
    for (const item of sorted) {
      if (remaining <= 0) break;
      const apply = Math.min(remaining, item.quantity);
      discount += item.unitPrice * apply * (bxgy.getDiscountPercent / 100);
      remaining -= apply;
    }
    return { discountAmount: discount, freeItems: [] };
  }

  // Different product — add as free line item
  const freeProductPrice = 0; // price of free item (will be deducted from cart)
  const discount = freeQty * freeProductPrice * (bxgy.getDiscountPercent / 100);

  return {
    discountAmount: discount,
    freeItems: [
      {
        productId: bxgy.getProductId!,
        variantId: bxgy.getProductId!,
        quantity: freeQty,
        unitPrice: 0,
      },
    ],
  };
}

/**
 * Calculate discount for a bundle promotion.
 */
export function resolveBundle(
  promotion: Promotion,
  eligibleItems: CartLineItem[]
): number {
  const action = promotion.actions[0];
  const components = action?.requiredComponents ?? [];
  if (components.length === 0) return 0;

  const paidItems = eligibleItems.filter((i) => !i.isFreeGift);

  // Check every component is satisfied
  const satisfied = components.every((comp) => {
    return paidItems.some((item) => {
      if (comp.scope === "product")  return item.productId === comp.refId;
      if (comp.scope === "variant")  return item.variantId === comp.refId;
      if (comp.scope === "category") return item.categoryId === comp.refId;
      return false;
    });
  });

  if (!satisfied) return 0;

  // Calculate discount on matched items
  const matchedItems = components.flatMap((comp) =>
    paidItems.filter((item) => {
      if (comp.scope === "product")  return item.productId === comp.refId;
      if (comp.scope === "variant")  return item.variantId === comp.refId;
      if (comp.scope === "category") return item.categoryId === comp.refId;
      return false;
    })
  );

  // Deduplicate matched items
  const seen = new Set<string>();
  const dedupedItems = matchedItems.filter((i) => {
    if (seen.has(i.lineId)) return false;
    seen.add(i.lineId);
    return true;
  });

  const bundleSubtotal = dedupedItems.reduce(
    (s, i) => s + i.unitPrice * Math.min(i.quantity, 1),
    0
  );

  if (action.discountType === "percentage") {
    return bundleSubtotal * ((action.discountValue ?? 0) / 100);
  }
  return Math.min(action.discountValue ?? 0, bundleSubtotal);
}

/**
 * Find the applicable bulk tier and return the discount amount.
 */
export function resolveBulk(
  promotion: Promotion,
  eligibleItems: CartLineItem[]
): number {
  const action = promotion.actions[0];
  const tiers = action?.tiers ?? [];
  if (tiers.length === 0) return 0;

  const paidItems = eligibleItems.filter((i) => !i.isFreeGift);
  const totalQty = paidItems.reduce((s, i) => s + i.quantity, 0);

  // Find highest applicable tier
  const activeTier = [...tiers]
    .sort((a, b) => b.minQuantity - a.minQuantity)
    .find(
      (t) =>
        totalQty >= t.minQuantity &&
        (t.maxQuantity === undefined || totalQty <= t.maxQuantity)
    );

  if (!activeTier) return 0;

  const subtotal = paidItems.reduce(
    (s, i) => s + i.unitPrice * i.quantity,
    0
  );

  if (activeTier.discountType === "percentage") {
    return subtotal * (activeTier.discountValue / 100);
  }
  // fixed: per item
  return totalQty * activeTier.discountValue;
}

/**
 * Calculate the total discount value for any promotion type.
 */
export function calculateDiscount(
  promotion: Promotion,
  eligibleItems: CartLineItem[]
): { discountAmount: number; freeItems: CartAppliedPromotion["freeItems"] } {
  switch (promotion.type) {
    case "bxgy":
      return resolveBxgy(promotion, eligibleItems);
    case "bundle": {
      return { discountAmount: resolveBundle(promotion, eligibleItems), freeItems: [] };
    }
    case "bulk": {
      return { discountAmount: resolveBulk(promotion, eligibleItems), freeItems: [] };
    }
    default:
      return { discountAmount: calculateStandardDiscount(promotion, eligibleItems), freeItems: [] };
  }
}

// ─── Stacking policy ──────────────────────────────────────────────────────────

interface EligiblePromotion {
  promotion: Promotion;
  eligibleItems: CartLineItem[];
  discountAmount: number;
  freeItems: CartAppliedPromotion["freeItems"];
}

/**
 * Apply stacking policy rules and return the final set of promotions to apply.
 * Input list should already be sorted by priority DESC.
 */
export function applyStackingPolicy(
  candidates: EligiblePromotion[]
): EligiblePromotion[] {
  if (candidates.length === 0) return [];

  const result: EligiblePromotion[] = [];
  let exclusiveApplied = false;
  let couponApplied = false;
  let couponOnlyModeActive = false; // true once a stackable_with_coupons_only is applied

  // Sort: priority DESC, then discount DESC
  const sorted = [...candidates].sort((a, b) => {
    if (b.promotion.priority !== a.promotion.priority) {
      return b.promotion.priority - a.promotion.priority;
    }
    return b.discountAmount - a.discountAmount;
  });

  for (const candidate of sorted) {
    const { promotion } = candidate;

    // Skip if exclusive already locked everything
    if (exclusiveApplied) break;

    if (promotion.stackingPolicy === "exclusive") {
      result.push(candidate);
      exclusiveApplied = true;
      break;
    }

    if (promotion.isCoupon) {
      // Only one coupon per order
      if (couponApplied) continue;
      // In coupon-only mode, accept the coupon
      result.push(candidate);
      couponApplied = true;
      continue;
    }

    if (promotion.stackingPolicy === "stackable_with_coupons_only") {
      result.push(candidate);
      couponOnlyModeActive = true;
      continue;
    }

    if (promotion.stackingPolicy === "stackable") {
      // If we're in coupon-only mode and this is NOT a coupon, skip
      if (couponOnlyModeActive) continue;
      result.push(candidate);
    }
  }

  return result;
}

// ─── Full cart evaluation pipeline ────────────────────────────────────────────

/**
 * Top-level engine function. Evaluates all promotions against the cart.
 * Returns the final list of applied promotions after stacking rules.
 *
 * @param promotions - All active promotions to consider
 * @param cart - Current cart state
 * @param customerUsageCounts - Map of promotionId → count of times this customer used it
 */
export function evaluateCartPromotions(
  promotions: Promotion[],
  cart: Cart,
  customerUsageCounts: Record<string, number>
): CartAppliedPromotion[] {
  const candidates: EligiblePromotion[] = [];

  for (const promotion of promotions) {
    try {
      // Step 1: scope filter
      const eligible = filterByScope(promotion, cart.lineItems);
      if (eligible.length === 0) continue;

      // Step 2: condition check
      const usageCount = customerUsageCounts[promotion.id] ?? 0;
      if (!evaluateConditions(promotion, eligible, cart, usageCount)) continue;

      // Step 3: calculate discount
      const { discountAmount, freeItems } = calculateDiscount(promotion, eligible);
      if (discountAmount === 0 && (freeItems?.length ?? 0) === 0) continue;

      candidates.push({
        promotion,
        eligibleItems: eligible,
        discountAmount,
        freeItems: freeItems ?? [],
      });
    } catch (err) {
      // Graceful degradation: log and skip, never crash cart
      console.error(`[PromotionEngine] Error evaluating ${promotion.id}:`, err);
    }
  }

  // Step 4: stacking policy
  const applied = applyStackingPolicy(candidates);

  // Step 5: build result
  return applied.map((a) => ({
    promotionId: a.promotion.id,
    promotionName: a.promotion.name,
    discountAmount: a.discountAmount,
    affectedLineIds: a.eligibleItems.map((i) => i.lineId),
    freeItems: a.freeItems,
    resolutionLog: `priority=${a.promotion.priority} policy=${a.promotion.stackingPolicy} discount=${a.discountAmount}`,
  }));
}
