"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  PhotoIcon,
  ChartBarIcon,
  CubeIcon,
  InformationCircleIcon,
  NoSymbolIcon,
  StopCircleIcon
} from "@heroicons/react/24/outline";
import { Button }   from "@/src/components/ui/Button";
import { Tabs, TabPanel } from "@/src/components/ui/Tabs";
import { useToast } from "@/src/components/ui/Toast";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { FlashSaleStatusBadge }     from "./FlashSaleStatusBadge";
import { FlashSaleCountdownTimer }  from "./FlashSaleCountdownTimer";
import { ConfirmDialog }            from "@/src/components/admin/ConfirmDialog";
import { DataTable, type ColumnDef } from "@/src/components/admin/DataTable";
import {
  getFlashSaleById,
  cancelFlashSale,
  endFlashSaleEarly,
} from "@/src/services/flash-sale.service";
import { formatVND, formatDateTime } from "@/src/lib/format";
import type { FlashSale, FlashSaleItem } from "@/src/types/flash-sale.types";

// DataTable requires T extends Record<string, unknown>
type FlashSaleItemRow = FlashSaleItem & Record<string, unknown>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function discountPct(flash: number, original: number): number {
  if (!original || flash >= original) return 0;
  return Math.round(((original - flash) / original) * 100);
}

function MetaField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ItemProgressBar({ sold, limit }: { sold: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, Math.round((sold / limit) * 100)) : 0;
  const colorClass =
    pct >= 90 ? "bg-error-500" : pct >= 60 ? "bg-warning-500" : "bg-success-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-secondary-500">
        <span>{sold} / {limit}</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Variant name cell: thumbnail + product name + clickable variant link + SKU */
function VariantNameCell({ item }: { item: FlashSaleItem }) {
  const variantHref = item.sanPhamId
    ? `/products/${item.sanPhamId}/variants/${item.phienBanId}`
    : null;

  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0 h-10 w-10 rounded-lg border border-secondary-100 bg-secondary-50 flex items-center justify-center overflow-hidden">
        {item.hinhAnh ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.hinhAnh} alt="" className="h-full w-full object-cover rounded-lg" />
        ) : (
          <PhotoIcon className="h-5 w-5 text-secondary-300" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-secondary-500 truncate max-w-[280px]">{item.sanPhamTen}</p>
        {variantHref ? (
          <Tooltip
            content={`${item.tenPhienBan} — ${item.skuSnapshot}`}
            placement="top"
          >
            <Link
              href={variantHref}
              className="block truncate max-w-[280px] font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-2 text-sm"
            >
              {item.tenPhienBan}
            </Link>
          </Tooltip>
        ) : (
          <p className="truncate max-w-[280px] font-medium text-secondary-900 text-sm">
            {item.tenPhienBan}
          </p>
        )}
        <p className="font-mono text-xs text-secondary-400 mt-0.5">{item.skuSnapshot}</p>
      </div>
    </div>
  );
}

/** Stats tab variant name cell: link + SKU */
function StatsVariantCell({ item }: { item: FlashSaleItem }) {
  const variantHref = item.sanPhamId
    ? `/products/${item.sanPhamId}/variants/${item.phienBanId}`
    : null;

  return (
    <div className="min-w-0">
      {variantHref ? (
        <Tooltip
          content={`${item.tenPhienBan} — ${item.skuSnapshot}`}
          placement="top"
        >
          <Link
            href={variantHref}
            className="block truncate max-w-[280px] font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-2"
          >
            {item.tenPhienBan}
          </Link>
        </Tooltip>
      ) : (
        <p className="truncate max-w-[280px] font-medium text-secondary-900">
          {item.tenPhienBan}
        </p>
      )}
      <p className="font-mono text-xs text-secondary-400 mt-0.5">{item.skuSnapshot}</p>
    </div>
  );
}

// ─── Column definitions ────────────────────────────────────────────────────────

