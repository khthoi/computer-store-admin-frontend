import { apiFetch } from "@/src/services/api";
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

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export interface GetPromotionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  isCoupon?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getPromotionList(
  params: GetPromotionsParams = {}
): Promise<{ data: PromotionSummary[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set("page", String(params.page));
  if (params.limit)     qs.set("limit", String(params.limit));
  if (params.search)    qs.set("search", params.search);
  if (params.status)    qs.set("status", params.status);
  if (params.type)      qs.set("type", params.type);
  if (params.isCoupon !== undefined) qs.set("isCoupon", String(params.isCoupon));
  if (params.sortBy)    qs.set("sortBy", params.sortBy);
  if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
  const result = await apiFetch<{ data: PromotionSummary[]; total: number; page: number; limit: number; totalPages: number }>(
    `/admin/promotions?${qs}`
  );
  return { data: result?.data ?? [], total: result?.total ?? 0, totalPages: result?.totalPages ?? 1 };
}

export async function getPromotionById(
  id: string
): Promise<Promotion | null> {
  try {
    return await apiFetch<Promotion>(`/admin/promotions/${id}`);
  } catch {
    return null;
  }
}

export async function createPromotion(
  payload: PromotionFormPayload
): Promise<Promotion> {
  return apiFetch<Promotion>("/admin/promotions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePromotion(
  id: string,
  payload: Partial<PromotionFormPayload>
): Promise<Promotion> {
  return apiFetch<Promotion>(`/admin/promotions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function setPromotionStatus(
  id: string,
  status: PromotionStatus
): Promise<Promotion> {
  return apiFetch<Promotion>(`/admin/promotions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
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
  return apiFetch<Promotion>(`/admin/promotions/${id}/duplicate`, {
    method: "POST",
  });
}

export async function deletePromotion(id: string): Promise<void> {
  await apiFetch<void>(`/admin/promotions/${id}`, { method: "DELETE" });
}

// ─── Usage / Analytics ────────────────────────────────────────────────────────

export async function getPromotionUsage(id: string): Promise<PromotionUsage[]> {
  return apiFetch<PromotionUsage[]>(`/admin/promotions/${id}/usages`);
}

export async function getPromotionUsageStats(id: string): Promise<{
  totalUses: number;
  totalDiscount: number;
  uniqueCustomers: number;
}> {
  return apiFetch(`/admin/promotions/${id}/usage-stats`);
}

// ─── Engine integration (client-side only — not wired to admin API) ────────────

export async function evaluateCart(
  cart: Cart,
  customerUsageCounts: Record<string, number>
): Promise<CartAppliedPromotion[]> {
  // Requires active promotions from backend; fall back to empty if unavailable
  try {
    const result = await apiFetch<{ data: Promotion[] }>("/admin/promotions?status=active&limit=200");
    const activePromotions = result.data ?? [];
    return evaluateCartPromotions(activePromotions, cart, customerUsageCounts);
  } catch (err) {
    console.error("[promotion.service] evaluateCart error:", err);
    return [];
  }
}

export async function validateCouponCode(
  code: string,
  cart: Cart,
  customerUsageCounts: Record<string, number>
): Promise<{ valid: boolean; promotion?: Promotion; reason?: string }> {
  const normalized = code.trim().toUpperCase();

  if (!/^[A-Z0-9_-]+$/.test(normalized)) {
    return { valid: false, reason: "Invalid coupon code format." };
  }

  try {
    const result = await apiFetch<{ data: Promotion[] }>(
      `/admin/promotions?status=active&isCoupon=true&limit=200`
    );
    const promotion = (result.data ?? []).find(
      (p) => p.isCoupon && p.code?.toUpperCase() === normalized
    );

    if (!promotion) return { valid: false, reason: "Coupon code not found." };
    if (promotion.status !== "active") return { valid: false, reason: `Coupon is ${promotion.status}.` };

    const now = new Date().toISOString().slice(0, 10);
    if (now < promotion.startDate) return { valid: false, reason: "Coupon is not yet active." };
    if (now > promotion.endDate) return { valid: false, reason: "Coupon has expired." };

    if (promotion.totalUsageLimit !== undefined && promotion.usageCount >= promotion.totalUsageLimit) {
      return { valid: false, reason: "Coupon usage limit has been reached." };
    }

    const customerUses = customerUsageCounts[promotion.id] ?? 0;
    if (promotion.perCustomerLimit !== undefined && customerUses >= promotion.perCustomerLimit) {
      return { valid: false, reason: "You have already used this coupon the maximum number of times." };
    }

    return { valid: true, promotion };
  } catch {
    return { valid: false, reason: "Unable to validate coupon at this time." };
  }
}

// ─── Coupon code generation ────────────────────────────────────────────────────

export async function generateCouponCodeFromApi(): Promise<{ code: string; cooldownMs: number }> {
  return apiFetch<{ code: string; cooldownMs: number }>("/admin/promotions/generate-code", {
    method: "POST",
  });
}

export async function getCouponCodeCooldown(): Promise<{ remainingMs: number }> {
  return apiFetch<{ remainingMs: number }>("/admin/promotions/generate-code/cooldown");
}
