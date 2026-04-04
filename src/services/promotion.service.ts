import {
  MOCK_PROMOTIONS,
  MOCK_PROMOTION_SUMMARIES,
  MOCK_PROMOTION_USAGE,
} from "@/src/app/(dashboard)/promotions/_mock";
import type {
  Promotion,
  PromotionSummary,
  PromotionUsage,
  PromotionFormPayload,
  PromotionStatus,
  Cart,
  CartAppliedPromotion,
} from "@/src/types/promotion.types";
import { evaluateCartPromotions } from "@/src/services/promotionEngine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeScopeDisplay(p: Promotion): string {
  if (p.scopes.length === 0 || p.scopes.some((s) => s.scopeType === "global")) return "Global";
  const first = p.scopes[0];
  if (p.scopes.length === 1) return first.scopeRefLabel ?? first.scopeRefId ?? "Custom";
  return `${p.scopes.length} scopes`;
}

function makeDiscountDisplay(p: Promotion): string {
  if (p.type === "bxgy") return "Buy X Get Y";
  if (p.type === "bundle") return "Bundle Deal";
  if (p.type === "bulk") return "Bulk Tiered";
  if (p.type === "free_shipping") return "Free Shipping";
  const action = p.actions[0];
  if (!action) return "—";
  if (action.discountType === "percentage") return `${action.discountValue}% off`;
  if (action.discountType === "fixed") {
    const v = action.discountValue ?? 0;
    return v >= 1_000_000 ? `₫${(v / 1_000_000).toFixed(1)}M off` : `₫${(v / 1_000).toFixed(0)}k off`;
  }
  return "—";
}

function toSummary(p: Promotion): PromotionSummary {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    isCoupon: p.isCoupon,
    code: p.code,
    status: p.status,
    priority: p.priority,
    stackingPolicy: p.stackingPolicy,
    startDate: p.startDate,
    endDate: p.endDate,
    totalUsageLimit: p.totalUsageLimit,
    perCustomerLimit: p.perCustomerLimit,
    usageCount: p.usageCount,
    scopeDisplay: makeScopeDisplay(p),
    discountDisplay: makeDiscountDisplay(p),
    createdBy: p.createdBy,
    createdAt: p.createdAt,
  };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getPromotionList(
  onlyCoupons?: boolean
): Promise<PromotionSummary[]> {
  await delay();
  const list = onlyCoupons === true
    ? MOCK_PROMOTION_SUMMARIES.filter((p) => p.isCoupon)
    : onlyCoupons === false
    ? MOCK_PROMOTION_SUMMARIES.filter((p) => !p.isCoupon)
    : [...MOCK_PROMOTION_SUMMARIES];
  return list;
}

export async function getPromotionById(id: string): Promise<Promotion | null> {
  await delay();
  return MOCK_PROMOTIONS.find((p) => p.id === id) ?? null;
}

export async function createPromotion(
  payload: PromotionFormPayload
): Promise<Promotion> {
  await delay(600);

  // Validate unique coupon code
  if (payload.isCoupon && payload.code) {
    const existing = MOCK_PROMOTIONS.find(
      (p) => p.code?.toUpperCase() === payload.code!.toUpperCase()
    );
    if (existing) throw new Error(`Coupon code "${payload.code}" already exists.`);
  }

  const now = new Date().toISOString();
  const id = `PROMO-${String(MOCK_PROMOTIONS.length + 1).padStart(3, "0")}`;

  const newPromotion: Promotion = {
    ...payload,
    id,
    code: payload.isCoupon ? payload.code?.toUpperCase() : undefined,
    usageCount: 0,
    scopes: payload.scopes.map((s, i) => ({ ...s, id: `S-${id}-${i}`, promotionId: id })),
    conditions: payload.conditions.map((c, i) => ({ ...c, id: `C-${id}-${i}`, promotionId: id })),
    actions: payload.actions.map((a, i) => ({ ...a, id: `A-${id}-${i}`, promotionId: id })),
    createdBy: "Admin",
    createdAt: now,
    updatedAt: now,
  };

  MOCK_PROMOTIONS.push(newPromotion);
  MOCK_PROMOTION_SUMMARIES.push(toSummary(newPromotion));
  return newPromotion;
}

export async function updatePromotion(
  id: string,
  payload: Partial<PromotionFormPayload>
): Promise<Promotion> {
  await delay(600);
  const idx = MOCK_PROMOTIONS.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error(`Promotion ${id} not found.`);

  const existing = MOCK_PROMOTIONS[idx];

  // Validate unique coupon code on update
  if (payload.code) {
    const conflict = MOCK_PROMOTIONS.find(
      (p) => p.id !== id && p.code?.toUpperCase() === payload.code!.toUpperCase()
    );
    if (conflict) throw new Error(`Coupon code "${payload.code}" already exists.`);
  }

  const updated: Promotion = {
    ...existing,
    ...payload,
    id,
    code: payload.isCoupon ?? existing.isCoupon ? (payload.code ?? existing.code)?.toUpperCase() : undefined,
    scopes: payload.scopes
      ? payload.scopes.map((s, i) => ({ ...s, id: `S-${id}-${i}`, promotionId: id }))
      : existing.scopes,
    conditions: payload.conditions
      ? payload.conditions.map((c, i) => ({ ...c, id: `C-${id}-${i}`, promotionId: id }))
      : existing.conditions,
    actions: payload.actions
      ? payload.actions.map((a, i) => ({ ...a, id: `A-${id}-${i}`, promotionId: id }))
      : existing.actions,
    updatedAt: new Date().toISOString(),
  };

  MOCK_PROMOTIONS[idx] = updated;
  const sumIdx = MOCK_PROMOTION_SUMMARIES.findIndex((p) => p.id === id);
  if (sumIdx !== -1) MOCK_PROMOTION_SUMMARIES[sumIdx] = toSummary(updated);

  return updated;
}