const PRODUCT_COLUMNS: ColumnDef<FlashSaleItemRow>[] = [
  {
    key: "tenPhienBan",
    header: "Phiên bản sản phẩm",
    render: (_, row) => <VariantNameCell item={row as unknown as FlashSaleItem} />,
  },
  {
    key: "giaGocSnapshot",
    header: "Giá gốc",
    align: "right",
    render: (v) => (
      <span className="text-xs text-secondary-500 whitespace-nowrap">
        {formatVND(v as number)}
      </span>
    ),
  },
  {
    key: "giaFlash",
    header: "Giá flash",
    align: "right",
    render: (v) => (
      <span className="font-semibold text-primary-700 whitespace-nowrap">
        {formatVND(v as number)}
      </span>
    ),
  },
  {
    key: "discountPct",
    header: "% Giảm",
    align: "center",
    render: (_, row) => {
      const item = row as unknown as FlashSaleItem;
      const pct = discountPct(item.giaFlash, item.giaGocSnapshot);
      return pct > 0 ? (
        <span className="rounded-md bg-success-50 border border-success-200 px-1.5 py-0.5 text-xs font-bold text-success-700">
          -{pct}%
        </span>
      ) : null;
    },
  },
  {
    key: "soLuongDaBan",
    header: "Đã bán / Giới hạn",
    width: "min-w-[140px]",
    render: (_, row) => {
      const item = row as unknown as FlashSaleItem;
      return <ItemProgressBar sold={item.soLuongDaBan} limit={item.soLuongGioiHan} />;
    },
  },
  {
    key: "thuTuHienThi",
    header: "Thứ tự",
    align: "center",
  },
];

// Stats tab columns — sorted by revenue, computed outside to avoid re-creation
function buildStatsColumns(): ColumnDef<FlashSaleItemRow>[] {
  return [
    {
      key: "tenPhienBan",
      header: "Phiên bản",
      render: (_, row) => <StatsVariantCell item={row as unknown as FlashSaleItem} />,
    },
    {
      key: "soLuongDaBan",
      header: "Đã bán",
      align: "right",
      render: (v) => (
        <span className="text-secondary-700">{v as number}</span>
      ),
    },
    {
      key: "doanhThuFlash",
      header: "Doanh thu flash",
      align: "right",
      render: (_, row) => {
        const item = row as unknown as FlashSaleItem;
        return (
          <span className="font-semibold text-primary-700">
            {formatVND(item.giaFlash * item.soLuongDaBan)}
          </span>
        );
      },
    },
  ];
}

const STATS_COLUMNS = buildStatsColumns();

// ─── Tabs config ───────────────────────────────────────────────────────────────

