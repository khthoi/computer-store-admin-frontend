"use client";

import { useEffect, useState } from "react";
import {
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  NoSymbolIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ClipboardDocumentListIcon,
  BoltIcon,
  TruckIcon,
  ListBulletIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import { formatVND } from "@/src/lib/format";
import { getInventoryKpiDashboard } from "@/src/services/inventory.service";
import type { InventoryKpiDashboard } from "@/src/types/inventory.types";
import { Button } from "@/src/components/ui/Button";
import { DateInput } from "@/src/components/ui/DateInput";
import { Skeleton } from "@/src/components/ui/Skeleton";

// ─── Stat card — hiển thị số liệu, KHÔNG bấm được ───────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  alert?: "warning" | "error";
  sub?: string;
}

function StatCard({ label, value, icon, iconBg, iconColor, alert, sub }: StatCardProps) {
  return (
    <div className={[
      "flex items-center gap-4 rounded-2xl border p-5 shadow-sm",
      alert === "error"   ? "border-l-4 border-l-error-500 border-error-100 bg-error-50/50"     :
      alert === "warning" ? "border-l-4 border-l-warning-500 border-warning-100 bg-warning-50/50" :
      "border-secondary-100 bg-white",
    ].join(" ")}>
      <span className={["flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconBg, iconColor].join(" ")}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-secondary-500 truncate">{label}</p>
        <p className={[
          "mt-0.5 text-xl font-bold tabular-nums leading-tight",
          alert === "error"   ? "text-error-700"   :
          alert === "warning" ? "text-warning-700" :
          "text-secondary-900",
        ].join(" ")}>
          {value}
        </p>
        {sub && <p className="mt-0.5 text-xs text-secondary-400">{sub}</p>}
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
      <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-24 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  );
}

// ─── Period selector ──────────────────────────────────────────────────────────

type Period = "month" | "quarter" | "year" | "custom";

interface PeriodSelectorProps {
  value: Period;
  onChange: (p: Period) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (d: string) => void;
  onDateToChange: (d: string) => void;
}

function PeriodSelector({ value, onChange, dateFrom, dateTo, onDateFromChange, onDateToChange }: PeriodSelectorProps) {
  const options: { value: Period; label: string }[] = [
    { value: "month",   label: "Tháng này" },
    { value: "quarter", label: "Quý này"   },
    { value: "year",    label: "Năm này"   },
    { value: "custom",  label: "Tùy chỉnh" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((o) => (
        <Button
          key={o.value}
          size="sm"
          variant={value === o.value ? "primary" : "secondary"}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Button>
      ))}
      {value === "custom" && (
        <>
          <DateInput
            size="sm"
            placeholder="Từ ngày"
            value={dateFrom}
            onChange={onDateFromChange}
            className="w-36"
          />
          <span className="text-secondary-400 text-sm">—</span>
          <DateInput
            size="sm"
            placeholder="Đến ngày"
            value={dateTo}
            onChange={onDateToChange}
            className="w-36"
          />
        </>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryDashboardClient() {
  const [period, setPeriod] = useState<Period>("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [kpi, setKpi] = useState<InventoryKpiDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = period === "custom"
          ? { startDate: dateFrom, endDate: dateTo }
          : { period };
        const data = await getInventoryKpiDashboard(params);
        setKpi(data);
      } catch {
        // giữ data cũ
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [period, dateFrom, dateTo]);

  const stats = kpi?.basicStats;
  const urgentItems = kpi?.urgentReorders?.filter((i) => i.urgency === "khan_cap") ?? [];

  return (
    <div className="space-y-8 p-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tổng quan tồn kho</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Số liệu thời gian thực — chọn kỳ để xem hiệu suất tương ứng.
          </p>
        </div>
        <PeriodSelector
          value={period}
          onChange={setPeriod}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </div>

      {/* ── Banner khẩn cấp ────────────────────────────────────────────────── */}
      {!loading && urgentItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-error-200 bg-error-50 p-4">
          <BoltIcon className="mt-0.5 h-5 w-5 shrink-0 text-error-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-error-800">
              {urgentItems.length} sản phẩm cần đặt hàng khẩn cấp
            </p>
            <ul className="mt-2 space-y-1">
              {urgentItems.slice(0, 5).map((item) => (
                <li key={item.variantId} className="flex items-center justify-between text-sm">
                  <span className="max-w-[60%] truncate text-error-700">
                    {item.productName} — {item.variantName}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-error-600">
                    Còn {item.quantityOnHand} / Mức {item.reorderPoint}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Button href="/inventory/low-stock" size="sm" variant="outline" color="danger">
            Xem chi tiết
          </Button>
        </div>
      )}

      {/* ── Kho hàng ───────────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary-400">Kho hàng</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Tổng số SKU"
                value={stats?.totalSkus ?? "—"}
                icon={<ArchiveBoxIcon className="w-5 h-5" />}
                iconBg="bg-primary-50" iconColor="text-primary-600"
              />
              <StatCard
                label="Tổng số lượng tồn kho"
                value={stats ? stats.totalUnits.toLocaleString("vi-VN") : "—"}
                icon={<ArchiveBoxIcon className="w-5 h-5" />}
                iconBg="bg-info-50" iconColor="text-info-600"
              />
              <StatCard
                label="Giá trị tồn kho"
                value={stats ? formatVND(stats.totalInventoryValue) : "—"}
                icon={<CurrencyDollarIcon className="w-5 h-5" />}
                iconBg="bg-success-50" iconColor="text-success-600"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Cảnh báo tồn kho ───────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary-400">Cảnh báo tồn kho</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Tồn kho thấp (SKUs)"
                value={stats?.lowStockCount ?? "—"}
                icon={<ExclamationTriangleIcon className="w-5 h-5" />}
                iconBg="bg-warning-50" iconColor="text-warning-600"
                alert={(stats?.lowStockCount ?? 0) > 0 ? "warning" : undefined}
              />
              <StatCard
                label="Hết hàng (SKUs)"
                value={stats?.outOfStockCount ?? "—"}
                icon={<NoSymbolIcon className="w-5 h-5" />}
                iconBg="bg-error-50" iconColor="text-error-600"
                alert={(stats?.outOfStockCount ?? 0) > 0 ? "error" : undefined}
              />
              <StatCard
                label="Hàng tồn chậm (SKUs)"
                value={kpi?.deadStockCount ?? "—"}
                icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
                iconBg="bg-warning-50" iconColor="text-warning-700"
                sub={kpi ? `Giá trị: ${formatVND(kpi.deadStockValue)}` : undefined}
                alert={(kpi?.deadStockCount ?? 0) > 0 ? "warning" : undefined}
              />
            </>
          )}
        </div>
      </section>

      {/* ── Đang chờ xử lý ─────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary-400">Đang chờ xử lý</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Đang chờ nhập kho (phiếu)"
                value={stats?.pendingStockIn ?? "—"}
                icon={<ArrowDownTrayIcon className="w-5 h-5" />}
                iconBg="bg-info-50" iconColor="text-info-600"
              />
              <StatCard
                label="Giá trị hàng đang chờ nhập"
                value={kpi ? formatVND(kpi.pendingImportValue) : "—"}
                icon={<CurrencyDollarIcon className="w-5 h-5" />}
                iconBg="bg-primary-50" iconColor="text-primary-700"
              />
              <StatCard
                label="Yêu cầu hoàn trả đang chờ"
                value={stats?.pendingReturns ?? "—"}
                icon={<ArrowPathIcon className="w-5 h-5" />}
                iconBg="bg-secondary-100" iconColor="text-secondary-600"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Hiệu suất kỳ ───────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary-400">Hiệu suất trong kỳ</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Tỷ lệ luân chuyển kho (Turnover)"
                value={kpi ? `${kpi.turnoverRate.toFixed(2)}x` : "—"}
                icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
                iconBg="bg-success-50" iconColor="text-success-600"
                sub="Số lần hàng hoá được luân chuyển trong kỳ"
              />
              <StatCard
                label="Tỷ lệ đáp ứng đơn hàng (Fill Rate)"
                value={kpi ? `${(kpi.fillRate * 100).toFixed(1)}%` : "—"}
                icon={<ArrowPathIcon className="w-5 h-5" />}
                iconBg="bg-info-50" iconColor="text-info-600"
                sub="Phần trăm đơn hàng được giao đủ hàng"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Top SKUs ────────────────────────────────────────────────────────── */}
      {!loading && (kpi?.topMovingSkus?.length ?? 0) > 0 && (
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary-400">
            Top sản phẩm luân chuyển nhiều nhất
          </h2>
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-secondary-100 text-left text-xs font-medium text-secondary-500">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Sản phẩm</th>
                  <th className="px-5 py-3 text-right">Đã bán</th>
                  <th className="px-5 py-3 text-right">Turnover</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {kpi!.topMovingSkus.map((sku, idx) => (
                  <tr key={sku.variantId} className="hover:bg-secondary-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-secondary-400">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-secondary-900 truncate max-w-[220px]">{sku.productName}</p>
                      <p className="text-xs text-secondary-500">{sku.variantName}</p>
                      <p className="font-mono text-xs text-secondary-400">{sku.sku}</p>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-secondary-700">
                      {sku.totalSold.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold text-success-700">
                      {sku.turnoverRate.toFixed(2)}x
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Điều hướng nhanh ────────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-secondary-400">Điều hướng</h2>
        <div className="flex flex-wrap gap-3">
          <Button href="/inventory/stock-in/new" leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}>
            Tạo phiếu nhập hàng
          </Button>
          <Button href="/inventory/low-stock" variant="outline" color="warning" leftIcon={<ExclamationTriangleIcon className="w-4 h-4" />}>
            Tồn kho thấp &amp; hết hàng
          </Button>
          <Button href="/inventory/stock-in" variant="secondary" leftIcon={<TruckIcon className="w-4 h-4" />}>
            Phiếu nhập hàng
          </Button>
          <Button href="/inventory/items" variant="secondary" leftIcon={<ArchiveBoxIcon className="w-4 h-4" />}>
            Danh sách tồn kho
          </Button>
          <Button href="/inventory/movements" variant="secondary" leftIcon={<ListBulletIcon className="w-4 h-4" />}>
            Lịch sử xuất nhập
          </Button>
          <Button href="/orders/returns" variant="secondary" leftIcon={<ArrowPathIcon className="w-4 h-4" />}>
            Hàng hoàn trả
          </Button>
          <Button href="/inventory/suppliers" variant="secondary" leftIcon={<BuildingStorefrontIcon className="w-4 h-4" />}>
            Nhà cung cấp
          </Button>
        </div>
      </section>

    </div>
  );
}