export async function setPromotionStatus(
  id: string,
  status: PromotionStatus
): Promise<Promotion> {
  return updatePromotion(id, { status });
}

export async function cancelPromotion(id: string): Promise<Promotion> {
  return setPromotionStatus(id, "cancelled");
}

export async function pausePromotion(id: string): Promise<Promotion> {
  return setPromotionStatus(id, "paused");
}

export async function activatePromotion(id: string): Promise<Promotion> {
  return setPromotionStatus(id, "active");
}

export async function duplicatePromotion(id: string): Promise<Promotion> {
  await delay();
  const original = MOCK_PROMOTIONS.find((p) => p.id === id);
  if (!original) throw new Error(`Promotion ${id} not found.`);

  return createPromotion({
    name: `${original.name} (Copy)`,
    description: original.description,
    type: original.type,
    isCoupon: original.isCoupon,
    code: undefined, // always clear code on duplicate
    status: "draft",
    priority: original.priority,
    stackingPolicy: original.stackingPolicy,
    startDate: original.startDate,
    endDate: original.endDate,
    totalUsageLimit: original.totalUsageLimit,
    perCustomerLimit: original.perCustomerLimit,
    scopes: original.scopes.map(({ id: _, promotionId: __, ...rest }) => rest),
    conditions: original.conditions.map(({ id: _, promotionId: __, ...rest }) => rest),
    actions: original.actions.map(({ id: _, promotionId: __, ...rest }) => rest),
  });
}

// ─── Usage / Analytics ────────────────────────────────────────────────────────

export async function getPromotionUsage(id: string): Promise<PromotionUsage[]> {
  await delay(300);
  return MOCK_PROMOTION_USAGE.filter((u) => u.promotionId === id);
}

export async function getPromotionUsageStats(id: string): Promise<{
  totalUses: number;
  totalDiscount: number;
  uniqueCustomers: number;
}> {
  const usage = await getPromotionUsage(id);
  return {
    totalUses: usage.length,
    totalDiscount: usage.reduce((s, u) => s + u.discountAmount, 0),
    uniqueCustomers: new Set(usage.map((u) => u.customerId)).size,
  };
}

// ─── Engine integration ────────────────────────────────────────────────────────

export async function evaluateCart(
  cart: Cart,
  customerUsageCounts: Record<string, number>
): Promise<CartAppliedPromotion[]> {
  await delay(100);
  const activePromotions = MOCK_PROMOTIONS.filter((p) => p.status === "active");
  try {
    return evaluateCartPromotions(activePromotions, cart, customerUsageCounts);
  } catch (err) {
    console.error("[promotion.service] evaluateCart error:", err);
    return []; // graceful degradation
  }
}

export async function validateCouponCode(
  code: string,
  cart: Cart,
  customerUsageCounts: Record<string, number>
): Promise<{ valid: boolean; promotion?: Promotion; reason?: string }> {
  await delay(300);
  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z0-9_-]+$/.test(normalized)) {
    return { valid: false, reason: "Invalid coupon code format." };
  }

  const promotion = MOCK_PROMOTIONS.find(
    (p) => p.isCoupon && p.code?.toUpperCase() === normalized
  );

  if (!promotion) {
    return { valid: false, reason: "Coupon code not found." };
  }
  if (promotion.status !== "active") {
    return { valid: false, reason: `Coupon is ${promotion.status}.` };
  }

  const now = new Date().toISOString().slice(0, 10);
  if (now < promotion.startDate) return { valid: false, reason: "Coupon is not yet active." };
  if (now > promotion.endDate)   return { valid: false, reason: "Coupon has expired." };

  if (promotion.totalUsageLimit !== undefined && promotion.usageCount >= promotion.totalUsageLimit) {
    return { valid: false, reason: "Coupon usage limit has been reached." };
  }

  const customerUses = customerUsageCounts[promotion.id] ?? 0;
  if (promotion.perCustomerLimit !== undefined && customerUses >= promotion.perCustomerLimit) {
    return { valid: false, reason: "You have already used this coupon the maximum number of times." };
  }

  return { valid: true, promotion };
}

// ─── Coupon helpers ────────────────────────────────────────────────────────────

export function generateCouponCode(prefix = "", length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const rand = Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
  return prefix ? `${prefix.toUpperCase()}-${rand}` : rand;
}
