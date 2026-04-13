"use client";

import { useState, useEffect } from "react";
import { KpiCardGrid }           from "./KpiCardGrid";
import { ReportPeriodSelector }  from "./ReportPeriodSelector";
import { SimpleAreaChart }       from "./SimpleAreaChart";
import { StockHealthDonut }      from "./StockHealthDonut";
import { getExecutiveSummary }   from "@/src/services/report.service";
import { Skeleton }              from "@/src/components/ui/Skeleton";
import type { ExecutiveSummaryReport, ReportPeriod } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReportsSummaryClientProps {
  initialData: ExecutiveSummaryReport;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportsSummaryClient({ initialData }: ReportsSummaryClientProps) {
  const [period,  setPeriod]  = useState<ReportPeriod>("30d");
  const [data,    setData]    = useState<ExecutiveSummaryReport>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getExecutiveSummary(period).then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [period]);

  return (
    <div className="space-y-8">
      {/* Header + period */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Tổng quan kinh doanh</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Toàn bộ chỉ số hoạt động trong kỳ được chọn</p>
        </div>
        <ReportPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? (
        <SummarySkeleton />
      ) : (
        <>
          {/* ── Revenue ── */}
          <section className="space-y-4">
            <SectionTitle>Doanh thu</SectionTitle>
            <KpiCardGrid cards={[
              data.revenue.kpis.gmv,
              data.revenue.kpis.netRevenue,
              data.revenue.kpis.avgOrderValue,
              data.revenue.kpis.returnRate,
            ]} />
            <SimpleAreaChart
              data={data.revenue.gmvSeries}
              title="GMV theo ngày"
              valueUnit="vnd"
            />
          </section>

          {/* ── Products + Customers ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="space-y-4">
              <SectionTitle>Sản phẩm</SectionTitle>
              <KpiCardGrid cards={[
                data.products.kpis.totalSold,
                data.products.kpis.newListings,
                data.products.kpis.avgRating,
                data.products.kpis.outOfStockRate,
              ]} />
            </section>

            <section className="space-y-4">
              <SectionTitle>Khách hàng</SectionTitle>
              <KpiCardGrid cards={[
                data.customers.kpis.totalCustomers,
                data.customers.kpis.newCustomers,
                data.customers.kpis.repeatRate,
                data.customers.kpis.avgClv,
              ]} />
              <SimpleAreaChart
                data={data.customers.acquisitionSeries}
                title="Khách mới theo ngày"
                valueUnit="count"
                color="#0ea5e9"
                height={150}
              />
            </section>
          </div>

          {/* ── Inventory + Support ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="space-y-4">
              <SectionTitle>Kho hàng</SectionTitle>
              <KpiCardGrid cards={[
                data.inventory.kpis.totalSku,
                data.inventory.kpis.outOfStock,
                data.inventory.kpis.avgDoi,
                data.inventory.kpis.turnoverRate,
              ]} />
              <StockHealthDonut buckets={data.inventory.stockHealthBuckets} />
            </section>

            <section className="space-y-4">
              <SectionTitle>Hỗ trợ &amp; Đánh giá</SectionTitle>
              <KpiCardGrid cards={[
                data.support.kpis.totalTickets,
                data.support.kpis.resolvedRate,
                data.support.kpis.avgResolutionH,
                data.support.kpis.pendingReviews,
              ]} />
              <SectionTitle>Khuyến mãi</SectionTitle>
              <KpiCardGrid cards={[
                data.promotions.kpis.totalPromotions,
                data.promotions.kpis.couponUsageRate,
                data.promotions.kpis.avgDiscountDepth,
                data.promotions.kpis.incrementalRevenue,
              ]} />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-secondary-500">
      {children}
    </h2>
  );
}

function SummarySkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4">
          <Skeleton variant="text" className="w-24 h-4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} variant="rect" className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
