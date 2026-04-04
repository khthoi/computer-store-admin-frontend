import type {
  Promotion,
  PromotionSummary,
  PromotionUsage,
} from "@/src/types/promotion.types";

// ─── Helper ───────────────────────────────────────────────────────────────────

function scopeDisplay(p: Promotion): string {
  if (p.scopes.length === 0 || p.scopes.some((s) => s.scopeType === "global")) return "Global";
  const catScopes = p.scopes.filter((s) => s.scopeType === "category");
  const prodScopes = p.scopes.filter((s) => s.scopeType === "product");
  const varScopes = p.scopes.filter((s) => s.scopeType === "variant");
  if (catScopes.length > 0) return catScopes.map((s) => s.scopeRefLabel ?? s.scopeRefId).join(", ");
  if (prodScopes.length === 1) return prodScopes[0].scopeRefLabel ?? "1 Product";
  if (prodScopes.length > 1) return `${prodScopes.length} Products`;
  if (varScopes.length > 0) return `${varScopes.length} Variant${varScopes.length > 1 ? "s" : ""}`;
  return "Custom";
}

function discountDisplay(p: Promotion): string {
  if (p.type === "bxgy") return "Buy X Get Y";
  if (p.type === "bundle") return "Bundle Deal";
  if (p.type === "bulk") return "Bulk Tiered";
  if (p.type === "free_shipping") return "Free Shipping";
  const action = p.actions[0];
  if (!action) return "—";
  if (action.discountType === "percentage") return `${action.discountValue}% off`;
  if (action.discountType === "fixed") {
    const v = action.discountValue ?? 0;
    return v >= 1_000_000 ? `₫${v / 1_000_000}M off` : `₫${v / 1_000}k off`;
  }
  return "—";
}

// ─── Mock Promotions ──────────────────────────────────────────────────────────

