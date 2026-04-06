import type {
  LoyaltyPointTransaction,
  LoyaltyRedemptionCatalog,
  LoyaltyRedemption,
  CustomerLoyaltySummary,
  LoyaltyRedemptionCatalogPayload,
  LoyaltyEarnRule,
  LoyaltyEarnRulePayload,
} from "@/src/types/loyalty.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Mock Point Transactions ──────────────────────────────────────────────────
// customerId aligns with MOCK_CUSTOMERS IDs in _mock.ts: kh-001 … kh-008

const MOCK_TRANSACTIONS: LoyaltyPointTransaction[] = [
  // ── kh-001 Nguyễn Quốc Bảo — 12 orders, heavy buyer ─────────────────────
  {
    id: "TXN-001", customerId: "kh-001", type: "earn",
    points: 500, balanceBefore: 0, balanceAfter: 500,
    description: "Order #ORD-2001 completed",
    referenceType: "order", referenceId: "ORD-2001",
    createdAt: "2025-03-15T09:15:00Z",
  },
  {
    id: "TXN-002", customerId: "kh-001", type: "earn",
    points: 1200, balanceBefore: 500, balanceAfter: 1700,
    description: "Order #ORD-2004 completed",
    referenceType: "order", referenceId: "ORD-2004",
    createdAt: "2025-06-20T11:05:00Z",
  },
  {
    id: "TXN-003", customerId: "kh-001", type: "redeem",
    points: -800, balanceBefore: 1700, balanceAfter: 900,
    description: "Redeemed for coupon SUMMER20",
    referenceType: "redemption", referenceId: "RED-001",
    createdAt: "2025-07-01T14:30:00Z",
  },
  {
    id: "TXN-004", customerId: "kh-001", type: "earn",
    points: 350, balanceBefore: 900, balanceAfter: 1250,
    description: "Order #ORD-2010 completed",
    referenceType: "order", referenceId: "ORD-2010",
    createdAt: "2025-10-05T10:00:00Z",
  },
  {
    id: "TXN-005", customerId: "kh-001", type: "adjust",
    points: 200, balanceBefore: 1250, balanceAfter: 1450,
    description: "Manual adjustment — loyalty bonus for VIP upgrade",
    referenceType: "manual",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "TXN-006", customerId: "kh-001", type: "expire",
    points: -150, balanceBefore: 1450, balanceAfter: 1300,
    description: "Points expired (earned before 2025-01-01)",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "TXN-007", customerId: "kh-001", type: "earn",
    points: 900, balanceBefore: 1300, balanceAfter: 2200,
    description: "Order #ORD-2018 completed",
    referenceType: "order", referenceId: "ORD-2018",
    createdAt: "2026-02-14T16:45:00Z",
  },
  {
    id: "TXN-008", customerId: "kh-001", type: "redeem",
    points: -1000, balanceBefore: 2200, balanceAfter: 1200,
    description: "Redeemed for coupon VIP100K",
    referenceType: "redemption", referenceId: "RED-003",
    createdAt: "2026-03-10T09:20:00Z",
  },
  {
    id: "TXN-009", customerId: "kh-001", type: "earn",
    points: 680, balanceBefore: 1200, balanceAfter: 1880,
    description: "Order #ORD-2021 completed",
    referenceType: "order", referenceId: "ORD-2021",
    createdAt: "2026-03-20T14:30:00Z",
  },

  // ── kh-002 Trần Văn Khoa — 7 orders ─────────────────────────────────────
  {
    id: "TXN-010", customerId: "kh-002", type: "earn",
    points: 750, balanceBefore: 0, balanceAfter: 750,
    description: "Order #ORD-3001 completed",
    referenceType: "order", referenceId: "ORD-3001",
    createdAt: "2025-06-01T10:30:00Z",
  },
  {
    id: "TXN-011", customerId: "kh-002", type: "earn",
    points: 600, balanceBefore: 750, balanceAfter: 1350,
    description: "Order #ORD-3002 completed",
    referenceType: "order", referenceId: "ORD-3002",
    createdAt: "2025-09-15T15:00:00Z",
  },
  {
    id: "TXN-012", customerId: "kh-002", type: "expire",
    points: -100, balanceBefore: 1350, balanceAfter: 1250,
    description: "Points expired (earned before 2025-06-01)",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "TXN-013", customerId: "kh-002", type: "redeem",
    points: -800, balanceBefore: 1250, balanceAfter: 450,
    description: "Redeemed for coupon SUMMER20",
    referenceType: "redemption", referenceId: "RED-004",
    createdAt: "2026-02-10T11:00:00Z",
  },
  {
    id: "TXN-014", customerId: "kh-002", type: "earn",
    points: 1100, balanceBefore: 450, balanceAfter: 1550,
    description: "Order #ORD-3005 completed",
    referenceType: "order", referenceId: "ORD-3005",
    createdAt: "2026-02-28T09:00:00Z",
  },
  {
    id: "TXN-015", customerId: "kh-002", type: "adjust",
    points: -50, balanceBefore: 1550, balanceAfter: 1500,
    description: "Manual adjustment — correction for duplicate earn event",
    referenceType: "manual",
    createdAt: "2026-03-01T12:00:00Z",
  },
  {
    id: "TXN-016", customerId: "kh-002", type: "earn",
    points: 300, balanceBefore: 1500, balanceAfter: 1800,
    description: "Order #ORD-3007 completed",
    referenceType: "order", referenceId: "ORD-3007",
    createdAt: "2026-03-15T14:20:00Z",
  },

  // ── kh-003 Lê Thị Phương Anh — 23 orders, biggest spender ───────────────
  {
    id: "TXN-017", customerId: "kh-003", type: "earn",
    points: 2400, balanceBefore: 0, balanceAfter: 2400,
    description: "Order #ORD-4001 completed",
    referenceType: "order", referenceId: "ORD-4001",
    createdAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "TXN-018", customerId: "kh-003", type: "earn",
    points: 1800, balanceBefore: 2400, balanceAfter: 4200,
    description: "Order #ORD-4005 completed",
    referenceType: "order", referenceId: "ORD-4005",
    createdAt: "2025-02-10T11:00:00Z",
  },
  {
    id: "TXN-019", customerId: "kh-003", type: "redeem",
    points: -1500, balanceBefore: 4200, balanceAfter: 2700,
    description: "Redeemed for coupon BOGO-RAM",
    referenceType: "redemption", referenceId: "RED-007",
    createdAt: "2025-03-05T14:00:00Z",
  },
  {
    id: "TXN-020", customerId: "kh-003", type: "earn",
    points: 3100, balanceBefore: 2700, balanceAfter: 5800,
    description: "Order #ORD-4012 completed",
    referenceType: "order", referenceId: "ORD-4012",
    createdAt: "2025-07-20T10:30:00Z",
  },
  {
    id: "TXN-021", customerId: "kh-003", type: "redeem",
    points: -2000, balanceBefore: 5800, balanceAfter: 3800,
    description: "Redeemed for coupon BFRIDAY25",
    referenceType: "redemption", referenceId: "RED-008",
    createdAt: "2025-11-25T08:00:00Z",
  },
  {
    id: "TXN-022", customerId: "kh-003", type: "adjust",
    points: 500, balanceBefore: 3800, balanceAfter: 4300,
    description: "Manual adjustment — VIP annual bonus",
    referenceType: "manual",
    createdAt: "2026-01-01T00:01:00Z",
  },
  {
    id: "TXN-023", customerId: "kh-003", type: "expire",
    points: -300, balanceBefore: 4300, balanceAfter: 4000,
    description: "Points expired (earned before 2024-12-01)",
    createdAt: "2026-01-01T00:05:00Z",
  },
  {
    id: "TXN-024", customerId: "kh-003", type: "earn",
    points: 2200, balanceBefore: 4000, balanceAfter: 6200,
    description: "Order #ORD-4020 completed",
    referenceType: "order", referenceId: "ORD-4020",
    createdAt: "2026-03-25T09:00:00Z",
  },

  // ── kh-007 Ngô Thanh Tùng — 18 orders ───────────────────────────────────
  {
    id: "TXN-025", customerId: "kh-007", type: "earn",
    points: 1600, balanceBefore: 0, balanceAfter: 1600,
    description: "Order #ORD-5001 completed",
    referenceType: "order", referenceId: "ORD-5001",
    createdAt: "2024-10-10T09:00:00Z",
  },
  {
    id: "TXN-026", customerId: "kh-007", type: "redeem",
    points: -1000, balanceBefore: 1600, balanceAfter: 600,
    description: "Redeemed for coupon VIP100K",
    referenceType: "redemption", referenceId: "RED-009",
    createdAt: "2024-11-01T10:00:00Z",
  },
  {
    id: "TXN-027", customerId: "kh-007", type: "earn",
    points: 2800, balanceBefore: 600, balanceAfter: 3400,
    description: "Order #ORD-5008 completed",
    referenceType: "order", referenceId: "ORD-5008",
    createdAt: "2025-05-15T14:00:00Z",
  },
  {
    id: "TXN-028", customerId: "kh-007", type: "expire",
    points: -200, balanceBefore: 3400, balanceAfter: 3200,
    description: "Points expired (earned before 2024-10-01)",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "TXN-029", customerId: "kh-007", type: "earn",
    points: 1900, balanceBefore: 3200, balanceAfter: 5100,
    description: "Order #ORD-5015 completed",
    referenceType: "order", referenceId: "ORD-5015",
    createdAt: "2026-02-20T11:30:00Z",
  },
  {
    id: "TXN-030", customerId: "kh-007", type: "redeem",
    points: -800, balanceBefore: 5100, balanceAfter: 4300,
    description: "Redeemed for coupon SUMMER20",
    referenceType: "redemption", referenceId: "RED-010",
    createdAt: "2026-03-22T10:15:00Z",
  },
];

