import type {
  ReportPeriod,
  ExecutiveSummaryReport,
  RevenueReport,
  ProductPerformanceReport,
  CustomerReport,
  InventoryReport,
  PromotionReport,
  SupportReport,
  KpiCard,
  TimeSeriesPoint,
} from "@/src/types/report.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms = 400): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function makeSeries(days: number, base: number, variance: number): TimeSeriesPoint[] {
  const result: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const noise = (Math.random() - 0.5) * 2 * variance;
    const trend = ((days - i) / days) * base * 0.2;
    result.push({
      date:  d.toISOString().slice(0, 10),
      value: Math.max(0, Math.round(base + trend + noise)),
    });
  }
  return result;
}

function kpi(
  label: string,
  value: number,
  change: number,
  unit: KpiCard["unit"] = "count"
): KpiCard {
  return {
    label,
    value,
    unit,
    change,
    trend: change > 0.5 ? "up" : change < -0.5 ? "down" : "flat",
  };
}

function periodDays(period: ReportPeriod): number {
  return { "7d": 7, "30d": 30, "90d": 90, "1y": 365 }[period];
}

// ─── Executive Summary ────────────────────────────────────────────────────────

export async function getExecutiveSummary(period: ReportPeriod): Promise<ExecutiveSummaryReport> {
  await delay();
  const days = periodDays(period);
  return {
    period,
    revenue: {
      kpis: {
        gmv:           kpi("GMV", 14_600_000_000, 12.4, "vnd"),
        netRevenue:    kpi("Doanh thu thuần", 12_850_000_000, 9.7, "vnd"),
        avgOrderValue: kpi("Giá trị đơn TB", 3_250_000, 5.2, "vnd"),
        returnRate:    kpi("Tỉ lệ hoàn trả", 1.6, -0.3, "percent"),
      },
      gmvSeries: makeSeries(days, 486_666_666, 80_000_000),
    },
    products: {
      kpis: {
        totalSold:      kpi("Sản phẩm đã bán", 4_482, 8.1),
        newListings:    kpi("Sản phẩm mới", 37, 14.3),
        avgRating:      kpi("Đánh giá TB", 4.3, 0.2, "percent"),
        outOfStockRate: kpi("Hết hàng", 3.8, -1.2, "percent"),
      },
    },
    customers: {
      kpis: {
        totalCustomers: kpi("Tổng khách hàng", 18_420, 6.5),
        newCustomers:   kpi("Khách mới", 742, 18.9),
        repeatRate:     kpi("Tỉ lệ mua lại", 38.4, 3.1, "percent"),
        avgClv:         kpi("CLV trung bình", 4_820_000, 7.4, "vnd"),
      },
      acquisitionSeries: makeSeries(days, 24, 8),
    },
    inventory: {
      kpis: {
        totalSku:     kpi("Tổng SKU", 284, 4.4),
        outOfStock:   kpi("Hết hàng", 11, -8.3),
        avgDoi:       kpi("DOI trung bình", 42.3, 2.1, "days"),
        turnoverRate: kpi("Vòng quay kho", 8.6, 0.4, "percent"),
      },
      stockHealthBuckets: [
        { label: "Tốt (DOI 15–60)",   count: 168, variant: "success" },
        { label: "Thấp (< 15 ngày)",  count:  43, variant: "warning" },
        { label: "Tồn kho (> 90 ngày)", count: 62, variant: "error"   },
        { label: "Hết hàng",          count:  11, variant: "default"  },
      ],
    },
    promotions: {
      kpis: {
        totalPromotions:    kpi("Chương trình KM", 24, 4.3),
        couponUsageRate:    kpi("Tỉ lệ dùng coupon", 22.7, 5.8, "percent"),
        avgDiscountDepth:   kpi("Mức giảm TB", 11.4, -0.6, "percent"),
        incrementalRevenue: kpi("Doanh thu tăng thêm", 2_340_000_000, 15.2, "vnd"),
      },
    },
    support: {
      kpis: {
        totalTickets:   kpi("Tổng ticket", 318, 6.2),
        resolvedRate:   kpi("Đã xử lý", 87.4, 2.8, "percent"),
        avgResolutionH: kpi("Thời gian XL TB", 4.2, -12.5, "days"),
        pendingReviews: kpi("Chờ duyệt đánh giá", 47, -18.6),
      },
    },
  };
}

