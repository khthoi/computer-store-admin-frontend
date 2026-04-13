"use client";

import { useState, useEffect }      from "react";
import Link                         from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { KpiCardGrid }              from "../KpiCardGrid";
import { ReportPeriodSelector }     from "../ReportPeriodSelector";
import { SimpleAreaChart }          from "../SimpleAreaChart";
import { DataTable }                from "../DataTable";
import { ResolutionTimeChart }      from "./ResolutionTimeChart";
import { ReviewRatingBar }          from "./ReviewRatingBar";
import { Tabs, TabPanel }           from "@/src/components/ui/Tabs";
import { Skeleton }                 from "@/src/components/ui/Skeleton";
import { getSupportReport }         from "@/src/services/report.service";
import type { SupportReport, ReportPeriod } from "@/src/types/report.types";

// ─── Config ───────────────────────────────────────────────────────────────────

const TICKET_STATUS_LABELS: Record<string, string> = {
  pending:     "Chờ xử lý",
  open:        "Đang mở",
  in_progress: "Đang xử lý",
  resolved:    "Đã xử lý",
  closed:      "Đã đóng",
};

const TICKET_STATUS_COLORS: Record<string, string> = {
  pending:     "#f59e0b",
  open:        "#3b82f6",
  in_progress: "#8b5cf6",
  resolved:    "#10b981",
  closed:      "#94a3b8",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupportReportClientProps {
  initialData: SupportReport;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupportReportClient({ initialData }: SupportReportClientProps) {
  const [period,  setPeriod]  = useState<ReportPeriod>("30d");
  const [data,    setData]    = useState<SupportReport>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getSupportReport(period).then((d) => {
      if (!cancelled) { setData(d); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [period]);

  const issueCatRows = data.topIssueCategories.map((c) => ({
    category:      <span className="font-medium text-secondary-800">{c.category}</span>,
    count:         <span className="tabular-nums">{c.count.toLocaleString("vi-VN")}</span>,
    avgResolution: <span className="tabular-nums">{c.avgResolutionH.toFixed(1)} giờ</span>,
  }));

  const queue = data.reviewModerationQueue;

  const TABS = [
    { value: "tickets", label: "Hỗ trợ (Ticket)"     },
    { value: "reviews", label: "Đánh giá (Review)"   },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-secondary-900">Báo cáo Hỗ trợ &amp; Đánh giá</h1>
          <p className="text-sm text-secondary-500 mt-0.5">Ticket hỗ trợ, thời gian xử lý và kiểm duyệt đánh giá</p>
        </div>
        <ReportPeriodSelector value={period} onChange={setPeriod} />
      </div>

      {loading ? <SupportSkeleton /> : (
        <>
          <KpiCardGrid cards={[
            data.kpis.totalTickets,
            data.kpis.resolvedRate,
            data.kpis.avgResolutionH,
            data.kpis.pendingReviews,
          ]} />

          <Tabs tabs={TABS} defaultValue="tickets">
            {/* ── Tickets tab ── */}
            <TabPanel value="tickets" className="pt-4 space-y-6">
              {/* Donut + trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-secondary-800 mb-4">Ticket theo trạng thái</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.ticketsByStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {data.ticketsByStatus.map((d, i) => (
                          <Cell key={i} fill={TICKET_STATUS_COLORS[d.status] ?? "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => [
                          Number(v).toLocaleString("vi-VN") + " ticket",
                          TICKET_STATUS_LABELS[String(name)] ?? String(name),
                        ]}
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
                    {data.ticketsByStatus.map((d) => (
                      <div key={d.status} className="flex items-center gap-1.5">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: TICKET_STATUS_COLORS[d.status] ?? "#94a3b8" }}
                          aria-hidden="true"
                        />
                        <span className="text-xs text-secondary-600">
                          {TICKET_STATUS_LABELS[d.status] ?? d.status}
                        </span>
                        <span className="text-xs font-semibold text-secondary-800">
                          {d.count.toLocaleString("vi-VN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <SimpleAreaChart
                  data={data.ticketTrendSeries}
                  title="Xu hướng ticket mới"
                  valueUnit="count"
                  color="#f59e0b"
                />
              </div>

              {/* Resolution time chart */}
              <ResolutionTimeChart data={data.avgResolutionSeries} />

              {/* Top issue categories */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-secondary-800">Danh mục vấn đề hàng đầu</h3>
                <DataTable
                  columns={[
                    { key: "category",      label: "Danh mục"            },
                    { key: "count",         label: "Số lượng", align: "right" },
                    { key: "avgResolution", label: "TG xử lý TB", align: "right" },
                  ]}
                  rows={issueCatRows}
                />
              </div>
            </TabPanel>

            {/* ── Reviews tab ── */}
            <TabPanel value="reviews" className="pt-4 space-y-6">
              {/* Moderation queue */}
              <div className="bg-white rounded-2xl border border-secondary-100 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-secondary-800 mb-4">Hàng chờ kiểm duyệt</h3>
                <div className="flex flex-wrap gap-3">
                  <QueuePill label="Tổng"     count={queue.total}    color="bg-secondary-100 text-secondary-700" />
                  <Link href="/reviews?status=Pending">
                    <QueuePill label="Chờ duyệt" count={queue.pending}  color="bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer" />
                  </Link>
                  <QueuePill label="Đã duyệt" count={queue.approved} color="bg-success-50 text-success-700" />
                  <QueuePill label="Từ chối"  count={queue.rejected} color="bg-error-50 text-error-700" />
                  <QueuePill label="Đã ẩn"    count={queue.hidden}   color="bg-secondary-100 text-secondary-500" />
                </div>
              </div>

              {/* Rating distribution */}
              <ReviewRatingBar distribution={data.reviewRatingDistribution} />
            </TabPanel>
          </Tabs>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QueuePill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={["rounded-xl px-4 py-3 flex flex-col gap-1 min-w-[90px] transition-colors", color].join(" ")}>
      <span className="text-xs font-medium opacity-75">{label}</span>
      <span className="text-xl font-bold tabular-nums">{count.toLocaleString("vi-VN")}</span>
    </div>
  );
}

function SupportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} variant="rect" className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton variant="rect" className="h-80 rounded-2xl" />
        <Skeleton variant="rect" className="h-80 rounded-2xl" />
      </div>
      <Skeleton variant="rect" className="h-56 rounded-2xl" />
    </div>
  );
}
