// ─── Shared report components — public API ────────────────────────────────────

export { KpiCardGrid }          from "./KpiCardGrid";
export { ReportPeriodSelector } from "./ReportPeriodSelector";
export { SimpleAreaChart }      from "./SimpleAreaChart";
export { DataTable }            from "./DataTable";
export type { ReportColumn }    from "./DataTable";
export { RfmSegmentBadge }      from "./RfmSegmentBadge";
export { StockHealthDonut }     from "./StockHealthDonut";
export { PromotionRoiTable }    from "./PromotionRoiTable";
export { ReportsSummaryClient } from "./ReportsSummaryClient";

// ─── Page-specific client components ─────────────────────────────────────────

export { RevenueReportClient }   from "./revenue/RevenueReportClient";
export { ProductReportClient }   from "./products/ProductReportClient";
export { CustomerReportClient }  from "./customers/CustomerReportClient";
export { InventoryReportClient } from "./inventory/InventoryReportClient";
export { PromotionReportClient } from "./promotions/PromotionReportClient";
export { SupportReportClient }   from "./support/SupportReportClient";
export { ResolutionTimeChart }   from "./support/ResolutionTimeChart";
export { ReviewRatingBar }       from "./support/ReviewRatingBar";
