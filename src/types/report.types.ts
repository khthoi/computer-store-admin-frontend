// ─── Shared ───────────────────────────────────────────────────────────────────

export type ReportPeriod = "7d" | "30d" | "90d" | "1y";

export interface KpiCard {
  label: string;
  value: number;
  unit?: "vnd" | "count" | "percent" | "days";
  change: number;       // percentage vs previous period, positive = good
  trend: "up" | "down" | "flat";
}

export interface TimeSeriesPoint {
  date: string;         // ISO date "YYYY-MM-DD"
  value: number;
}

// ─── Revenue ─────────────────────────────────────────────────────────────────

export interface RevenueReport {
  kpis: {
    gmv:           KpiCard;
    netRevenue:    KpiCard;
    avgOrderValue: KpiCard;
    returnRate:    KpiCard;
  };
  gmvSeries:        TimeSeriesPoint[];
  netRevenueSeries: TimeSeriesPoint[];
  revenueByCategory: { category: string; revenue: number; share: number }[];
  revenueByChannel:  { channel: string; revenue: number }[];
  topCoupons: {
    couponId: string;
    code: string;
    usageCount: number;
    discountTotal: number;
    incrementalRevenue: number;
  }[];
}

// ─── Products ────────────────────────────────────────────────────────────────

export interface ProductPerformanceReport {
  kpis: {
    totalSold:      KpiCard;
    newListings:    KpiCard;
    avgRating:      KpiCard;
    outOfStockRate: KpiCard;
  };
  topByRevenue: {
    productId: string;
    name: string;
    unitsSold: number;
    revenue: number;
    returnRate: number;
    variants: {
      variantId: string;
      name: string;       // e.g. "32GB / RTX 4070"
      unitsSold: number;
    }[];
  }[];
  topByRating: {
    variantId: string;
    productId: string;
    name: string;
    avgRating: number;
    reviewCount: number;
  }[];
  slowMoving: {
    variantId: string;
    productId: string;
    name: string;
    sku: string;
    stock: number;
    daysSinceLastSale: number;
  }[];
  soldByCategory: { category: string; unitsSold: number }[];
}

// ─── Customers ───────────────────────────────────────────────────────────────

export type RfmSegment =
  | "Champions"
  | "Loyal"
  | "At Risk"
  | "New"
  | "Hibernating"
  | "Lost";

export interface CustomerReport {
  kpis: {
    totalCustomers: KpiCard;
    newCustomers:   KpiCard;
    repeatRate:     KpiCard;
    avgClv:         KpiCard;
  };
  acquisitionSeries: TimeSeriesPoint[];
  rfmSegments: {
    segment:       RfmSegment;
    count:         number;
    share:         number;
    avgOrderValue: number;
  }[];
  topCustomers: {
    customerId: string;
    name: string;
    totalSpent: number;
    orderCount: number;
    segment:    RfmSegment;
  }[];
  retentionByMonth: {
    cohort: string;
    m0: number; m1: number; m2: number; m3: number;
  }[];
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export interface InventoryReport {
  kpis: {
    totalSku:     KpiCard;
    outOfStock:   KpiCard;
    avgDoi:       KpiCard;
    turnoverRate: KpiCard;
  };
  stockHealthBuckets: {
    label:   string;
    count:   number;
    variant: "success" | "warning" | "error" | "default";
  }[];
  lowStockItems: {
    variantId:    string;
    productId:    string;
    name:         string;
    sku:          string;
    thumbnail?:   string;
    currentStock: number;
    threshold:    number;
    doi:          number;
  }[];
  overStockItems: {
    variantId:      string;
    productId:      string;
    name:           string;
    sku:            string;
    stock:          number;
    doi:            number;
    estimatedValue: number;
  }[];
  stockMovementSeries: TimeSeriesPoint[];
}

// ─── Promotions ──────────────────────────────────────────────────────────────

export interface PromotionReport {
  kpis: {
    totalPromotions:    KpiCard;
    couponUsageRate:    KpiCard;
    avgDiscountDepth:   KpiCard;
    incrementalRevenue: KpiCard;
  };
  promotionEffectiveness: {
    promotionId:        string;
    name:               string;
    type:               "coupon" | "flash_sale" | "point_reward";
    usageCount:         number;
    discountTotal:      number;
    incrementalRevenue: number;
    roi:                number;
  }[];
  discountByType: { type: string; total: number }[];
  flashSaleConversion: {
    saleId:         string;
    name:           string;
    viewCount:      number;
    orderCount:     number;
    conversionRate: number;
    revenue:        number;
  }[];
}

// ─── Support ─────────────────────────────────────────────────────────────────

export interface SupportReport {
  kpis: {
    totalTickets:   KpiCard;
    resolvedRate:   KpiCard;
    avgResolutionH: KpiCard;
    pendingReviews: KpiCard;
  };
  ticketsByStatus: { status: string; count: number }[];
  ticketTrendSeries: TimeSeriesPoint[];
  avgResolutionSeries: { date: string; hours: number }[];
  reviewModerationQueue: {
    total:    number;
    pending:  number;
    approved: number;
    rejected: number;
    hidden:   number;
  };
  reviewRatingDistribution: { star: number; count: number }[];
  topIssueCategories: { category: string; count: number; avgResolutionH: number }[];
}

// ─── Executive summary ───────────────────────────────────────────────────────

export interface ExecutiveSummaryReport {
  period:     ReportPeriod;
  revenue:    Pick<RevenueReport,             "kpis" | "gmvSeries">;
  products:   Pick<ProductPerformanceReport,  "kpis">;
  customers:  Pick<CustomerReport,            "kpis" | "acquisitionSeries">;
  inventory:  Pick<InventoryReport,           "kpis" | "stockHealthBuckets">;
  promotions: Pick<PromotionReport,           "kpis">;
  support:    Pick<SupportReport,             "kpis">;
}
