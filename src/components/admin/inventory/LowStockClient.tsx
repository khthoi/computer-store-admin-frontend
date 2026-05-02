"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ExclamationTriangleIcon,
  BellAlertIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { AdjustStockModal } from "@/src/components/admin/inventory/AdjustStockModal";
import { AlertThresholdModal } from "@/src/components/admin/inventory/AlertThresholdModal";
import { AlertConfigTable } from "@/src/components/admin/inventory/AlertConfigTable";
import {
  getLowStockItems,
  adjustStock,
  updateThresholds,
  getVariantStockLevel,
  getSuppliers,
  getInventorySummary,
  getInventoryItems,
  type InventoryItemParams,
} from "@/src/services/inventory.service";
import { formatVND } from "@/src/lib/format";
import { useToast } from "@/src/components/ui/Toast";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Select } from "@/src/components/ui/Select";
import type { InventoryItem, InventoryStats, Supplier } from "@/src/types/inventory.types";

type Tab = "alerts" | "configure";
type AlertFilter = "all" | "low_stock" | "out_of_stock_inv";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const SORT_OPTIONS = [
  { value: "quantityOnHand:asc",    label: "Khẩn cấp nhất (tồn kho thấp nhất)" },
  { value: "productName:asc",       label: "Tên sản phẩm A → Z" },
  { value: "productName:desc",      label: "Tên sản phẩm Z → A" },
  { value: "sku:asc",               label: "SKU A → Z" },
  { value: "quantityOnHand:desc",   label: "Tồn kho cao nhất" },
  { value: "lowStockThreshold:desc",label: "Ngưỡng cảnh báo cao nhất" },
  { value: "updatedAt:desc",        label: "Cập nhật gần nhất" },
];

function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return "Chưa có lịch sử nhập";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  const days = Math.floor(diff / 86400);
  if (days < 30) return `${days} ngày trước`;
  if (days < 365) return `${Math.floor(days / 30)} tháng trước`;
  return `${Math.floor(days / 365)} năm trước`;
}

