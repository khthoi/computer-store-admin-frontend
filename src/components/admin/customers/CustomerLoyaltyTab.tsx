"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SparklesIcon, ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import {
  getCustomerLoyaltySummary,
  getCustomerPointTransactions,
  getCustomerRedemptions,
} from "@/src/services/loyalty.service";
import type {
  CustomerLoyaltySummary,
  LoyaltyPointTransaction,
  LoyaltyRedemption,
} from "@/src/types/loyalty.types";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { useToast } from "@/src/components/ui/Toast";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  customerId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoyaltySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Balance card skeleton */}
      <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6">
        <div className="h-4 w-32 rounded bg-primary-200 mb-3" />
        <div className="h-10 w-48 rounded bg-primary-200 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="text-center">
              <div className="h-3 w-20 rounded bg-primary-200 mb-2 mx-auto" />
              <div className="h-6 w-16 rounded bg-primary-200 mx-auto" />
            </div>
          ))}
        </div>
      </div>
      {/* Table skeleton */}
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded bg-secondary-100" />
        ))}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomerLoyaltyTab({ customerId }: Props) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<CustomerLoyaltySummary | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyPointTransaction[]>([]);
  const [redemptions, setRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [subTab, setSubTab] = useState<"history" | "redemptions">("history");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getCustomerLoyaltySummary(customerId),
      getCustomerPointTransactions(customerId),
      getCustomerRedemptions(customerId),
    ]).then(([s, txns, reds]) => {
      if (!mounted) return;
      setSummary(s);
      setTransactions(txns);
      setRedemptions(reds);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [customerId]);

  if (loading) return <LoyaltySkeleton />;
  if (!summary) return <p className="text-sm text-secondary-500">No loyalty data found.</p>;

  // ── Transaction columns ────────────────────────────────────────────────────

  const txnColumns: ColumnDef<LoyaltyPointTransaction & Record<string, unknown>>[] = [
    {
      key: "createdAt",
      header: "Date",
      width: "w-[12%]",
      render: (v) => (
        <span className="text-xs text-secondary-600">{formatDateTime(v as string)}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "w-[10%]",
      render: (v) => <StatusBadge status={v as string} size="sm" />,
    },
    {
      key: "description",
      header: "Description",
      width: "w-[40%]",
      render: (v) => (
        <Tooltip content={v as string} anchorToContent>
          <span className="block truncate text-sm text-secondary-700">{v as string}</span>
        </Tooltip>
      ),
    },
    {
      key: "points",
      header: "Points",
      width: "w-[10%]",
      align: "right",
      render: (v) => {
        const pts = v as number;
        const isPositive = pts > 0;
        return (
          <span
            className={[
              "text-sm font-semibold",
              isPositive ? "text-success-600" : "text-error-600",
            ].join(" ")}
          >
            {isPositive ? "+" : ""}
            {pts.toLocaleString("vi-VN")} pts
          </span>
        );
      },
    },
    {
      key: "balanceAfter",
      header: "Balance After",
      width: "w-[10%]",
      align: "right",
      render: (v) => (
        <span className="text-sm text-secondary-600">
          {(v as number).toLocaleString("vi-VN")} pts
        </span>
      ),
    },
  ];

  // ── Redemption columns ─────────────────────────────────────────────────────

  const redColumns: ColumnDef<LoyaltyRedemption & Record<string, unknown>>[] = [
    {
      key: "redeemedAt",
      header: "Date",
      width: "w-[12%]",
      render: (v) => (
        <span className="text-xs text-secondary-600">{formatDateTime(v as string)}</span>
      ),
    },
    {
      key: "catalogItemName",
      header: "Catalog Item",
      width: "w-[20%]",
      render: (v) => (
        <Tooltip content={v as string} anchorToContent>
          <span className="block truncate text-sm text-secondary-700">{v as string}</span>
        </Tooltip>
      ),
    },
    {
      key: "pointsSpent",
      header: "Points Spent",
      width: "w-[10%]",
      align: "right",
      render: (v) => (
        <span className="text-sm font-semibold text-error-600">
          {(v as number).toLocaleString("vi-VN")} pts
        </span>
      ),
    },
    {
      key: "couponCode",
      header: "Coupon Code",
      width: "w-[15%]",
      render: (v) => (
        <span className="inline-flex items-center gap-1.5">
          <span className="font-mono text-xs bg-secondary-100 px-2 py-0.5 rounded">
            {v as string}
          </span>
          <button
            type="button"
            title="Copy"
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(v as string).then(() => {
                showToast("Copied!", "success");
              });
            }}
          >
            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
          </button>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-[10%]",
      render: (v) => <StatusBadge status={v as string} size="sm" />,
    },
    {
      key: "orderId",
      header: "Used In Order",
      width: "w-[15%]",
      render: (v) =>
        v ? (
          <Link
            href={`/orders/${v as string}`}
            className="text-sm text-primary-600 hover:underline"
          >
            {v as string}
          </Link>
        ) : (
          <span className="text-secondary-400">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Balance Card ── */}
      <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-500 mb-1">
          Current Balance
        </p>
        <p className="text-3xl font-bold text-primary-700 mb-4">
          {summary.currentBalance.toLocaleString("vi-VN")} pts
        </p>

        {summary.pendingPoints && summary.pendingPoints > 0 ? (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-100 border border-warning-200 px-3 py-1 text-xs font-semibold text-warning-700">
              <SparklesIcon className="w-3.5 h-3.5" />
              {summary.pendingPoints.toLocaleString("vi-VN")} pts pending confirmation
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-4 border-t border-primary-200 pt-4">
          <div className="text-center">
            <p className="text-xs text-primary-500 mb-1">Lifetime Earned</p>
            <p className="font-semibold text-primary-800">
              {summary.lifetimeEarned.toLocaleString("vi-VN")} pts
            </p>
          </div>
          <div className="text-center border-x border-primary-200">
            <p className="text-xs text-primary-500 mb-1">Lifetime Spent</p>
            <p className="font-semibold text-primary-800">
              {summary.lifetimeSpent.toLocaleString("vi-VN")} pts
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-primary-500 mb-1">Total Redemptions</p>
            <p className="font-semibold text-primary-800">{summary.totalRedemptions}</p>
          </div>
        </div>
      </div>

      {/* ── Sub-tabs ── */}
      <div className="flex gap-1 rounded-xl border border-secondary-200 bg-secondary-50 p-1 w-fit">
        {(
          [
            { value: "history", label: "Point History" },
            { value: "redemptions", label: "Redemptions" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSubTab(tab.value)}
            className={[
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              subTab === tab.value
                ? "bg-white text-secondary-900 shadow-sm"
                : "text-secondary-500 hover:text-secondary-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Point History ── */}
      {subTab === "history" && (
        <DataTable
          data={transactions as (LoyaltyPointTransaction & Record<string, unknown>)[]}
          columns={txnColumns}
          keyField="id"
          page={1}
          pageSize={50}
          totalRows={transactions.length}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          hidePagination={transactions.length < 50}
          tableLayout="fixed"
          emptyMessage="No point transactions found."
        />
      )}

      {/* ── Redemptions ── */}
      {subTab === "redemptions" && (
        <DataTable
          data={redemptions as (LoyaltyRedemption & Record<string, unknown>)[]}
          columns={redColumns}
          keyField="id"
          page={1}
          pageSize={50}
          totalRows={redemptions.length}
          onPageChange={() => {}}
          onPageSizeChange={() => {}}
          hidePagination={redemptions.length < 50}
          tableLayout="fixed"
          emptyMessage="No redemptions found."
        />
      )}
    </div>
  );
}