const TABS = [
  { value: "info",     label: "Thông tin",  icon: <InformationCircleIcon className="w-4 h-4" /> },
  { value: "products", label: "Sản phẩm",   icon: <CubeIcon className="w-4 h-4" /> },
  { value: "stats",    label: "Thống kê",   icon: <ChartBarIcon className="w-4 h-4" /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function FlashSaleDetailClient({ flashSaleId }: { flashSaleId: string }) {
  const router     = useRouter();
  const { showToast } = useToast();

  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [isBusy,    setIsBusy]    = useState(false);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showEndDialog,    setShowEndDialog]    = useState(false);

  useEffect(() => {
    getFlashSaleById(flashSaleId).then((data) => {
      setFlashSale(data);
      setLoading(false);
    });
  }, [flashSaleId]);

  async function handleAction(
    fn: () => Promise<FlashSale>,
    successMsg: string
  ) {
    setIsBusy(true);
    try {
      const updated = await fn();
      setFlashSale(updated);
      showToast(successMsg, "success");
    } catch {
      showToast("Thao tác thất bại.", "error");
    } finally {
      setIsBusy(false);
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-8 w-64 rounded bg-secondary-200" />
        <div className="h-4 w-48 rounded bg-secondary-200" />
        <div className="h-48 rounded-2xl bg-secondary-100" />
      </div>
    );
  }

  if (!flashSale) {
    return (
      <div className="p-6 text-center text-secondary-500">
        Flash Sale không tồn tại.{" "}
        <Link href="/promotions/flash-sales" className="text-primary-600 hover:underline">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const canEdit   = flashSale.trangThai === "nhap" || flashSale.trangThai === "sap_dien_ra";
  const canCancel = flashSale.trangThai === "sap_dien_ra";
  const canEnd    = flashSale.trangThai === "dang_dien_ra";
  const showStats = flashSale.trangThai !== "nhap";

  const totalSold  = flashSale.items.reduce((s, i) => s + i.soLuongDaBan, 0);
  const totalLimit = flashSale.items.reduce((s, i) => s + i.soLuongGioiHan, 0);
  const totalRevenue = flashSale.items.reduce(
    (s, i) => s + i.giaFlash * i.soLuongDaBan, 0
  );

  const productRows = flashSale.items as FlashSaleItemRow[];
  const statsRows = [...flashSale.items]
    .sort((a, b) => b.giaFlash * b.soLuongDaBan - a.giaFlash * a.soLuongDaBan) as FlashSaleItemRow[];

  return (
    <div className="p-6 space-y-6">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-secondary-400">
            <Link href="/promotions/flash-sales" className="hover:text-secondary-700 transition-colors">
              Flash Sales
            </Link>
            <span>›</span>
            <span className="text-secondary-600 font-mono">#{flashSale.flashSaleId}</span>
          </nav>

          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary-900">{flashSale.ten}</h1>
            <FlashSaleStatusBadge status={flashSale.trangThai} />
          </div>

          {/* Countdown */}
          <div className="mt-2">
            <FlashSaleCountdownTimer
              batDau={flashSale.batDau}
              ketThuc={flashSale.ketThuc}
              trangThai={flashSale.trangThai}
              onExpire={() => getFlashSaleById(flashSaleId).then((d) => d && setFlashSale(d))}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/promotions/flash-sales"
            className="inline-flex items-center gap-2 rounded-lg border border-secondary-200 bg-white px-4 py-2.5 text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Quay lại
          </Link>

          {canEdit && (
            <Button
              variant="secondary"
              onClick={() => router.push(`/promotions/flash-sales/${flashSale.flashSaleId}/edit`)}
              disabled={isBusy}
              className="rounded-lg"
            >
              <PencilSquareIcon className="w-4 h-4 mr-1.5" />
              Chỉnh sửa
            </Button>
          )}

          {canEnd && (
            <Button
              variant="danger"
              onClick={() => setShowEndDialog(true)}
              disabled={isBusy}
              className="rounded-lg"
            >
              <StopCircleIcon className="w-4 h-4 mr-1.5" />
              Kết thúc sớm
            </Button>
          )}

          {canCancel && (
            <Button
              variant="danger"
              onClick={() => setShowCancelDialog(true)}
              disabled={isBusy}
            >
              <NoSymbolIcon className="w-4 h-4 mr-1.5" />
              Hủy sự kiện
            </Button>
          )}
        </div>
      </div>

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <Tabs tabs={TABS} defaultValue="info">
        {/* ── Tab 1: Info ──────────────────────────────────────────────────── */}
        <TabPanel value="info">
          <div className="rounded-2xl border border-secondary-100 bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetaField label="ID">
                <span className="font-mono text-sm text-secondary-800">#{flashSale.flashSaleId}</span>
              </MetaField>
              <MetaField label="Trạng thái">
                <FlashSaleStatusBadge status={flashSale.trangThai} />
              </MetaField>
              <MetaField label="Số phiên bản">
                <span className="text-sm text-secondary-800">{flashSale.items.length} variants</span>
              </MetaField>
              <MetaField label="Bắt đầu">
                <span className="text-sm text-secondary-800">{formatDateTime(flashSale.batDau)}</span>
              </MetaField>
              <MetaField label="Kết thúc">
                <span className="text-sm text-secondary-800">{formatDateTime(flashSale.ketThuc)}</span>
              </MetaField>
              <MetaField label="Người tạo">
                <span className="text-sm text-secondary-800">{flashSale.createdBy}</span>
              </MetaField>
              <MetaField label="Ngày tạo">
                <span className="text-sm text-secondary-800">{formatDateTime(flashSale.createdAt)}</span>
              </MetaField>
              <MetaField label="Cập nhật">
                <span className="text-sm text-secondary-800">{formatDateTime(flashSale.updatedAt)}</span>
              </MetaField>

              {flashSale.moTa && (
                <div className="sm:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400">Mô tả</p>
                  <p className="mt-1 text-sm text-secondary-700">{flashSale.moTa}</p>
                </div>
              )}

              {/* Banner preview */}
              {(flashSale.bannerTitle || flashSale.bannerImageUrl) && (
                <div className="sm:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary-400 mb-2">Banner</p>
                  <div className="rounded-xl border border-secondary-100 bg-secondary-50 p-4 space-y-2">
                    {flashSale.bannerTitle && (
                      <p className="text-base font-bold text-secondary-900">{flashSale.bannerTitle}</p>
                    )}
                    {flashSale.bannerImageUrl && (
                      <p className="font-mono text-xs text-secondary-400 break-all">
                        {flashSale.bannerImageUrl}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabPanel>

        {/* ── Tab 2: Products ──────────────────────────────────────────────── */}
        <TabPanel value="products">
          <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
            <DataTable
              bare
              hideToolbar
              hidePagination
              data={productRows}
              keyField="flashSaleItemId"
              columns={PRODUCT_COLUMNS}
              page={1}
              pageSize={productRows.length || 1}
              totalRows={productRows.length}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              emptyMessage="Chưa có phiên bản nào trong flash sale này."
            />
          </div>
        </TabPanel>

        {/* ── Tab 3: Stats ─────────────────────────────────────────────────── */}
        <TabPanel value="stats">
          {!showStats ? (
            <div className="rounded-2xl border border-secondary-100 bg-white p-8 text-center shadow-sm">
              <ChartBarIcon className="mx-auto h-10 w-10 text-secondary-300" aria-hidden="true" />
              <p className="mt-2 text-sm text-secondary-400">
                Thống kê chỉ hiển thị sau khi sự kiện bắt đầu.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Tổng đã bán" value={String(totalSold)} />
                <StatCard label="Tổng giới hạn" value={String(totalLimit)} />
                <StatCard
                  label="Tỷ lệ bán"
                  value={totalLimit > 0 ? `${Math.round((totalSold / totalLimit) * 100)}%` : "—"}
                />
                <StatCard label="Doanh thu flash" value={formatVND(totalRevenue)} />
              </div>

              {/* Variant ranking */}
              <div className="rounded-2xl border border-secondary-100 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-secondary-100 px-5 py-3">
                  <h3 className="text-sm font-semibold text-secondary-900">
                    Phiên bản theo doanh thu flash
                  </h3>
                </div>
                <DataTable
                  bare
                  hideToolbar
                  hidePagination
                  data={statsRows}
                  keyField="flashSaleItemId"
                  columns={STATS_COLUMNS}
                  page={1}
                  pageSize={statsRows.length || 1}
                  totalRows={statsRows.length}
                  onPageChange={() => {}}
                  onPageSizeChange={() => {}}
                  emptyMessage="Chưa có dữ liệu thống kê."
                />
              </div>
            </div>
          )}
        </TabPanel>
      </Tabs>

      {/* ── Confirm dialogs ────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Hủy sự kiện Flash Sale?"
        description="Sự kiện sẽ bị hủy ngay lập tức. Thao tác này không thể hoàn tác."
        confirmLabel="Hủy sự kiện"
        variant="danger"
        onConfirm={() => {
          setShowCancelDialog(false);
          handleAction(
            () => cancelFlashSale(flashSale.flashSaleId),
            "Flash sale đã bị hủy."
          );
        }}
        onClose={() => setShowCancelDialog(false)}
      />

      <ConfirmDialog
        isOpen={showEndDialog}
        title="Kết thúc Flash Sale sớm?"
        description="Flash sale sẽ kết thúc ngay lập tức. Khách hàng sẽ không mua được nữa."
        confirmLabel="Kết thúc sớm"
        variant="warning"
        onConfirm={() => {
          setShowEndDialog(false);
          handleAction(
            () => endFlashSaleEarly(flashSale.flashSaleId),
            "Flash sale đã kết thúc sớm."
          );
        }}
        onClose={() => setShowEndDialog(false)}
      />
    </div>
  );
}

// ─── Stat card helper ─────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-secondary-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium text-secondary-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-secondary-900">{value}</p>
    </div>
  );
}