function UrgencyBar({ qty, threshold }: { qty: number; threshold: number }) {
  if (threshold === 0) return null;
  const pct = Math.min(100, Math.round((qty / threshold) * 100));
  const barColor =
    qty === 0 ? "bg-error-500" : pct < 50 ? "bg-warning-500" : "bg-warning-300";
  return (
    <div className="mt-2">
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-xs text-secondary-400">Tồn kho / Ngưỡng</span>
        <span className="text-xs font-medium text-secondary-600">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary-100">
        <div
          className={`h-1.5 rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface Props {
  initialItems: InventoryItem[];
  initialTotal: number;
}

export function LowStockClient({ initialItems, initialTotal }: Props) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("alerts");

  // Alerts tab data
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  // Alerts tab filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [alertFilter, setAlertFilter] = useState<AlertFilter>("all");
  const [supplierId, setSupplierId] = useState("");
  const [sortValue, setSortValue] = useState("quantityOnHand:asc");

  // Configure tab — lazy-loaded all items
  const [configItems, setConfigItems] = useState<InventoryItem[]>([]);
  const configLoadedRef = useRef(false);

  // Sidebar data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<InventoryStats | null>(null);

  // Modals
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [thresholdReorderPoint, setThresholdReorderPoint] = useState(0);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  // No-flash pagination refs
  const prevNonPageKey = useRef(
    JSON.stringify({ search: "", alertFilter: "all", supplierId: "", sortValue: "quantityOnHand:asc", pageSize: 20 })
  );
  const prevSearchRef = useRef("");
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Load suppliers + summary on mount
  useEffect(() => {
    getSuppliers({ limit: 200 }).then((r) => setSuppliers(r.data)).catch(() => {});
    getInventorySummary().then(setSummary).catch(() => {});
  }, []);

  // Lazy-load all inventory items for configure tab
  useEffect(() => {
    if (activeTab === "configure" && !configLoadedRef.current) {
      configLoadedRef.current = true;
      getInventoryItems({ limit: 200 }).then((r) => setConfigItems(r.data)).catch(() => {});
    }
  }, [activeTab]);

  // Server-side fetch for alerts tab
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    const nonPageKey = JSON.stringify({ search, alertFilter, supplierId, sortValue, pageSize });
    const isPageOnly = nonPageKey === prevNonPageKey.current;
    prevNonPageKey.current = nonPageKey;

    const isSearchChange = search !== prevSearchRef.current;
    prevSearchRef.current = search;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (!isPageOnly) setLoading(true);
      try {
        const [sortKey, sortDir] = sortValue.split(":") as [string, "asc" | "desc"];
        const params: InventoryItemParams = { page, limit: pageSize, sortKey, sortDir };
        if (search) params.q = search;
        if (alertFilter !== "all") params.alertLevel = alertFilter;
        if (supplierId) params.supplierId = supplierId;
        const result = await getLowStockItems(params);
        setItems(result.data);
        setTotal(result.total);
      } catch { /* keep existing data */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [page, pageSize, search, alertFilter, supplierId, sortValue]);

  // Reset page when filters/sort/size change
  useEffect(() => {
    setPage(1);
  }, [search, alertFilter, supplierId, sortValue, pageSize]);

  // Handlers
  async function handleAdjust(delta: number, loaiGiaoDich: string, note: string) {
    if (!adjustingItem) return;
    setIsAdjusting(true);
    try {
      await adjustStock(adjustingItem.id, delta, loaiGiaoDich, note);
      setItems((prev) =>
        prev.map((i) =>
          i.id === adjustingItem.id
            ? {
                ...i,
                quantityOnHand: Math.max(0, i.quantityOnHand + delta),
                quantityAvailable: Math.max(0, i.quantityAvailable + delta),
              }
            : i
        )
      );
      setAdjustingItem(null);
      showToast("Đã điều chỉnh tồn kho.", "success");
    } catch {
      showToast("Không thể điều chỉnh tồn kho.", "error");
    } finally {
      setIsAdjusting(false);
    }
  }

  async function openThresholdModal(item: InventoryItem) {
    setThresholdItem(item);
    // Fetch current reorderPoint to pre-populate modal without resetting it
    try {
      const sl = await getVariantStockLevel(item.variantId);
      setThresholdReorderPoint(sl.reorderPoint);
    } catch {
      setThresholdReorderPoint(0);
    }
  }

  async function handleSaveThreshold(threshold: number, reorderPoint: number) {
    if (!thresholdItem) return;
    setIsSavingThreshold(true);
    try {
      await updateThresholds(thresholdItem.variantId, { lowStockThreshold: threshold, reorderPoint });
      setItems((prev) =>
        prev.map((i) => (i.id === thresholdItem.id ? { ...i, lowStockThreshold: threshold } : i))
      );
      setThresholdItem(null);
      showToast("Đã cập nhật ngưỡng cảnh báo.", "success");
    } catch {
      showToast("Không thể cập nhật ngưỡng.", "error");
    } finally {
      setIsSavingThreshold(false);
    }
  }

  const outOfStockCount = summary?.outOfStockCount ?? 0;
  const lowStockCount = summary?.lowStockCount ?? 0;
  const alertBadgeCount = outOfStockCount + lowStockCount;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Summary stats bar */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-error-100 bg-error-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-error-600">Hết hàng</p>
            <p className="mt-1 text-2xl font-bold text-error-700">{summary.outOfStockCount}</p>
            <p className="text-xs text-error-500">SKU</p>
          </div>
          <div className="rounded-xl border border-warning-100 bg-warning-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-warning-600">Tồn kho thấp</p>
            <p className="mt-1 text-2xl font-bold text-warning-700">{summary.lowStockCount}</p>
            <p className="text-xs text-warning-500">SKU</p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">Chờ nhập hàng</p>
            <p className="mt-1 text-2xl font-bold text-secondary-900">{summary.pendingStockIn}</p>
            <p className="text-xs text-secondary-400">phiếu</p>
          </div>
          <div className="rounded-xl border border-secondary-100 bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-secondary-500">Chờ hoàn trả</p>
            <p className="mt-1 text-2xl font-bold text-secondary-900">{summary.pendingReturns}</p>
            <p className="text-xs text-secondary-400">phiếu</p>
          </div>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-secondary-100 bg-secondary-50 p-1 w-fit">
        {/* Alerts tab */}
        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "alerts"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <ExclamationTriangleIcon className="w-4 h-4" />
          Các cảnh báo
          {alertBadgeCount > 0 && (
            <span className={[
              "rounded-full px-1.5 py-0.5 text-xs font-semibold",
              activeTab === "alerts" ? "bg-error-100 text-error-700" : "bg-secondary-200 text-secondary-600",
            ].join(" ")}>
              {alertBadgeCount}
            </span>
          )}
        </button>

        {/* Configure tab */}
        <button
          type="button"
          onClick={() => setActiveTab("configure")}
          className={[
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "configure"
              ? "bg-white text-secondary-900 shadow-sm"
              : "text-secondary-500 hover:text-secondary-700",
          ].join(" ")}
        >
          <AdjustmentsHorizontalIcon className="w-4 h-4" />
          Thiết lập ngưỡng
        </button>
      </div>

      {/* ── Alerts tab ─────────────────────────────────────────────────────────── */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="space-y-2">
            {/* Search */}
            <div className="relative max-w-sm">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-secondary-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên sản phẩm, SKU..."
                className="w-full rounded-lg border border-secondary-200 bg-white py-2 pl-9 pr-3 text-sm text-secondary-900 placeholder:text-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* Row: segments left — selects right */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Alert level segment */}
              <div className="flex gap-1 rounded-lg border border-secondary-200 bg-white p-1">
                {(
                  [
                    { value: "all",              label: "Tất cả" },
                    { value: "out_of_stock_inv", label: "Hết hàng" },
                    { value: "low_stock",        label: "Sắp hết" },
                  ] as { value: AlertFilter; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAlertFilter(opt.value)}
                    className={[
                      "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      alertFilter === opt.value
                        ? "bg-secondary-900 text-white"
                        : "text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Right side: 3 selects */}
              <div className="ml-auto flex items-center gap-2">
                {/* Supplier filter */}
                {suppliers.length > 0 && (
                  <Select
                    options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                    value={supplierId || undefined}
                    onChange={(v) => setSupplierId(typeof v === "string" ? v : "")}
                    placeholder="Nhà cung cấp"
                    clearable
                    searchable
                  />
                )}

                {/* Sort / urgency */}
                <Select
                  options={SORT_OPTIONS}
                  value={sortValue}
                  onChange={(v) => { if (typeof v === "string" && v) setSortValue(v); }}
                />

                {/* Count + page size */}
                <span className="whitespace-nowrap text-sm text-secondary-500">
                  {total} SP
                </span>
                <Select
                  options={PAGE_SIZE_OPTIONS.map((s) => ({ value: String(s), label: `${s} / trang` }))}
                  value={String(pageSize)}
                  onChange={(v) => { if (typeof v === "string" && v) setPageSize(Number(v)); }}
                />
              </div>
            </div>
          </div>

          {/* Card list */}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              </div>
            )}

            {items.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-secondary-100 bg-white py-16 text-center shadow-sm">
                <BellAlertIcon className="mb-3 w-10 h-10 text-success-400" />
                <p className="text-base font-semibold text-secondary-700">
                  {search || alertFilter !== "all" || supplierId
                    ? "Không tìm thấy kết quả"
                    : "Tồn kho ổn định"}
                </p>
                <p className="mt-1 text-sm text-secondary-400">
                  {search || alertFilter !== "all" || supplierId
                    ? "Thử thay đổi bộ lọc."
                    : "Không có sản phẩm nào dưới ngưỡng cảnh báo."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onAdjust={setAdjustingItem}
                    onThreshold={openThresholdModal}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary-500">
                Trang {page}/{totalPages} · {total} kết quả
              </p>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-secondary-200 px-3 py-1.5 text-sm text-secondary-700 transition-colors hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Trước
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-secondary-200 px-3 py-1.5 text-sm text-secondary-700 transition-colors hover:bg-secondary-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Configure tab ───────────────────────────────────────────────────────── */}
      {activeTab === "configure" && (
        <AlertConfigTable
          items={configItems.length > 0 ? configItems : items}
          onEdit={openThresholdModal}
        />
      )}

      {/* Modals */}
      {adjustingItem && (
        <AdjustStockModal
          isOpen
          onClose={() => setAdjustingItem(null)}
          onConfirm={handleAdjust}
          itemName={`${adjustingItem.productName} — ${adjustingItem.variantName}`}
          currentQty={adjustingItem.quantityOnHand}
          isConfirming={isAdjusting}
        />
      )}

      {thresholdItem && (
        <AlertThresholdModal
          isOpen
          onClose={() => setThresholdItem(null)}
          onConfirm={handleSaveThreshold}
          item={thresholdItem}
          initialReorderPoint={thresholdReorderPoint}
          isConfirming={isSavingThreshold}
        />
      )}
    </div>
  );
}

// ── ItemCard ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
  item: InventoryItem;
  onAdjust: (item: InventoryItem) => void;
  onThreshold: (item: InventoryItem) => void;
}

function ItemCard({ item, onAdjust, onThreshold }: ItemCardProps) {
  return (
    <div className="rounded-xl border border-secondary-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div>
            <Tooltip content={item.productName} placement="top">
              <Link
                href={`/products/${item.productId}`}
                className="inline-block max-w-[220px] truncate text-sm font-semibold text-primary-600 hover:underline"
              >
                {item.productName}
              </Link>
            </Tooltip>
          </div>
          <div>
            <Tooltip content={item.variantName} placement="top">
              <span className="inline-block max-w-[220px] truncate">
                <Link
                  href={`/products/${item.productId}/variants/${item.variantId}`}
                  className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
                >
                  {item.variantName}
                </Link>
              </span>
            </Tooltip>
          </div>
          <p className="font-mono text-xs text-secondary-400">{item.sku}</p>

          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <span className="text-xs text-secondary-500">
              Tồn kho:{" "}
              <strong className={item.quantityOnHand === 0 ? "text-error-600" : "text-secondary-900"}>
                {item.quantityOnHand}
              </strong>
            </span>
            <span className="text-xs text-secondary-500">
              Ngưỡng: <strong className="text-secondary-700">{item.lowStockThreshold}</strong>
            </span>
            <span className="text-xs text-secondary-500">
              Giá gốc: <strong className="text-secondary-700">{formatVND(item.costPrice)}</strong>
            </span>
            {item.supplierName && (
              <span className="text-xs text-secondary-500">
                NCC: <strong className="text-secondary-700">{item.supplierName}</strong>
              </span>
            )}
          </div>

          <UrgencyBar qty={item.quantityOnHand} threshold={item.lowStockThreshold} />

          <p className="mt-1 text-xs text-secondary-400">
            Nhập lần cuối: {formatRelativeTime(item.lastRestockedAt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={item.alertLevel} size="sm" />
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={() => onAdjust(item)}
              className="rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Điều chỉnh
            </button>
            <button
              type="button"
              onClick={() => onThreshold(item)}
              className="rounded-lg border border-secondary-200 px-3 py-1.5 text-xs font-medium text-secondary-700 transition-colors hover:bg-secondary-50"
            >
              Ngưỡng
            </button>
            <Link
              href={`/inventory/stock-in/new?variantId=${item.variantId}`}
              className="rounded-lg border border-primary-200 px-3 py-1.5 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-50"
            >
              Tạo phiếu nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
