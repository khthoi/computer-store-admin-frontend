"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { AdjustStockModal } from "@/src/components/admin/inventory/AdjustStockModal";
import { AlertThresholdModal } from "@/src/components/admin/inventory/AlertThresholdModal";
import { ExportButton } from "@/src/components/admin/shared/ExportButton";
import { ColumnConfigurator } from "@/src/components/admin/shared/ColumnConfigurator";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { formatVND } from "@/src/lib/format";
import {
  getInventoryItems,
  adjustStock,
  updateThresholds,
  type InventoryItemParams,
} from "@/src/services/inventory.service";
import { createExportReceipt } from "@/src/services/inventory-exports.service";
import { useToast } from "@/src/components/ui/Toast";
import type { InventoryItem } from "@/src/types/inventory.types";
import {
  EllipsisVerticalIcon,
  ArrowPathIcon,
  BellAlertIcon,
  ClockIcon,
  DocumentPlusIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

// ─── Types ────────────────────────────────────────────────────────────────────

type Row = InventoryItem & Record<string, unknown>;

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const ALERT_OPTIONS = [
  { value: "ok",               label: "Còn hàng" },
  { value: "low_stock",        label: "Sắp hết" },
  { value: "out_of_stock_inv", label: "Hết hàng" },
];

const COLUMN_CONFIGS = [
  { key: "sku",               label: "SKU / Sản phẩm",   defaultVisible: true },
  { key: "supplierName",      label: "Nhà cung cấp",     defaultVisible: true },
  { key: "quantityOnHand",    label: "Hiện có",          defaultVisible: true },
  { key: "quantityReserved",  label: "Đặt trước",        defaultVisible: false },
  { key: "alertLevel",        label: "Tình trạng",       defaultVisible: true },
  { key: "costPrice",         label: "Giá vốn TB",        defaultVisible: true },
  { key: "sellingPrice",      label: "Giá bán",          defaultVisible: false },
  { key: "lowStockThreshold", label: "Ngưỡng cảnh báo",  defaultVisible: false },
  { key: "lastRestockedAt",   label: "Nhập gần nhất",    defaultVisible: false },
];

// ─── Action Dropdown ──────────────────────────────────────────────────────────

function ActionMenu({
  row,
  onAdjust,
  onThreshold,
}: {
  row: InventoryItem;
  onAdjust: () => void;
  onThreshold: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative flex justify-end">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Thao tác"
        className="flex h-7 w-7 items-center justify-center rounded-md text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
      >
        <EllipsisVerticalIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-max overflow-hidden rounded-xl border border-secondary-200 bg-white shadow-xl">
          <button
            type="button"
            onClick={() => { onAdjust(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 focus:outline-none"
          >
            <ArrowPathIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            Điều chỉnh tồn kho
          </button>
          <Link
            href={`/inventory/stock-in/new?variantId=${row.variantId}`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
          >
            <DocumentPlusIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            Tạo phiếu nhập
          </Link>
          <Link
            href={`/inventory/items/${row.variantId}/batches`}
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
          >
            <ArchiveBoxIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            Xem lô hàng
          </Link>
          <Link
            href="/inventory/movements"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
          >
            <ClockIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            Lịch sử biến động
          </Link>
          <button
            type="button"
            onClick={() => { onThreshold(); setOpen(false); }}
            className="flex w-full items-center gap-2.5 whitespace-nowrap px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 focus:outline-none"
          >
            <BellAlertIcon className="h-4 w-4 shrink-0 text-secondary-400" />
            Chỉnh ngưỡng cảnh báo
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Column builder ───────────────────────────────────────────────────────────

function buildColumns(
  visibleSet: Set<string>,
  onAdjust: (item: InventoryItem) => void,
  onThreshold: (item: InventoryItem) => void,
): ColumnDef<Row>[] {
  const cols: ColumnDef<Row>[] = [];

  if (visibleSet.has("sku")) {
    cols.push({
      key: "sku",
      header: "SKU / Sản phẩm",
      sortable: true,
      render: (_, row) => (
        <div className="min-w-0">
          <Tooltip content={row.productName as string} placement="top">
            <Link
              href={`/products/${row.productId as string}`}
              className="block max-w-[180px] truncate text-sm font-semibold text-primary-600 hover:underline"
            >
              {row.productName as string}
            </Link>
          </Tooltip>
          <Tooltip content={row.variantName as string} placement="top">
            <Link
              href={`/products/${row.productId as string}/variants/${row.variantId as string}`}
              className="mt-0.5 block max-w-[180px] truncate text-xs text-secondary-500 hover:text-primary-500 hover:underline"
            >
              {row.variantName as string}
            </Link>
          </Tooltip>
          <p className="font-mono text-xs text-secondary-400">{row.sku as string}</p>
        </div>
      ),
    });
  }

  if (visibleSet.has("supplierName")) {
    cols.push({
      key: "supplierName",
      header: "Nhà cung cấp",
      render: (_, row) => {
        const name = (row.supplierName as string) ?? "—";
        return (
          <Tooltip content={name} placement="top">
            <span className="block max-w-[160px] truncate text-sm text-secondary-600">{name}</span>
          </Tooltip>
        );
      },
    });
  }

  if (visibleSet.has("quantityOnHand")) {
    cols.push({
      key: "quantityOnHand",
      header: "Hiện có",
      sortable: true,
      align: "center",
      render: (_, row) => (
        <span className="text-sm font-semibold text-secondary-900 tabular-nums">
          {(row.quantityOnHand as number).toLocaleString("vi-VN")}
        </span>
      ),
    });
  }

  if (visibleSet.has("quantityReserved")) {
    cols.push({
      key: "quantityReserved",
      header: "Đặt trước",
      align: "center",
      render: (_, row) => (
        <span className="text-sm text-secondary-500 tabular-nums">
          {(row.quantityReserved as number).toLocaleString("vi-VN")}
        </span>
      ),
    });
  }

  if (visibleSet.has("alertLevel")) {
    cols.push({
      key: "alertLevel",
      header: "Tình trạng",
      sortable: true,
      align: "center",
      render: (_, row) => <StatusBadge status={row.alertLevel as string} size="sm" />,
    });
  }

  if (visibleSet.has("costPrice")) {
    cols.push({
      key: "costPrice",
      header: "Giá vốn TB",
      align: "right",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm text-secondary-600">{formatVND(row.costPrice as number)}</span>
      ),
    });
  }

  if (visibleSet.has("sellingPrice")) {
    cols.push({
      key: "sellingPrice",
      header: "Giá bán",
      align: "right",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm text-secondary-600">{formatVND(row.sellingPrice as number)}</span>
      ),
    });
  }

  if (visibleSet.has("lowStockThreshold")) {
    cols.push({
      key: "lowStockThreshold",
      header: "Ngưỡng",
      align: "center",
      render: (_, row) => (
        <span className="text-sm tabular-nums text-secondary-500">
          {(row.lowStockThreshold as number).toLocaleString("vi-VN")}
        </span>
      ),
    });
  }

  if (visibleSet.has("lastRestockedAt")) {
    cols.push({
      key: "lastRestockedAt",
      header: "Nhập gần nhất",
      align: "center",
      render: (_, row) => {
        const val = row.lastRestockedAt as string | undefined;
        if (!val) return <span className="text-xs text-secondary-400">—</span>;
        const d = new Date(val);
        const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        const date = d.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
        return (
          <span className="text-xs text-secondary-500 whitespace-nowrap">
            {time} {date}
          </span>
        );
      },
    });
  }

  // Actions — always last
  cols.push({
    key: "_actions",
    header: "",
    render: (_, row) => (
      <ActionMenu
        row={row as unknown as InventoryItem}
        onAdjust={() => onAdjust(row as unknown as InventoryItem)}
        onThreshold={() => onThreshold(row as unknown as InventoryItem)}
      />
    ),
  });

  return cols;
}

// ─── Export helpers ───────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  const s = val == null ? "" : String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function downloadCsv(rows: InventoryItem[]) {
  const header = ["SKU", "Sản phẩm", "Phiên bản", "Nhà cung cấp", "Hiện có", "Có thể bán", "Tình trạng", "Giá vốn", "Giá bán"];
  const lines = rows.map((r) => [
    r.sku, r.productName, r.variantName, r.supplierName ?? "",
    r.quantityOnHand, r.quantityAvailable, r.alertLevel,
    r.costPrice, r.sellingPrice,
  ].map(escapeCsv).join(","));
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `inventory_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InventoryTable() {
  const { showToast } = useToast();

  // Filters / sort
  const [q, setQ] = useState("");
  const [alertFilter, setAlertFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // Server data
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Column visibility
  const [visibleCols, setVisibleCols] = useState<string[]>(
    COLUMN_CONFIGS.filter((c) => c.defaultVisible !== false).map((c) => c.key)
  );

  // Modal state
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // No-flash refs
  const prevNonPageKey = useRef(
    JSON.stringify({ q: "", alertFilter: [], sortKey: "updatedAt", sortDir: "desc", pageSize: PAGE_SIZE })
  );
  const prevSearchRef = useRef("");
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  // Reset page when non-page params change
  useEffect(() => {
    setPage(1);
  }, [q, alertFilter, sortKey, sortDir, pageSize]);

  // Main fetch effect
  useEffect(() => {
    const nonPageKey = JSON.stringify({ q, alertFilter, sortKey, sortDir, pageSize });
    const isFirst = isFirstRender.current;
    isFirstRender.current = false;

    const isPageOnly = !isFirst && nonPageKey === prevNonPageKey.current;
    prevNonPageKey.current = nonPageKey;

    const isSearchChange = !isFirst && q !== prevSearchRef.current;
    prevSearchRef.current = q;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (!isPageOnly) setLoading(true);
      try {
        const params: InventoryItemParams = {
          page,
          limit: pageSize,
          sortKey,
          sortDir: sortDir as "asc" | "desc",
        };
        if (q.trim()) params.q = q.trim();
        if (alertFilter.length === 1) params.alertLevel = alertFilter[0];
        const result = await getInventoryItems(params);
        setItems(result.data);
        setTotal(result.total);
      } catch {
        // keep existing data on error
      } finally {
        setLoading(false);
      }
    }, isSearchChange ? 300 : 0);

    return () => {
      if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, alertFilter, sortKey, sortDir]);

  async function handleAdjust(action: { kind: string; soLuong: number; loaiGiaoDich?: string; loaiPhieu?: string; lyDo?: string; ghiChu: string }) {
    if (!adjustingItem) return;
    setIsAdjusting(true);
    try {
      if (action.kind === "adjust") {
        const delta = action.soLuong;
        await adjustStock(adjustingItem.variantId, delta, action.loaiGiaoDich!, action.ghiChu);
      } else {
        await createExportReceipt({
          loaiPhieu: action.loaiPhieu as "XuatHuy" | "XuatDieuChinh" | "XuatNoiBo",
          lyDo: action.lyDo!,
          ghiChu: action.ghiChu || undefined,
          items: [{ phienBanId: Number(adjustingItem.variantId), soLuong: action.soLuong }],
        });
      }
      setAdjustingItem(null);
      showToast("Điều chỉnh tồn kho thành công.", "success");
      const result = await getInventoryItems({ page, limit: pageSize, sortKey, sortDir: sortDir as "asc" | "desc" });
      setItems(result.data);
      setTotal(result.total);
    } catch {
      showToast("Điều chỉnh tồn kho thất bại.", "error");
    } finally {
      setIsAdjusting(false);
    }
  }

  async function handleThreshold(threshold: number, reorderPoint: number) {
    if (!thresholdItem) return;
    setIsSavingThreshold(true);
    try {
      await updateThresholds(thresholdItem.variantId, { lowStockThreshold: threshold, reorderPoint });
      setThresholdItem(null);
      showToast("Cập nhật ngưỡng cảnh báo thành công.", "success");
      const result = await getInventoryItems({ page, limit: pageSize, sortKey, sortDir: sortDir as "asc" | "desc" });
      setItems(result.data);
      setTotal(result.total);
    } catch {
      showToast("Cập nhật ngưỡng thất bại.", "error");
    } finally {
      setIsSavingThreshold(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    try {
      const params: InventoryItemParams = {
        page: 1,
        limit: 9999,
        sortKey,
        sortDir: sortDir as "asc" | "desc",
      };
      if (q.trim()) params.q = q.trim();
      if (alertFilter.length === 1) params.alertLevel = alertFilter[0];
      const result = await getInventoryItems(params);
      downloadCsv(result.data);
    } catch {
      showToast("Xuất dữ liệu thất bại.", "error");
    } finally {
      setIsExporting(false);
    }
  }

  const visibleSet = new Set(visibleCols);
  const columns = buildColumns(visibleSet, setAdjustingItem, setThresholdItem);

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Tình trạng"
        options={ALERT_OPTIONS}
        selected={alertFilter}
        onChange={(v) => setAlertFilter(v)}
      />
      <ColumnConfigurator
        tableId="inventory-items"
        columns={COLUMN_CONFIGS}
        onChange={setVisibleCols}
      />
      <ExportButton onExport={handleExport} isExporting={isExporting} scope="tồn kho" />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {total.toLocaleString("vi-VN")} SKU
      </span>
    </>
  );

  return (
    <>
      <DataTable<Row>
        columns={columns}
        data={items as Row[]}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchQuery={q}
        onSearchChange={(val) => setQ(val)}
        searchPlaceholder="Tìm kiếm theo tên sản phẩm hoặc SKU..."
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={total}
        pageSizeOptions={[20, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={(size) => setPageSize(size)}
        isLoading={loading}
        emptyMessage="Không tìm thấy sản phẩm tồn kho nào."
      />

      {adjustingItem && (
        <AdjustStockModal
          isOpen
          onClose={() => setAdjustingItem(null)}
          onConfirm={handleAdjust}
          itemName={`${adjustingItem.productName} — ${adjustingItem.variantName}`}
          variantId={Number(adjustingItem.variantId)}
          currentQty={adjustingItem.quantityOnHand}
          isConfirming={isAdjusting}
        />
      )}

      {thresholdItem && (
        <AlertThresholdModal
          isOpen
          onClose={() => setThresholdItem(null)}
          onConfirm={handleThreshold}
          item={thresholdItem}
          isConfirming={isSavingThreshold}
        />
      )}
    </>
  );
}
