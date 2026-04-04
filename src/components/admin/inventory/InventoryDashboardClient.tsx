"use client";

import Link from "next/link";
import {
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import { formatVND } from "@/src/lib/format";
import type { InventoryStats } from "@/src/types/inventory.types";

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href?: string;
  alert?: boolean;
}

function StatCard({ label, value, icon, iconBg, iconColor, href, alert }: StatCardProps) {
  const inner = (
    <div
      className={[
        "flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition-shadow",
        href ? "hover:shadow-md cursor-pointer" : "",
        alert ? "border-warning-200" : "border-secondary-100",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          iconBg,
          iconColor,
        ].join(" ")}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm text-secondary-500 truncate">{label}</p>
        <p className={["text-2xl font-bold tabular-nums", alert ? "text-warning-700" : "text-secondary-900"].join(" ")}>
          {value}
        </p>
      </div>
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryDashboardClient({ stats }: { stats: InventoryStats }) {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Inventory Overview</h1>
        <p className="mt-1 text-sm text-secondary-500">
          Real-time stock health across all SKUs.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total SKUs"
          value={stats.totalSkus}
          icon={<ArchiveBoxIcon className="w-6 h-6" />}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          href="/inventory/items"
        />
        <StatCard
          label="Total Units on Hand"
          value={stats.totalUnits.toLocaleString("vi-VN")}
          icon={<ArchiveBoxIcon className="w-6 h-6" />}
          iconBg="bg-info-50"
          iconColor="text-info-600"
        />
        <StatCard
          label="Inventory Value"
          value={formatVND(stats.totalInventoryValue)}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          iconBg="bg-success-50"
          iconColor="text-success-600"
        />
        <StatCard
          label="Low Stock SKUs"
          value={stats.lowStockCount}
          icon={<ExclamationTriangleIcon className="w-6 h-6" />}
          iconBg="bg-warning-50"
          iconColor="text-warning-600"
          href="/inventory/low-stock"
          alert={stats.lowStockCount > 0}
        />
        <StatCard
          label="Out of Stock SKUs"
          value={stats.outOfStockCount}
          icon={<NoSymbolIcon className="w-6 h-6" />}
          iconBg="bg-error-50"
          iconColor="text-error-600"
          href="/inventory/low-stock"
          alert={stats.outOfStockCount > 0}
        />
        <StatCard
          label="Pending Stock-In"
          value={stats.pendingStockIn}
          icon={<ArrowDownTrayIcon className="w-6 h-6" />}
          iconBg="bg-info-50"
          iconColor="text-info-600"
          href="/inventory/stock-in"
        />
        <StatCard
          label="Pending Returns"
          value={stats.pendingReturns}
          icon={<ArrowPathIcon className="w-6 h-6" />}
          iconBg="bg-secondary-100"
          iconColor="text-secondary-600"
          href="/orders/returns"
        />
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-secondary-900">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/inventory/stock-in/new"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            New Stock-In
          </Link>
          <Link
            href="/inventory/stock-out"
            className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            View Stock-Out
          </Link>
          <Link
            href="/orders/returns"
            className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <ArrowPathIcon className="w-4 h-4" />
            View Returns
          </Link>
          <Link
            href="/inventory/movements"
            className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            Movements Log
          </Link>
          <Link
            href="/inventory/suppliers"
            className="inline-flex items-center gap-2 rounded-xl border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
          >
            <ArchiveBoxIcon className="w-4 h-4" />
            Suppliers
          </Link>
        </div>
      </div>
    </div>
  );
}