export const MOCK_PROMOTIONS: Promotion[] = [
  // ── 1. Exclusive Flash Sale (standard, global, active) ──────────────────────
  {
    id: "PROMO-001",
    name: "GPU Flash Sale — April",
    description: "One-week flash discount on all graphics cards. Exclusive — cannot stack.",
    type: "standard",
    isCoupon: false,
    status: "active",
    priority: 100,
    stackingPolicy: "exclusive",
    startDate: "2026-04-01",
    endDate: "2026-04-07",
    totalUsageLimit: 500,
    usageCount: 187,
    scopes: [
      { id: "S-001", promotionId: "PROMO-001", scopeType: "category", scopeRefId: "cat-gpu", scopeRefLabel: "Graphics Cards" },
    ],
    conditions: [
      { id: "C-001", promotionId: "PROMO-001", type: "min_order_value", operator: "gte", value: "2000000" },
    ],
    actions: [
      {
        id: "A-001",
        promotionId: "PROMO-001",
        actionType: "percentage_discount",
        applicationLevel: "per_item",
        discountType: "percentage",
        discountValue: 15,
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  // ── 2. BXGY same product (Buy 2 RAM get 1 RAM free) ─────────────────────────
  {
    id: "PROMO-002",
    name: "Buy 2 RAM Get 1 Free",
    description: "Buy any 2 RAM sticks, receive 1 of the same RAM free. Max 1 free per order.",
    type: "bxgy",
    isCoupon: false,
    status: "active",
    priority: 80,
    stackingPolicy: "stackable",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    totalUsageLimit: 300,
    usageCount: 54,
    scopes: [
      { id: "S-002", promotionId: "PROMO-002", scopeType: "category", scopeRefId: "cat-ram", scopeRefLabel: "RAM / Memory" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-002",
        promotionId: "PROMO-002",
        actionType: "bxgy",
        applicationLevel: "cheapest_item",
        bxgy: {
          buyQuantity: 2,
          buyProductId: undefined,
          getQuantity: 1,
          getProductId: undefined,
          getDiscountPercent: 100,
          deliveryMode: "auto_add",
          maxApplicationsPerOrder: 1,
        },
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-03-28T10:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  // ── 3. BXGY different products (Buy CPU get thermal paste free) ──────────────
  {
    id: "PROMO-003",
    name: "Buy CPU → Free Thermal Paste",
    description: "Buy any Intel or AMD CPU and receive a tube of thermal paste for free.",
    type: "bxgy",
    isCoupon: false,
    status: "active",
    priority: 70,
    stackingPolicy: "stackable",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    totalUsageLimit: undefined,
    usageCount: 38,
    scopes: [
      { id: "S-003", promotionId: "PROMO-003", scopeType: "category", scopeRefId: "cat-cpu", scopeRefLabel: "Processors (CPU)" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-003",
        promotionId: "PROMO-003",
        actionType: "bxgy",
        applicationLevel: "per_item",
        bxgy: {
          buyQuantity: 1,
          buyProductId: undefined,
          getQuantity: 1,
          getProductId: "PROD-THERMAL-001",
          getProductLabel: "Arctic MX-4 Thermal Paste 4g",
          getDiscountPercent: 100,
          deliveryMode: "auto_add",
          maxApplicationsPerOrder: 1,
        },
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-03-30T08:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  // ── 4. Bundle deal (CPU + MB + RAM → 8% off) ────────────────────────────────
  {
    id: "PROMO-004",
    name: "PC Build Bundle — 8% Off",
    description: "Buy a CPU + Motherboard + RAM together and get 8% off all three items.",
    type: "bundle",
    isCoupon: false,
    status: "active",
    priority: 90,
    stackingPolicy: "stackable_with_coupons_only",
    startDate: "2026-03-15",
    endDate: "2026-05-15",
    totalUsageLimit: undefined,
    usageCount: 91,
    scopes: [
      { id: "S-004a", promotionId: "PROMO-004", scopeType: "category", scopeRefId: "cat-cpu", scopeRefLabel: "Processors (CPU)" },
      { id: "S-004b", promotionId: "PROMO-004", scopeType: "category", scopeRefId: "cat-mb", scopeRefLabel: "Motherboards" },
      { id: "S-004c", promotionId: "PROMO-004", scopeType: "category", scopeRefId: "cat-ram", scopeRefLabel: "RAM / Memory" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-004",
        promotionId: "PROMO-004",
        actionType: "bundle_discount",
        applicationLevel: "per_item",
        discountType: "percentage",
        discountValue: 8,
        requiredComponents: [
          { id: "BC-001", scope: "category", refId: "cat-cpu", refLabel: "Processors (CPU)", minQuantity: 1 },
          { id: "BC-002", scope: "category", refId: "cat-mb",  refLabel: "Motherboards", minQuantity: 1 },
          { id: "BC-003", scope: "category", refId: "cat-ram", refLabel: "RAM / Memory", minQuantity: 1 },
        ],
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-03-10T09:00:00Z",
    updatedAt: "2026-03-15T00:00:00Z",
  },

  // ── 5. Bulk tiered — SSD quantity discount ───────────────────────────────────
  {
    id: "PROMO-005",
    name: "SSD Bulk Discount",
    description: "Buy more SSDs, save more. Tiered discount based on quantity.",
    type: "bulk",
    isCoupon: false,
    status: "active",
    priority: 60,
    stackingPolicy: "stackable",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    totalUsageLimit: undefined,
    usageCount: 29,
    scopes: [
      { id: "S-005", promotionId: "PROMO-005", scopeType: "category", scopeRefId: "cat-ssd", scopeRefLabel: "SSDs / Storage" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-005",
        promotionId: "PROMO-005",
        actionType: "bulk_discount",
        applicationLevel: "per_item",
        discountType: "percentage",
        tiers: [
          { minQuantity: 2, maxQuantity: 4,   discountValue: 5,  discountType: "percentage" },
          { minQuantity: 5, maxQuantity: 9,   discountValue: 10, discountType: "percentage" },
          { minQuantity: 10, maxQuantity: undefined, discountValue: 15, discountType: "percentage" },
        ],
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-03-28T11:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  // ── 6. Bulk tiered — cooling fans fixed amount ───────────────────────────────
  {
    id: "PROMO-006",
    name: "Case Fan Bulk Deal",
    description: "Buy 3+ case fans and save a fixed amount per fan.",
    type: "bulk",
    isCoupon: false,
    status: "active",
    priority: 50,
    stackingPolicy: "stackable",
    startDate: "2026-04-05",
    endDate: "2026-05-31",
    totalUsageLimit: undefined,
    usageCount: 17,
    scopes: [
      { id: "S-006", promotionId: "PROMO-006", scopeType: "category", scopeRefId: "cat-fans", scopeRefLabel: "Case Fans / Cooling" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-006",
        promotionId: "PROMO-006",
        actionType: "bulk_discount",
        applicationLevel: "per_item",
        discountType: "fixed",
        tiers: [
          { minQuantity: 3, maxQuantity: 5, discountValue: 30_000, discountType: "fixed" },
          { minQuantity: 6, maxQuantity: undefined, discountValue: 60_000, discountType: "fixed" },
        ],
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-04-03T10:00:00Z",
    updatedAt: "2026-04-05T00:00:00Z",
  },

  // ── 7. Draft promotion (planned for Q3) ─────────────────────────────────────
  {
    id: "PROMO-007",
    name: "Q3 Mega Tech Festival",
    description: "Planned Q3 sale event. Still in draft — conditions TBD.",
    type: "standard",
    isCoupon: false,
    status: "draft",
    priority: 0,
    stackingPolicy: "exclusive",
    startDate: "2026-07-01",
    endDate: "2026-07-07",
    totalUsageLimit: 1000,
    usageCount: 0,
    scopes: [
      { id: "S-007", promotionId: "PROMO-007", scopeType: "global" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-007",
        promotionId: "PROMO-007",
        actionType: "percentage_discount",
        applicationLevel: "cart_total",
        discountType: "percentage",
        discountValue: 12,
        maxDiscountAmount: 2_000_000,
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-04-02T08:00:00Z",
    updatedAt: "2026-04-02T08:00:00Z",
  },

  // ── 8. Ended promotion ───────────────────────────────────────────────────────
  {
    id: "PROMO-008",
    name: "March Clearance — RAM",
    description: "End-of-month clearance discount on RAM modules.",
    type: "standard",
    isCoupon: false,
    status: "ended",
    priority: 50,
    stackingPolicy: "stackable",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    totalUsageLimit: 200,
    usageCount: 200,
    scopes: [
      { id: "S-008", promotionId: "PROMO-008", scopeType: "category", scopeRefId: "cat-ram", scopeRefLabel: "RAM / Memory" },
    ],
    conditions: [
      { id: "C-008", promotionId: "PROMO-008", type: "min_item_quantity", operator: "gte", value: "2" },
    ],
    actions: [
      {
        id: "A-008",
        promotionId: "PROMO-008",
        actionType: "fixed_discount_item",
        applicationLevel: "per_item",
        discountType: "fixed",
        discountValue: 100_000,
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-02-26T09:00:00Z",
    updatedAt: "2026-03-31T23:59:00Z",
  },

  // ── 9. Coupon — 20% off over ₫1M (percentage) ───────────────────────────────
  {
    id: "PROMO-009",
    name: "Summer 20% Off",
    type: "standard",
    isCoupon: true,
    code: "SUMMER20",
    status: "active",
    priority: 40,
    stackingPolicy: "stackable_with_coupons_only",
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    totalUsageLimit: 300,
    perCustomerLimit: 1,
    usageCount: 143,
    scopes: [
      { id: "S-009", promotionId: "PROMO-009", scopeType: "global" },
    ],
    conditions: [
      { id: "C-009", promotionId: "PROMO-009", type: "min_order_value", operator: "gte", value: "1000000" },
    ],
    actions: [
      {
        id: "A-009",
        promotionId: "PROMO-009",
        actionType: "percentage_discount",
        applicationLevel: "cart_total",
        discountType: "percentage",
        discountValue: 20,
        maxDiscountAmount: 500_000,
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-03-28T09:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },

  // ── 10. Coupon — ₫100k fixed off (fixed) ────────────────────────────────────
  {
    id: "PROMO-010",
    name: "VIP ₫100k Off",
    type: "standard",
    isCoupon: true,
    code: "VIP100K",
    status: "active",
    priority: 30,
    stackingPolicy: "stackable",
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    perCustomerLimit: 3,
    usageCount: 45,
    scopes: [
      { id: "S-010", promotionId: "PROMO-010", scopeType: "global" },
    ],
    conditions: [
      { id: "C-010", promotionId: "PROMO-010", type: "min_order_value", operator: "gte", value: "2000000" },
      { id: "C-010b", promotionId: "PROMO-010", type: "customer_group", operator: "in", value: JSON.stringify(["vip"]) },
    ],
    actions: [
      {
        id: "A-010",
        promotionId: "PROMO-010",
        actionType: "fixed_discount_cart",
        applicationLevel: "cart_total",
        discountType: "fixed",
        discountValue: 100_000,
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-02-25T09:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },

  // ── 11. Coupon — BXGY gated behind coupon code ───────────────────────────────
  {
    id: "PROMO-011",
    name: "BOGO RAM Coupon",
    description: "Enter code to activate Buy 1 Get 1 free on RAM modules.",
    type: "bxgy",
    isCoupon: true,
    code: "BOGO-RAM",
    status: "active",
    priority: 60,
    stackingPolicy: "exclusive",
    startDate: "2026-04-10",
    endDate: "2026-04-17",
    totalUsageLimit: 100,
    perCustomerLimit: 1,
    usageCount: 22,
    scopes: [
      { id: "S-011", promotionId: "PROMO-011", scopeType: "category", scopeRefId: "cat-ram", scopeRefLabel: "RAM / Memory" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-011",
        promotionId: "PROMO-011",
        actionType: "bxgy",
        applicationLevel: "cheapest_item",
        bxgy: {
          buyQuantity: 1,
          getQuantity: 1,
          getDiscountPercent: 100,
          deliveryMode: "auto_add",
          maxApplicationsPerOrder: 1,
        },
      },
    ],
    createdBy: "Admin",
    createdAt: "2026-04-08T09:00:00Z",
    updatedAt: "2026-04-10T00:00:00Z",
  },

  // ── 12. Coupon — expired ─────────────────────────────────────────────────────
  {
    id: "PROMO-012",
    name: "Black Friday 2025",
    type: "standard",
    isCoupon: true,
    code: "BFRIDAY25",
    status: "ended",
    priority: 90,
    stackingPolicy: "exclusive",
    startDate: "2025-11-28",
    endDate: "2025-11-30",
    totalUsageLimit: 500,
    perCustomerLimit: 1,
    usageCount: 500,
    scopes: [
      { id: "S-012", promotionId: "PROMO-012", scopeType: "global" },
    ],
    conditions: [],
    actions: [
      {
        id: "A-012",
        promotionId: "PROMO-012",
        actionType: "percentage_discount",
        applicationLevel: "cart_total",
        discountType: "percentage",
        discountValue: 25,
        maxDiscountAmount: 800_000,
      },
    ],
    createdBy: "Admin",
    createdAt: "2025-11-20T09:00:00Z",
    updatedAt: "2025-11-30T23:59:00Z",
  },
];

// ─── Mock Usage Data ──────────────────────────────────────────────────────────

export const MOCK_PROMOTION_USAGE: PromotionUsage[] = [
  { id: "U-001", promotionId: "PROMO-009", customerId: "C-001", customerName: "Nguyen Van A", orderId: "ORD-2001", discountAmount: 234_000, appliedAt: "2026-04-02T10:15:00Z" },
  { id: "U-002", promotionId: "PROMO-009", customerId: "C-002", customerName: "Tran Thi B",   orderId: "ORD-2002", discountAmount: 500_000, appliedAt: "2026-04-03T14:30:00Z" },
  { id: "U-003", promotionId: "PROMO-009", customerId: "C-003", customerName: "Le Van C",     orderId: "ORD-2003", discountAmount: 180_000, appliedAt: "2026-04-04T09:00:00Z" },
  { id: "U-004", promotionId: "PROMO-010", customerId: "C-001", customerName: "Nguyen Van A", orderId: "ORD-2004", discountAmount: 100_000, appliedAt: "2026-03-15T11:00:00Z" },
  { id: "U-005", promotionId: "PROMO-001", customerId: "C-004", customerName: "Pham Thi D",   orderId: "ORD-2005", discountAmount: 450_000, appliedAt: "2026-04-02T16:20:00Z" },
  { id: "U-006", promotionId: "PROMO-004", customerId: "C-005", customerName: "Hoang Van E",  orderId: "ORD-2006", discountAmount: 612_000, appliedAt: "2026-03-20T13:45:00Z" },
  { id: "U-007", promotionId: "PROMO-011", customerId: "C-006", customerName: "Vo Thi F",     orderId: "ORD-2007", discountAmount: 320_000, appliedAt: "2026-04-10T10:05:00Z" },
];

// ─── Summaries ────────────────────────────────────────────────────────────────

export const MOCK_PROMOTION_SUMMARIES: PromotionSummary[] = MOCK_PROMOTIONS.map((p) => ({
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
  scopeDisplay: scopeDisplay(p),
  discountDisplay: discountDisplay(p),
  createdBy: p.createdBy,
  createdAt: p.createdAt,
}));
