"use client";

import { useState, useEffect } from "react";
import Link                          from "next/link";
import { KpiCardGrid }               from "../KpiCardGrid";
import { ReportPeriodSelector }      from "../ReportPeriodSelector";
import { DataTable }                 from "../DataTable";
import { ProductStackedBarChart }    from "./ProductStackedBarChart";
import { TopProductsBarChart }       from "@/src/components/admin/dashboard/TopProductsBarChart";
import { Tabs, TabPanel }            from "@/src/components/ui/Tabs";
import { Skeleton }                  from "@/src/components/ui/Skeleton";
import { StarRating }                from "@/src/components/ui/StarRating";
import { Tooltip }                   from "@/src/components/ui/Tooltip";
import { getProductPerformanceReport } from "@/src/services/report.service";
import type { ProductPerformanceReport, ReportPeriod } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProductReportClientProps {
  initialData: ProductPerformanceReport;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProductReportClient({ initialData }: ProductReportClientProps) {
  const [period,  setPeriod]  = useState<ReportPeriod>("30d");
  const [data,    setData]    = useState<ProductPerformanceReport>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getProductPerformanceReport(period).then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [period]);

  const categoryBarData = data.soldByCategory.map((c) => ({
    productId: c.category,
    name:      c.category,
    unitsSold: c.unitsSold,
    revenue:   0,
  }));

  // "Đánh giá cao" tab — product name is a link to variant detail page
  const ratingRows = data.topByRating.map((p) => ({
    name: (
      <Tooltip content={p.name} placement="top" anchorToContent>
        <Link
          href={`/products/${p.productId}/variants/${p.variantId}`}
          className="block max-w-[220px] truncate font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          {p.name}
        </Link>
      </Tooltip>
    ),
    avgRating:   <StarRating value={p.avgRating} size="sm" showValue />,
    reviewCount: <span className="tabular-nums">{p.reviewCount.toLocaleString("vi-VN")}</span>,
  }));

  // "Ít bán" tab — variant name is a link to variant detail page
  const slowRows = data.slowMoving.map((p) => ({
    name: (
      <Tooltip content={p.name} placement="top" anchorToContent>
        <Link
          href={`/products/${p.productId}/variants/${p.variantId}`}
          className="block max-w-[220px] truncate font-medium text-primary-600 hover:text-primary-700 hover:underline"
        >
          {p.name}
        </Link>
      </Tooltip>
    ),
    sku:              <span className="font-mono text-xs text-secondary-400">{p.sku}</span>,
    stock:            <span className="tabular-nums">{p.stock}</span>,
    daysSinceLastSale:(
      <span className={p.daysSinceLastSale > 60 ? "font-bold text-amber-600" : ""}>
        {p.daysSinceLastSale} ngày
      </span>
    ),
  }));

  const TABS = [
    { value: "top",    label: "Bán chạy"               },
    { value: "rating", label: "Đánh giá cao"           },
    { value: "slow",   label: "Ít bán (Slow-moving)"   },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Báo cáo Sản phẩm</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Hiệu suất bán hàng, đánh giá và tồn kho chậm</p>
        </div>
        <ReportPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? <ProductReportSkeleton /> : (
        <>
          <KpiCardGrid cards={[
            data.kpis.totalSold,
            data.kpis.newListings,
            data.kpis.avgRating,
            data.kpis.outOfStockRate,
          ]} />

          {/* Product tabs */}
          <Tabs tabs={TABS} defaultValue="top">
            {/* Bán chạy — stacked bar chart with variant breakdown */}
            <TabPanel value="top" className="pt-4">
              <ProductStackedBarChart data={data.topByRevenue} />
            </TabPanel>

            {/* Đánh giá cao */}
            <TabPanel value="rating" className="pt-4">
              <DataTable
                columns={[
                  { key: "name",        label: "Tên phiên bản" },
                  { key: "avgRating",   label: "Đánh giá TB"   },
                  { key: "reviewCount", label: "Số đánh giá", align: "right" },
                ]}
                rows={ratingRows}
              />
            </TabPanel>

            {/* Ít bán */}
            <TabPanel value="slow" className="pt-4">
              <DataTable
                columns={[
                  { key: "name",              label: "Tên sản phẩm"         },
                  { key: "sku",               label: "SKU"                  },
                  { key: "stock",             label: "Tồn kho",  align: "right" },
                  { key: "daysSinceLastSale", label: "Ngày kể từ bán cuối", align: "right" },
                ]}
                rows={slowRows}
              />
            </TabPanel>
          </Tabs>

          {/* Sold by category */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-secondary-800">Số lượng bán theo danh mục</h2>
            <TopProductsBarChart data={categoryBarData} />
          </div>
        </>
      )}
    </div>
  );
}

function ProductReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton variant="rect" className="h-96 rounded-2xl" />
    </div>
  );
}