// ─── Revenue ──────────────────────────────────────────────────────────────────

export async function getRevenueReport(period: ReportPeriod): Promise<RevenueReport> {
  await delay();
  const days = periodDays(period);
  return {
    kpis: {
      gmv:           kpi("GMV", 14_600_000_000, 12.4, "vnd"),
      netRevenue:    kpi("Doanh thu thuần", 12_850_000_000, 9.7, "vnd"),
      avgOrderValue: kpi("Giá trị đơn TB", 3_250_000, 5.2, "vnd"),
      returnRate:    kpi("Tỉ lệ hoàn trả", 1.6, -0.3, "percent"),
    },
    gmvSeries:        makeSeries(days, 486_666_666, 80_000_000),
    netRevenueSeries: makeSeries(days, 428_333_333, 70_000_000),
    revenueByCategory: [
      { category: "Laptop",         revenue: 5_840_000_000, share: 40.0 },
      { category: "PC & Màn hình",  revenue: 3_504_000_000, share: 24.0 },
      { category: "Linh kiện",      revenue: 2_336_000_000, share: 16.0 },
      { category: "Phụ kiện",       revenue: 1_606_000_000, share: 11.0 },
      { category: "Thiết bị mạng",  revenue:   876_000_000, share:  6.0 },
      { category: "Khác",           revenue:   438_000_000, share:  3.0 },
    ],
    revenueByChannel: [
      { channel: "website",  revenue: 10_512_000_000 },
      { channel: "mobile",   revenue:  2_920_000_000 },
      { channel: "reseller", revenue:  1_168_000_000 },
    ],
    topCoupons: [
      { couponId: "cp1", code: "SALE30",    usageCount: 842,   discountTotal: 421_000_000, incrementalRevenue: 1_263_000_000 },
      { couponId: "cp2", code: "NEWUSER15", usageCount: 614,   discountTotal: 184_200_000, incrementalRevenue:   552_600_000 },
      { couponId: "cp3", code: "FLASH50",   usageCount: 287,   discountTotal: 430_500_000, incrementalRevenue:   861_000_000 },
      { couponId: "cp4", code: "MEMBER10",  usageCount: 1_203, discountTotal: 240_600_000, incrementalRevenue:   481_200_000 },
      { couponId: "cp5", code: "TECH20",    usageCount: 398,   discountTotal: 199_000_000, incrementalRevenue:   497_500_000 },
    ],
  };
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProductPerformanceReport(period: ReportPeriod): Promise<ProductPerformanceReport> {
  await delay();
  void period;
  return {
    kpis: {
      totalSold:      kpi("Sản phẩm đã bán", 4_482, 8.1),
      newListings:    kpi("Sản phẩm mới niêm yết", 37, 14.3),
      avgRating:      kpi("Đánh giá TB", 4.3, 0.2, "percent"),
      outOfStockRate: kpi("Tỉ lệ hết hàng", 3.8, -1.2, "percent"),
    },
    topByRevenue: [
      { productId: "p1", name: "ASUS ROG Strix G16 (2024)",  unitsSold: 312, revenue: 2_340_000_000, returnRate: 1.3,
        variants: [
          { variantId: "p1v1", name: "32GB / RTX 4070 Ti",  unitsSold: 167 },
          { variantId: "p1v2", name: "16GB / RTX 4060",     unitsSold: 145 },
        ],
      },
      { productId: "p2", name: "MacBook Pro M3 14\"",         unitsSold: 248, revenue: 2_108_000_000, returnRate: 0.8,
        variants: [
          { variantId: "p2v1", name: "18GB / 512GB",         unitsSold: 150 },
          { variantId: "p2v2", name: "16GB / 512GB",         unitsSold:  98 },
        ],
      },
      { productId: "p3", name: "Dell XPS 15 9530",            unitsSold: 195, revenue: 1_560_000_000, returnRate: 1.5,
        variants: [
          { variantId: "p3v1", name: "32GB / 1TB",           unitsSold: 105 },
          { variantId: "p3v2", name: "16GB / 512GB",         unitsSold:  90 },
        ],
      },
      { productId: "p4", name: "Samsung Odyssey G7 27\"",     unitsSold: 421, revenue: 1_263_000_000, returnRate: 2.1,
        variants: [
          { variantId: "p4v1", name: "QHD 240Hz",            unitsSold: 287 },
          { variantId: "p4v2", name: "UHD 144Hz",            unitsSold: 134 },
        ],
      },
      { productId: "p5", name: "Intel Core i9-13900K",        unitsSold: 874, revenue:   961_400_000, returnRate: 0.6,
        variants: [
          { variantId: "p5v1", name: "Box (tray)",           unitsSold: 512 },
          { variantId: "p5v2", name: "OEM",                  unitsSold: 362 },
        ],
      },
      { productId: "p6", name: "NVIDIA RTX 4080 Super",       unitsSold: 143, revenue:   858_000_000, returnRate: 1.4,
        variants: [
          { variantId: "p6v1", name: "16GB GDDR6X — MSI",    unitsSold:  72 },
          { variantId: "p6v2", name: "16GB GDDR6X — ASUS",   unitsSold:  47 },
          { variantId: "p6v3", name: "16GB GDDR6X — Gigabyte",unitsSold: 24 },
        ],
      },
      { productId: "p7", name: "Corsair Vengeance DDR5",      unitsSold: 1_203, revenue: 721_800_000, returnRate: 0.3,
        variants: [
          { variantId: "p7v1", name: "32GB 6000MHz",         unitsSold: 681 },
          { variantId: "p7v2", name: "64GB 6000MHz",         unitsSold: 312 },
          { variantId: "p7v3", name: "32GB 5600MHz",         unitsSold: 210 },
        ],
      },
      { productId: "p8", name: "WD Black SN850X NVMe",        unitsSold: 967, revenue:   628_550_000, returnRate: 0.5,
        variants: [
          { variantId: "p8v1", name: "1TB",                  unitsSold: 574 },
          { variantId: "p8v2", name: "2TB",                  unitsSold: 393 },
        ],
      },
    ],
    topByRating: [
      { variantId: "v1", productId: "pr1", name: "Logitech MX Master 3S — Đen",      avgRating: 4.9, reviewCount: 284 },
      { variantId: "v2", productId: "pr2", name: "Samsung 990 Pro 2TB NVMe",         avgRating: 4.8, reviewCount: 196 },
      { variantId: "v3", productId: "pr3", name: "Apple Magic Keyboard — Space Grey", avgRating: 4.8, reviewCount: 143 },
      { variantId: "v4", productId: "pr4", name: "ASUS ProArt PA278QV 27\"",         avgRating: 4.7, reviewCount: 87  },
      { variantId: "v5", productId: "pr5", name: "Corsair K100 RGB — Black",         avgRating: 4.7, reviewCount: 211 },
      { variantId: "v6", productId: "pr6", name: "Sony WH-1000XM5",                  avgRating: 4.6, reviewCount: 329 },
    ],
    slowMoving: [
      { variantId: "s1", productId: "ps1", name: "Logitech G413 TKL — Đen", sku: "LG-G413-BLK", stock: 34, daysSinceLastSale: 82 },
      { variantId: "s2", productId: "ps2", name: "Razer Kraken X USB",       sku: "RZ-KRK-USB",  stock: 18, daysSinceLastSale: 67 },
      { variantId: "s3", productId: "ps3", name: "Cooler Master MA620P",     sku: "CM-MA620P",   stock: 9,  daysSinceLastSale: 55 },
      { variantId: "s4", productId: "ps4", name: "MSI B550 Tomahawk — WiFi", sku: "MSI-B550-WF", stock: 12, daysSinceLastSale: 49 },
      { variantId: "s5", productId: "ps5", name: "NZXT H510 Flow — White",   sku: "NZ-H510-WHT", stock: 7,  daysSinceLastSale: 44 },
    ],
    soldByCategory: [
      { category: "Phụ kiện",      unitsSold: 1_824 },
      { category: "Linh kiện",     unitsSold: 1_247 },
      { category: "Laptop",        unitsSold:   631 },
      { category: "PC & Màn hình", unitsSold:   428 },
      { category: "Thiết bị mạng", unitsSold:   352 },
    ],
  };
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function getCustomerReport(period: ReportPeriod): Promise<CustomerReport> {
  await delay();
  const days = periodDays(period);
  return {
    kpis: {
      totalCustomers: kpi("Tổng khách hàng", 18_420, 6.5),
      newCustomers:   kpi("Khách mới", 742, 18.9),
      repeatRate:     kpi("Tỉ lệ mua lại", 38.4, 3.1, "percent"),
      avgClv:         kpi("CLV trung bình", 4_820_000, 7.4, "vnd"),
    },
    acquisitionSeries: makeSeries(days, 24, 8),
    rfmSegments: [
      { segment: "Champions",  count: 1_842, share: 10.0, avgOrderValue: 8_640_000 },
      { segment: "Loyal",      count: 3_132, share: 17.0, avgOrderValue: 5_120_000 },
      { segment: "At Risk",    count: 2_947, share: 16.0, avgOrderValue: 3_870_000 },
      { segment: "New",        count: 3_868, share: 21.0, avgOrderValue: 2_150_000 },
      { segment: "Hibernating",count: 4_237, share: 23.0, avgOrderValue: 1_640_000 },
      { segment: "Lost",       count: 2_394, share: 13.0, avgOrderValue:   820_000 },
    ],
    topCustomers: [
      { customerId: "c1", name: "Nguyễn Thanh Hưng",    totalSpent: 86_400_000,  orderCount: 12, segment: "Champions"  },
      { customerId: "c2", name: "Trần Minh Khoa",        totalSpent: 74_200_000,  orderCount: 9,  segment: "Champions"  },
      { customerId: "c3", name: "Lê Thị Phương Thảo",   totalSpent: 68_500_000,  orderCount: 14, segment: "Champions"  },
      { customerId: "c4", name: "Phạm Đức Long",         totalSpent: 61_800_000,  orderCount: 8,  segment: "Loyal"      },
      { customerId: "c5", name: "Vũ Hồng Quân",         totalSpent: 54_300_000,  orderCount: 11, segment: "Loyal"      },
      { customerId: "c6", name: "Đặng Thị Thu Hà",      totalSpent: 48_700_000,  orderCount: 7,  segment: "Loyal"      },
      { customerId: "c7", name: "Bùi Quang Vinh",       totalSpent: 42_100_000,  orderCount: 6,  segment: "At Risk"    },
      { customerId: "c8", name: "Hoàng Anh Tuấn",       totalSpent: 38_900_000,  orderCount: 5,  segment: "At Risk"    },
    ],
    retentionByMonth: [
      { cohort: "2025-12", m0: 100, m1: 48, m2: 31, m3: 22 },
      { cohort: "2026-01", m0: 100, m1: 52, m2: 34, m3: 24 },
      { cohort: "2026-02", m0: 100, m1: 44, m2: 29, m3: 0  },
      { cohort: "2026-03", m0: 100, m1: 49, m2: 0,  m3: 0  },
      { cohort: "2026-04", m0: 100, m1: 0,  m2: 0,  m3: 0  },
    ],
  };
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventoryReport(): Promise<InventoryReport> {
  await delay();
  return {
    kpis: {
      totalSku:     kpi("Tổng SKU", 284, 4.4),
      outOfStock:   kpi("SKU hết hàng", 11, -8.3),
      avgDoi:       kpi("DOI trung bình", 42.3, 2.1, "days"),
      turnoverRate: kpi("Vòng quay kho (lần/năm)", 8.6, 0.4),
    },
    stockHealthBuckets: [
      { label: "Tốt (DOI 15–60)",    count: 168, variant: "success" },
      { label: "Thấp (< 15 ngày)",   count:  43, variant: "warning" },
      { label: "Tồn kho (> 90 ngày)",count:  62, variant: "error"   },
      { label: "Hết hàng",           count:  11, variant: "default"  },
    ],
    lowStockItems: [
      { variantId: "v101", productId: "ip1", name: "Intel Core i9-13900K",         sku: "INT-I9-13900K", thumbnail: undefined, currentStock: 3,  threshold: 10, doi: 4  },
      { variantId: "v102", productId: "ip2", name: "NVIDIA RTX 4080 Super — 16GB", sku: "NV-4080S-16G",  thumbnail: undefined, currentStock: 5,  threshold: 15, doi: 6  },
      { variantId: "v103", productId: "ip3", name: "Samsung 990 Pro 2TB",          sku: "SS-990PRO-2T",  thumbnail: undefined, currentStock: 8,  threshold: 20, doi: 9  },
      { variantId: "v104", productId: "ip4", name: "Corsair DDR5 32GB 6000MHz",    sku: "CR-DDR5-32-6K", thumbnail: undefined, currentStock: 11, threshold: 25, doi: 12 },
      { variantId: "v105", productId: "ip5", name: "WD Black SN850X 1TB",          sku: "WD-SN850X-1T",  thumbnail: undefined, currentStock: 14, threshold: 30, doi: 13 },
      { variantId: "v106", productId: "ip6", name: "ASUS ROG STRIX B650E-F",       sku: "AS-B650EF-ROG", thumbnail: undefined, currentStock: 6,  threshold: 15, doi: 7  },
    ],
    overStockItems: [
      { variantId: "v201", productId: "op1", name: "Cooler Master MA620P",       sku: "CM-MA620P",    stock: 142, doi: 218, estimatedValue: 213_000_000 },
      { variantId: "v202", productId: "op2", name: "NZXT H510 Flow — White",     sku: "NZ-H510W",     stock: 98,  doi: 176, estimatedValue: 147_000_000 },
      { variantId: "v203", productId: "op3", name: "MSI B550 Tomahawk WiFi",     sku: "MSI-B550W",    stock: 67,  doi: 145, estimatedValue: 134_000_000 },
      { variantId: "v204", productId: "op4", name: "Razer Kraken X USB",         sku: "RZ-KRKX-USB",  stock: 83,  doi: 134, estimatedValue:  91_300_000 },
      { variantId: "v205", productId: "op5", name: "Logitech G413 TKL — Black",  sku: "LG-G413-BLK",  stock: 54,  doi: 118, estimatedValue:  86_400_000 },
    ],
    stockMovementSeries: makeSeries(90, 48, 20),
  };
}

// ─── Promotions ───────────────────────────────────────────────────────────────

export async function getPromotionReport(period: ReportPeriod): Promise<PromotionReport> {
  await delay();
  void period;
  return {
    kpis: {
      totalPromotions:    kpi("Chương trình KM", 24, 4.3),
      couponUsageRate:    kpi("Tỉ lệ dùng coupon", 22.7, 5.8, "percent"),
      avgDiscountDepth:   kpi("Mức giảm giá TB", 11.4, -0.6, "percent"),
      incrementalRevenue: kpi("Doanh thu tăng thêm", 2_340_000_000, 15.2, "vnd"),
    },
    promotionEffectiveness: [
      { promotionId: "pr1", name: "Flash Sale Laptop",      type: "flash_sale",   usageCount: 1_247, discountTotal: 1_872_000_000, incrementalRevenue: 4_680_000_000, roi: 2.50 },
      { promotionId: "pr2", name: "Coupon SALE30",          type: "coupon",       usageCount:   842, discountTotal:   421_000_000, incrementalRevenue: 1_263_000_000, roi: 3.00 },
      { promotionId: "pr3", name: "Điểm thưởng mùa hè",    type: "point_reward", usageCount: 2_134, discountTotal:   320_100_000, incrementalRevenue:   640_200_000, roi: 2.00 },
      { promotionId: "pr4", name: "Coupon NEWUSER15",       type: "coupon",       usageCount:   614, discountTotal:   184_200_000, incrementalRevenue:   460_500_000, roi: 2.50 },
      { promotionId: "pr5", name: "Flash Sale Gaming Gear", type: "flash_sale",   usageCount:   487, discountTotal:   438_300_000, incrementalRevenue:   657_450_000, roi: 1.50 },
      { promotionId: "pr6", name: "Coupon TECH20",          type: "coupon",       usageCount:   398, discountTotal:   199_000_000, incrementalRevenue:   159_200_000, roi: 0.80 },
      { promotionId: "pr7", name: "Flash Sale Phụ kiện",    type: "flash_sale",   usageCount:   312, discountTotal:   156_000_000, incrementalRevenue:    78_000_000, roi: 0.50 },
    ],
    discountByType: [
      { type: "coupon",       total: 1_044_800_000 },
      { type: "flash_sale",   total: 2_466_300_000 },
      { type: "point_reward", total:   320_100_000 },
    ],
    flashSaleConversion: [
      { saleId: "fs1", name: "Flash Sale Laptop tháng 3",    viewCount: 12_430, orderCount:   932, conversionRate: 7.5, revenue: 2_796_000_000 },
      { saleId: "fs2", name: "Flash Sale Gaming Gear",       viewCount:  8_724, orderCount:   523, conversionRate: 6.0, revenue:   940_000_000 },
      { saleId: "fs3", name: "Flash Sale Phụ kiện T3",       viewCount:  6_312, orderCount:   189, conversionRate: 3.0, revenue:   189_000_000 },
      { saleId: "fs4", name: "Flash Sale Cuối tuần",         viewCount:  4_891, orderCount:    88, conversionRate: 1.8, revenue:   220_000_000 },
    ],
  };
}

// ─── Support ──────────────────────────────────────────────────────────────────

export async function getSupportReport(period: ReportPeriod): Promise<SupportReport> {
  await delay();
  const days = periodDays(period);
  return {
    kpis: {
      totalTickets:   kpi("Tổng ticket", 318, 6.2),
      resolvedRate:   kpi("Tỉ lệ đã xử lý", 87.4, 2.8, "percent"),
      avgResolutionH: kpi("Thời gian XL TB (giờ)", 4.2, -12.5),
      pendingReviews: kpi("Đánh giá chờ duyệt", 47, -18.6),
    },
    ticketsByStatus: [
      { status: "pending",     count:  28 },
      { status: "open",        count:  62 },
      { status: "in_progress", count:  41 },
      { status: "resolved",    count: 148 },
      { status: "closed",      count:  39 },
    ],
    ticketTrendSeries:   makeSeries(days, 10, 4),
    avgResolutionSeries: makeSeries(days, 4, 1.5).map((p) => ({ date: p.date, hours: parseFloat((p.value / 1_000_000).toFixed(1)) || 4.2 })).map((_, i, arr) => {
      const base = 4.2;
      const variance = 1.5;
      const noise = (Math.random() - 0.5) * 2 * variance;
      return { date: arr[i].date, hours: Math.max(0.5, parseFloat((base + noise).toFixed(1))) };
    }),
    reviewModerationQueue: {
      total:    347,
      pending:   47,
      approved: 241,
      rejected:  38,
      hidden:    21,
    },
    reviewRatingDistribution: [
      { star: 5, count: 187 },
      { star: 4, count:  94 },
      { star: 3, count:  38 },
      { star: 2, count:  17 },
      { star: 1, count:  11 },
    ],
    topIssueCategories: [
      { category: "Giao hàng chậm",        count:  94, avgResolutionH: 6.2 },
      { category: "Sản phẩm lỗi/hư hỏng", count:  72, avgResolutionH: 9.8 },
      { category: "Thanh toán thất bại",   count:  58, avgResolutionH: 2.1 },
      { category: "Hoàn trả/đổi hàng",    count:  47, avgResolutionH: 12.4 },
      { category: "Câu hỏi sản phẩm",     count:  38, avgResolutionH: 1.8 },
      { category: "Tài khoản / Đăng nhập",count:  22, avgResolutionH: 1.3 },
    ],
  };
}
