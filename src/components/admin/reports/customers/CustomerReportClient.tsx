"use client";

import { useState, useEffect }   from "react";
import Link                      from "next/link";
import { KpiCardGrid }           from "../KpiCardGrid";
import { ReportPeriodSelector }  from "../ReportPeriodSelector";
import { SimpleAreaChart }       from "../SimpleAreaChart";
import { DataTable }             from "../DataTable";
import { RfmSegmentBadge }       from "../RfmSegmentBadge";
import { ProgressBar }           from "@/src/components/ui/ProgressBar";
import { Skeleton }              from "@/src/components/ui/Skeleton";
import { getCustomerReport }     from "@/src/services/report.service";
import type { CustomerReport, ReportPeriod } from "@/src/types/report.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomerReportClientProps {
  initialData: CustomerReport;
}

// ─── Cohort cell helper ───────────────────────────────────────────────────────

function retentionCellClass(pct: number): string {
  if (pct === 0)   return "text-secondary-300 text-xs tabular-nums";
  if (pct >= 80)   return "bg-violet-500 text-white text-xs tabular-nums font-semibold rounded px-1";
  if (pct >= 50)   return "bg-violet-300 text-violet-900 text-xs tabular-nums rounded px-1";
  if (pct >= 30)   return "bg-violet-200 text-violet-800 text-xs tabular-nums rounded px-1";
  return "bg-violet-100 text-violet-700 text-xs tabular-nums rounded px-1";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerReportClient({ initialData }: CustomerReportClientProps) {
  const [period,  setPeriod]  = useState<ReportPeriod>("30d");
  const [data,    setData]    = useState<CustomerReport>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCustomerReport(period).then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [period]);

  const topCustomerRows = data.topCustomers.map((c) => ({
    name:       (
      <Link
        href={`/customers/${c.customerId}`}
        className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
      >
        {c.name}
      </Link>
    ),
    totalSpent: <span className="tabular-nums font-semibold">{vnd(c.totalSpent)}</span>,
    orderCount: <span className="tabular-nums">{c.orderCount}</span>,
    segment:    <RfmSegmentBadge segment={c.segment} />,
  }));

  const cohortRows = data.retentionByMonth.map((r) => ({
    cohort: <span className="font-mono text-xs text-secondary-600">{r.cohort}</span>,
    m0:     <span className={retentionCellClass(r.m0)}>{r.m0 ? r.m0 + "%" : "—"}</span>,
    m1:     <span className={retentionCellClass(r.m1)}>{r.m1 ? r.m1 + "%" : "—"}</span>,
    m2:     <span className={retentionCellClass(r.m2)}>{r.m2 ? r.m2 + "%" : "—"}</span>,
    m3:     <span className={retentionCellClass(r.m3)}>{r.m3 ? r.m3 + "%" : "—"}</span>,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Báo cáo Khách hàng</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Phân tích hành vi, phân khúc RFM và giá trị vòng đời khách hàng</p>
        </div>
        <ReportPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? <CustomerSkeleton /> : (
        <>
          <KpiCardGrid cards={[
            data.kpis.totalCustomers,
            data.kpis.newCustomers,
            data.kpis.repeatRate,
            data.kpis.avgClv,
          ]} />

          <SimpleAreaChart
            data={data.acquisitionSeries}
            title="Khách hàng mới theo ngày"
            valueUnit="count"
            color="#0ea5e9"
          />

          {/* RFM segments */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-secondary-800">Phân khúc RFM</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {data.rfmSegments.map((seg) => (
                <div
                  key={seg.segment}
                  className="bg-white rounded-xl border border-secondary-100 p-4 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <RfmSegmentBadge segment={seg.segment} />
                    <span className="text-sm font-bold text-secondary-800 tabular-nums">
                      {seg.count.toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <ProgressBar value={seg.share} max={100} variant="default" size="sm" showValue />
                  <p className="text-xs text-secondary-400">
                    AOV: <span className="font-semibold text-secondary-600">{vnd(seg.avgOrderValue)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top customers */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-secondary-800">Khách hàng chi tiêu cao nhất</h2>
            <DataTable
              columns={[
                { key: "name",       label: "Khách hàng"  },
                { key: "totalSpent", label: "Tổng chi tiêu", align: "right" },
                { key: "orderCount", label: "Đơn hàng",     align: "right" },
                { key: "segment",    label: "Phân khúc",    align: "center" },
              ]}
              rows={topCustomerRows}
            />
          </div>

          {/* Cohort retention */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-secondary-800">Tỉ lệ giữ chân theo cohort</h2>
            <p className="text-xs text-secondary-400">
              M0 = tháng đầu, M1/M2/M3 = % khách quay lại trong tháng tiếp theo
            </p>
            <DataTable
              columns={[
                { key: "cohort", label: "Cohort" },
                { key: "m0",    label: "M0",     align: "center" },
                { key: "m1",    label: "M1",     align: "center" },
                { key: "m2",    label: "M2",     align: "center" },
                { key: "m3",    label: "M3",     align: "center" },
              ]}
              rows={cohortRows}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function vnd(v: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v);
}

function CustomerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" className="h-24 rounded-2xl" />)}
      </div>
      <Skeleton variant="rect" className="h-56 rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} variant="rect" className="h-28 rounded-xl" />)}
      </div>
    </div>
  );
}
