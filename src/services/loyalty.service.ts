import { apiFetch } from "@/src/services/api";
import type {
  LoyaltyPointTransaction,
  LoyaltyRedemptionCatalog,
  LoyaltyRedemption,
  CustomerLoyaltySummary,
  LoyaltyRedemptionCatalogPayload,
  LoyaltyEarnRule,
  LoyaltyEarnRulePayload,
  MembershipTier,
  MembershipTierPayload,
} from "@/src/types/loyalty.types";

// ─── Membership Tiers ─────────────────────────────────────────────────────────

export async function getMembershipTiers(activeOnly = true): Promise<MembershipTier[]> {
  const qs = new URLSearchParams({ limit: "100" });
  if (activeOnly) qs.set("activeOnly", "true");
  const result = await apiFetch<{ data: MembershipTier[]; total: number; totalPages: number }>(
    `/admin/loyalty/tiers?${qs}`
  );
  return result?.data ?? [];
}

export async function getMembershipTiersAdmin(
  page = 1,
  limit?: number,
  search?: string,
): Promise<{ data: MembershipTier[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams({ page: String(page) });
  if (limit) qs.set("limit", String(limit));
  if (search) qs.set("search", search);
  const result = await apiFetch<{ data: MembershipTier[]; total: number; totalPages: number }>(
    `/admin/loyalty/tiers?${qs}`
  );
  return result ?? { data: [], total: 0, totalPages: 1 };
}

export async function getMembershipTierById(id: number): Promise<MembershipTier> {
  return apiFetch<MembershipTier>(`/admin/loyalty/tiers/${id}`);
}

export async function createMembershipTier(payload: MembershipTierPayload): Promise<MembershipTier> {
  return apiFetch<MembershipTier>("/admin/loyalty/tiers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateMembershipTier(
  id: number,
  payload: Partial<MembershipTierPayload>,
): Promise<MembershipTier> {
  return apiFetch<MembershipTier>(`/admin/loyalty/tiers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteMembershipTier(id: number): Promise<void> {
  await apiFetch<void>(`/admin/loyalty/tiers/${id}`, { method: "DELETE" });
}

// ─── Earn Rules ───────────────────────────────────────────────────────────────

export async function getEarnRules(
  page = 1, limit = 20, search?: string
): Promise<{ data: LoyaltyEarnRule[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) qs.set("search", search);
  const result = await apiFetch<{ data: LoyaltyEarnRule[]; total: number; totalPages: number }>(
    `/admin/loyalty/rules?${qs}`
  );
  return result ?? { data: [], total: 0, totalPages: 1 };
}

export async function getEarnRuleById(id: string): Promise<LoyaltyEarnRule> {
  return apiFetch<LoyaltyEarnRule>(`/admin/loyalty/rules/${id}`);
}

export async function createEarnRule(
  payload: LoyaltyEarnRulePayload,
): Promise<LoyaltyEarnRule> {
  return apiFetch<LoyaltyEarnRule>("/admin/loyalty/rules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEarnRule(
  id: string,
  payload: Partial<LoyaltyEarnRulePayload>,
): Promise<LoyaltyEarnRule> {
  return apiFetch<LoyaltyEarnRule>(`/admin/loyalty/rules/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteEarnRule(id: string): Promise<void> {
  await apiFetch<void>(`/admin/loyalty/rules/${id}`, { method: "DELETE" });
}

// ─── Redemption Catalog ───────────────────────────────────────────────────────

// Backend returns `redeemed`, frontend type uses `redeemedCount`.
// validFrom/validUntil come as full ISO datetimes — trim to YYYY-MM-DD for DateInput.
function mapCatalogItem(raw: LoyaltyRedemptionCatalog & { redeemed?: number }): LoyaltyRedemptionCatalog {
  return {
    ...raw,
    redeemedCount: raw.redeemedCount ?? raw.redeemed ?? 0,
    description: raw.description ?? undefined,
    stockLimit: raw.stockLimit ?? undefined,
    validFrom: raw.validFrom ? raw.validFrom.slice(0, 10) : undefined,
    validUntil: raw.validUntil ? raw.validUntil.slice(0, 10) : undefined,
  };
}

export async function getRedemptionCatalog(
  page = 1, limit = 20, search?: string
): Promise<{ data: LoyaltyRedemptionCatalog[]; total: number; totalPages: number }> {
  const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search) qs.set("search", search);
  const result = await apiFetch<{ data: (LoyaltyRedemptionCatalog & { redeemed?: number })[]; total: number; totalPages: number }>(
    `/admin/loyalty/catalog?${qs}`
  );
  const data = (result?.data ?? []).map(mapCatalogItem);
  return { data, total: result?.total ?? 0, totalPages: result?.totalPages ?? 1 };
}

function toBackendCatalogPayload(payload: Partial<LoyaltyRedemptionCatalogPayload>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined)           body.ten = payload.name;
  if (payload.description !== undefined)    body.moTa = payload.description;
  if (payload.pointsRequired !== undefined) body.diemCan = payload.pointsRequired;
  if (payload.promotionId !== undefined)    body.promotionId = Number(payload.promotionId);
  if (payload.isActive !== undefined)       body.laHoatDong = payload.isActive;
  if (payload.stockLimit !== undefined)     body.gioiHanTonKho = payload.stockLimit;
  if (payload.validFrom !== undefined)      body.hieuLucTu = payload.validFrom || undefined;
  if (payload.validUntil !== undefined)     body.hieuLucDen = payload.validUntil || undefined;
  return body;
}

export async function createRedemptionCatalogItem(
  payload: LoyaltyRedemptionCatalogPayload,
): Promise<LoyaltyRedemptionCatalog> {
  return apiFetch<LoyaltyRedemptionCatalog>("/admin/loyalty/catalog", {
    method: "POST",
    body: JSON.stringify(toBackendCatalogPayload(payload)),
  });
}

export async function updateRedemptionCatalogItem(
  id: string,
  payload: Partial<LoyaltyRedemptionCatalogPayload>,
): Promise<LoyaltyRedemptionCatalog> {
  return apiFetch<LoyaltyRedemptionCatalog>(`/admin/loyalty/catalog/${id}`, {
    method: "PUT",
    body: JSON.stringify(toBackendCatalogPayload(payload)),
  });
}

export async function deleteRedemptionCatalogItem(id: string): Promise<void> {
  await apiFetch<void>(`/admin/loyalty/catalog/${id}`, { method: "DELETE" });
}

// ─── Customer Loyalty (TODO: wire when customer loyalty endpoints ready) ──────

// Mock data preserved until backend exposes customer-specific loyalty endpoints.

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_TRANSACTIONS: LoyaltyPointTransaction[] = [];
const MOCK_REDEMPTIONS: LoyaltyRedemption[] = [];

export async function getCustomerLoyaltySummary(
  customerId: string,
): Promise<CustomerLoyaltySummary> {
  await delay();
  const txns = MOCK_TRANSACTIONS.filter((t) => t.customerId === customerId);
  const reds = MOCK_REDEMPTIONS.filter((r) => r.customerId === customerId);

  const earned = txns
    .filter((t) => t.type === "earn" || (t.type === "adjust" && t.points > 0))
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const spent = txns
    .filter(
      (t) =>
        t.type === "redeem" ||
        t.type === "expire" ||
        (t.type === "adjust" && t.points < 0),
    )
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const lastTxn = [...txns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0];

  return {
    currentBalance: lastTxn?.balanceAfter ?? 0,
    lifetimeEarned: earned,
    lifetimeSpent: spent,
    totalRedemptions: reds.length,
    pendingPoints: 0,
  };
}

export async function getCustomerPointTransactions(
  customerId: string,
): Promise<LoyaltyPointTransaction[]> {
  await delay();
  return MOCK_TRANSACTIONS.filter((t) => t.customerId === customerId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getCustomerRedemptions(
  customerId: string,
): Promise<LoyaltyRedemption[]> {
  await delay();
  return MOCK_REDEMPTIONS.filter((r) => r.customerId === customerId).sort(
    (a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime(),
  );
}