// ─── Mock Redemption Catalog ──────────────────────────────────────────────────
// promotionId references isCoupon=true rows: PROMO-009..012 in _mock.ts

export let MOCK_CATALOG: LoyaltyRedemptionCatalog[] = [
  {
    id: "CAT-001",
    name: "Summer 20% Off Coupon",
    description: "Spend 800 loyalty points to receive the SUMMER20 coupon — 20% off any order over ₫1M.",
    pointsRequired: 800,
    promotionId: "PROMO-009",
    promotionCode: "SUMMER20",
    promotionName: "Summer 20% Off",
    discountDisplay: "20% off",
    isActive: true,
    stockLimit: 50,
    redeemedCount: 18,
    validFrom: "2026-04-01",
    validUntil: "2026-04-30",
    createdAt: "2026-03-28T10:00:00Z",
    updatedAt: "2026-03-28T10:00:00Z",
  },
  {
    id: "CAT-002",
    name: "VIP ₫100k Off Coupon",
    description: "Redeem 1,000 points for a VIP100K coupon — ₫100,000 off orders over ₫2M.",
    pointsRequired: 1000,
    promotionId: "PROMO-010",
    promotionCode: "VIP100K",
    promotionName: "VIP ₫100k Off",
    discountDisplay: "₫100k off",
    isActive: true,
    stockLimit: undefined,
    redeemedCount: 7,
    validFrom: "2026-03-01",
    validUntil: "2026-06-30",
    createdAt: "2026-02-25T09:00:00Z",
    updatedAt: "2026-02-25T09:00:00Z",
  },
  {
    id: "CAT-003",
    name: "BOGO RAM Coupon (Flash)",
    description: "Spend 1,500 points to unlock the BOGO-RAM coupon — Buy 1 RAM get 1 free.",
    pointsRequired: 1500,
    promotionId: "PROMO-011",
    promotionCode: "BOGO-RAM",
    promotionName: "BOGO RAM Coupon",
    discountDisplay: "Buy X Get Y",
    isActive: true,
    stockLimit: 20,
    redeemedCount: 5,
    validFrom: "2026-04-10",
    validUntil: "2026-04-17",
    createdAt: "2026-04-08T09:00:00Z",
    updatedAt: "2026-04-08T09:00:00Z",
  },
  {
    id: "CAT-004",
    name: "Black Friday Archive Coupon",
    description: "Archived — no longer redeemable. Historical reference only.",
    pointsRequired: 2000,
    promotionId: "PROMO-012",
    promotionCode: "BFRIDAY25",
    promotionName: "Black Friday 2025",
    discountDisplay: "25% off",
    isActive: false,
    stockLimit: 10,
    redeemedCount: 10,
    validFrom: "2025-11-28",
    validUntil: "2025-11-30",
    createdAt: "2025-11-20T09:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

// ─── Mock Redemptions ─────────────────────────────────────────────────────────

const MOCK_REDEMPTIONS: LoyaltyRedemption[] = [
  // kh-001
  {
    id: "RED-001", customerId: "kh-001", customerName: "Nguyễn Quốc Bảo",
    catalogItemId: "CAT-001", catalogItemName: "Summer 20% Off Coupon",
    pointsSpent: 800, couponCode: "SUMMER20", promotionId: "PROMO-009",
    status: "completed",
    redeemedAt: "2025-07-01T14:30:00Z",
    usedAt: "2025-07-05T10:00:00Z", orderId: "ORD-2005",
  },
  {
    id: "RED-002", customerId: "kh-001", customerName: "Nguyễn Quốc Bảo",
    catalogItemId: "CAT-003", catalogItemName: "BOGO RAM Coupon (Flash)",
    pointsSpent: 1500, couponCode: "BOGO-RAM", promotionId: "PROMO-011",
    status: "cancelled",
    redeemedAt: "2026-01-15T08:00:00Z",
  },
  {
    id: "RED-003", customerId: "kh-001", customerName: "Nguyễn Quốc Bảo",
    catalogItemId: "CAT-002", catalogItemName: "VIP ₫100k Off Coupon",
    pointsSpent: 1000, couponCode: "VIP100K", promotionId: "PROMO-010",
    status: "completed",
    redeemedAt: "2026-03-10T09:20:00Z",
    usedAt: "2026-03-12T11:45:00Z", orderId: "ORD-2022",
  },

  // kh-002
  {
    id: "RED-004", customerId: "kh-002", customerName: "Trần Văn Khoa",
    catalogItemId: "CAT-001", catalogItemName: "Summer 20% Off Coupon",
    pointsSpent: 800, couponCode: "SUMMER20", promotionId: "PROMO-009",
    status: "completed",
    redeemedAt: "2026-02-10T11:00:00Z",
    usedAt: "2026-02-12T09:30:00Z", orderId: "ORD-3003",
  },
  {
    id: "RED-005", customerId: "kh-002", customerName: "Trần Văn Khoa",
    catalogItemId: "CAT-002", catalogItemName: "VIP ₫100k Off Coupon",
    pointsSpent: 1000, couponCode: "VIP100K", promotionId: "PROMO-010",
    status: "expired",
    redeemedAt: "2025-12-20T10:00:00Z",
  },
  {
    id: "RED-006", customerId: "kh-002", customerName: "Trần Văn Khoa",
    catalogItemId: "CAT-003", catalogItemName: "BOGO RAM Coupon (Flash)",
    pointsSpent: 1500, couponCode: "BOGO-RAM", promotionId: "PROMO-011",
    status: "completed",
    redeemedAt: "2026-03-15T08:30:00Z",
    usedAt: "2026-03-15T14:00:00Z", orderId: "ORD-3007",
  },

  // kh-003
  {
    id: "RED-007", customerId: "kh-003", customerName: "Lê Thị Phương Anh",
    catalogItemId: "CAT-003", catalogItemName: "BOGO RAM Coupon (Flash)",
    pointsSpent: 1500, couponCode: "BOGO-RAM", promotionId: "PROMO-011",
    status: "completed",
    redeemedAt: "2025-03-05T14:00:00Z",
    usedAt: "2025-03-06T09:00:00Z", orderId: "ORD-4003",
  },
  {
    id: "RED-008", customerId: "kh-003", customerName: "Lê Thị Phương Anh",
    catalogItemId: "CAT-004", catalogItemName: "Black Friday Archive Coupon",
    pointsSpent: 2000, couponCode: "BFRIDAY25", promotionId: "PROMO-012",
    status: "completed",
    redeemedAt: "2025-11-25T08:00:00Z",
    usedAt: "2025-11-28T10:00:00Z", orderId: "ORD-4016",
  },
  {
    id: "RED-009b", customerId: "kh-003", customerName: "Lê Thị Phương Anh",
    catalogItemId: "CAT-001", catalogItemName: "Summer 20% Off Coupon",
    pointsSpent: 800, couponCode: "SUMMER20", promotionId: "PROMO-009",
    status: "completed",
    redeemedAt: "2026-03-25T09:00:00Z",
    usedAt: "2026-03-25T16:00:00Z", orderId: "ORD-4020",
  },

  // kh-007
  {
    id: "RED-009", customerId: "kh-007", customerName: "Ngô Thanh Tùng",
    catalogItemId: "CAT-002", catalogItemName: "VIP ₫100k Off Coupon",
    pointsSpent: 1000, couponCode: "VIP100K", promotionId: "PROMO-010",
    status: "completed",
    redeemedAt: "2024-11-01T10:00:00Z",
    usedAt: "2024-11-05T14:30:00Z", orderId: "ORD-5003",
  },
  {
    id: "RED-010", customerId: "kh-007", customerName: "Ngô Thanh Tùng",
    catalogItemId: "CAT-001", catalogItemName: "Summer 20% Off Coupon",
    pointsSpent: 800, couponCode: "SUMMER20", promotionId: "PROMO-009",
    status: "completed",
    redeemedAt: "2026-03-22T10:15:00Z",
    usedAt: "2026-03-22T15:00:00Z", orderId: "ORD-5018",
  },
];

// ─── Service functions ────────────────────────────────────────────────────────

export async function getCustomerLoyaltySummary(
  customerId: string
): Promise<CustomerLoyaltySummary> {
  await delay();
  const txns = MOCK_TRANSACTIONS.filter((t) => t.customerId === customerId);
  const reds = MOCK_REDEMPTIONS.filter((r) => r.customerId === customerId);

  const earned = txns
    .filter((t) => t.type === "earn" || (t.type === "adjust" && t.points > 0))
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const spent = txns
    .filter((t) => t.type === "redeem" || t.type === "expire" || (t.type === "adjust" && t.points < 0))
    .reduce((sum, t) => sum + Math.abs(t.points), 0);

  const lastTxn = [...txns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  const currentBalance = lastTxn?.balanceAfter ?? 0;

  // Pending: simulate for customers with recent orders
  const pendingMap: Record<string, number> = {
    "kh-001": 120,
    "kh-003": 250,
    "kh-007": 0,
  };

  return {
    currentBalance,
    lifetimeEarned: earned,
    lifetimeSpent: spent,
    totalRedemptions: reds.length,
    pendingPoints: pendingMap[customerId] ?? 0,
  };
}

export async function getCustomerPointTransactions(
  customerId: string
): Promise<LoyaltyPointTransaction[]> {
  await delay();
  return MOCK_TRANSACTIONS
    .filter((t) => t.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCustomerRedemptions(
  customerId: string
): Promise<LoyaltyRedemption[]> {
  await delay();
  return MOCK_REDEMPTIONS
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
}

export async function getRedemptionCatalog(): Promise<LoyaltyRedemptionCatalog[]> {
  await delay();
  return [...MOCK_CATALOG];
}

export async function createRedemptionCatalogItem(
  payload: LoyaltyRedemptionCatalogPayload
): Promise<LoyaltyRedemptionCatalog> {
  await delay();
  const now = new Date().toISOString();
  const newItem: LoyaltyRedemptionCatalog = {
    id: genId("CAT"),
    name: payload.name,
    description: payload.description,
    pointsRequired: payload.pointsRequired,
    promotionId: payload.promotionId,
    isActive: payload.isActive,
    stockLimit: payload.stockLimit,
    redeemedCount: 0,
    validFrom: payload.validFrom,
    validUntil: payload.validUntil,
    createdAt: now,
    updatedAt: now,
  };
  MOCK_CATALOG.push(newItem);
  return newItem;
}

export async function updateRedemptionCatalogItem(
  id: string,
  payload: Partial<LoyaltyRedemptionCatalogPayload>
): Promise<LoyaltyRedemptionCatalog> {
  await delay();
  const idx = MOCK_CATALOG.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Catalog item ${id} not found.`);
  const updated: LoyaltyRedemptionCatalog = {
    ...MOCK_CATALOG[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  MOCK_CATALOG[idx] = updated;
  return updated;
}

export async function deleteRedemptionCatalogItem(id: string): Promise<void> {
  await delay();
  const idx = MOCK_CATALOG.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Catalog item ${id} not found.`);
  MOCK_CATALOG.splice(idx, 1);
}

// ─── Mock Earn Rules ──────────────────────────────────────────────────────────

export let MOCK_EARN_RULES: LoyaltyEarnRule[] = [
  {
    id: "EARN-001",
    name: "Base Rate",
    description: "Standard earn rate for all orders — 1 point per 10,000 VND spent.",
    pointsPerUnit: 1,
    spendPerUnit: 10000,
    minOrderValue: 100000,
    maxPointsPerOrder: 500,
    bonusTrigger: undefined,
    bonusPoints: undefined,
    scopes: [],
    isActive: true,
    priority: 10,
    validFrom: undefined,
    validUntil: undefined,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "EARN-002",
    name: "Gaming Category Bonus",
    description: "Customers earn 2x points on products in the Linh kiện Gaming category.",
    pointsPerUnit: 1,
    spendPerUnit: 10000,
    minOrderValue: undefined,
    maxPointsPerOrder: undefined,
    bonusTrigger: undefined,
    bonusPoints: undefined,
    scopes: [
      {
        id: "EARN-002-S1",
        ruleId: "EARN-002",
        scopeType: "category",
        scopeRefId: "cat-gaming",
        scopeRefLabel: "Linh kiện Gaming",
        multiplier: 2.0,
      },
    ],
    isActive: true,
    priority: 20,
    validFrom: undefined,
    validUntil: undefined,
    createdAt: "2025-03-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "EARN-003",
    name: "First Order Bonus",
    description: "New customers receive a flat +200 bonus points on their first order.",
    pointsPerUnit: 1,
    spendPerUnit: 10000,
    minOrderValue: undefined,
    maxPointsPerOrder: undefined,
    bonusTrigger: "first_order",
    bonusPoints: 200,
    scopes: [],
    isActive: true,
    priority: 5,
    validFrom: undefined,
    validUntil: undefined,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

// ─── Earn Rule service functions ──────────────────────────────────────────────

export async function getEarnRules(): Promise<LoyaltyEarnRule[]> {
  await delay();
  return [...MOCK_EARN_RULES];
}

export async function createEarnRule(
  payload: LoyaltyEarnRulePayload
): Promise<LoyaltyEarnRule> {
  await delay();
  const now = new Date().toISOString();
  const id = genId("EARN");
  const newRule: LoyaltyEarnRule = {
    ...payload,
    id,
    scopes: payload.scopes.map((s, i) => ({
      ...s,
      id: `${id}-S${i + 1}`,
      ruleId: id,
    })),
    createdAt: now,
    updatedAt: now,
  };
  MOCK_EARN_RULES.push(newRule);
  return newRule;
}

export async function updateEarnRule(
  id: string,
  payload: Partial<LoyaltyEarnRulePayload>
): Promise<LoyaltyEarnRule> {
  await delay();
  const idx = MOCK_EARN_RULES.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Earn rule ${id} not found.`);
  const existing = MOCK_EARN_RULES[idx];
  const updatedScopes = payload.scopes
    ? payload.scopes.map((s, i) => ({
        ...s,
        id: `${id}-S${i + 1}`,
        ruleId: id,
      }))
    : existing.scopes;
  const updated: LoyaltyEarnRule = {
    ...existing,
    ...payload,
    scopes: updatedScopes,
    updatedAt: new Date().toISOString(),
  };
  MOCK_EARN_RULES[idx] = updated;
  return updated;
}

export async function deleteEarnRule(id: string): Promise<void> {
  await delay();
  const idx = MOCK_EARN_RULES.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Earn rule ${id} not found.`);
  MOCK_EARN_RULES.splice(idx, 1);
}
