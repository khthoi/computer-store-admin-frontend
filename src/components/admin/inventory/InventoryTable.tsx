"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  DataTable,
  RowActions,
  RowActionView,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { AdjustStockModal } from "@/src/components/admin/inventory/AdjustStockModal";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { formatVND } from "@/src/lib/format";
import { adjustStock } from "@/src/services/inventory.service";
import { useToast } from "@/src/components/ui/Toast";
import { Button } from "@/src/components/ui/Button";
import type { InventoryItem } from "@/src/types/inventory.types";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

type Row = InventoryItem & Record<string, unknown>;

const ALERT_OPTIONS = [
  { value: "ok",              label: "OK" },
  { value: "low_stock",       label: "Low Stock" },
  { value: "out_of_stock_inv", label: "Out of Stock" },
];

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "sku",
    header: "SKU / Product",
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
          <span className="mt-0.5 inline-block max-w-[180px] truncate">
            <Link
              href={`/products/${row.productId as string}/variants/${row.variantId as string}`}
              className="text-xs text-secondary-500 hover:text-primary-500 hover:underline"
            >
              {row.variantName as string}
            </Link>
          </span>
        </Tooltip>
        <p className="font-mono text-xs text-secondary-400">{row.sku as string}</p>
      </div>
    ),
  },
  {
    key: "supplierName",
    header: "Nhà cung cấp",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{(row.supplierName as string) ?? "—"}</span>
    ),
  },
  {
    key: "quantityOnHand",
    header: "Hiện có",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="text-sm font-semibold text-secondary-900 tabular-nums">
        {(row.quantityOnHand as number).toLocaleString("vi-VN")}
      </span>
    ),
  },
  {
    key: "quantityAvailable",
    header: "Có thể bán",
    sortable: true,
    align: "center",
    render: (_, row) => (
      <span className="text-sm text-secondary-600 tabular-nums">
        {(row.quantityAvailable as number).toLocaleString("vi-VN")}
      </span>
    ),
  },
  {
    key: "alertLevel",
    header: "Tình trạng",
    sortable: true,
    align: "center",
    render: (_, row) => <StatusBadge status={row.alertLevel as string} size="sm" />,
  },
  {
    key: "costPrice",
    header: "Giá vốn",
    align: "right",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{formatVND(row.costPrice as number)}</span>
    ),
  },
  {
    key: "_actions",
    header: "",
    render: (_, row) => (
      <RowActions>
        <RowActionView href={`/inventory/items`} />
      </RowActions>
    ),
  },
];

interface InventoryTableProps {
  initialItems: InventoryItem[];
}

export function InventoryTable({ initialItems }: InventoryTableProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState(initialItems);
  const [q, setQ] = useState("");
  const [alertFilter, setAlertFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("productName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);

  const filtered = useMemo(() => {
    let rows = [...items] as Row[];
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.productName as string).toLowerCase().includes(lower) ||
          (r.sku as string).toLowerCase().includes(lower) ||
          ((r.supplierName as string) ?? "").toLowerCase().includes(lower)
      );
    }
    if (alertFilter.length > 0) {
      rows = rows.filter((r) => alertFilter.includes(r.alertLevel as string));
    }
    rows.sort((a, b) => {
      const av = (a as unknown as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [items, q, alertFilter, sortKey, sortDir]);

  const totalRows = filtered.length;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  async function handleAdjust(delta: number, note: string) {
    if (!adjustingItem) return;
    setIsAdjusting(true);
    try {
      const updated = await adjustStock(adjustingItem.id, delta, note);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setAdjustingItem(null);
      showToast("Stock adjusted successfully.", "success");
    } catch {
      showToast("Failed to adjust stock.", "error");
    } finally {
      setIsAdjusting(false);
    }
  }

  const columnsWithAdjust: ColumnDef<Row>[] = [
    ...COLUMNS.slice(0, -1),
    {
      key: "_actions",
      header: "",
      render: (_, row) => (
        <RowActions>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => setAdjustingItem(row as unknown as InventoryItem)}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Adjust
          </Button>
        </RowActions>
      ),
    },
  ];

  const toolbarActions = (
    <>
      <FilterDropdown
        label="Status"
        options={ALERT_OPTIONS}
        selected={alertFilter}
        onChange={(v) => { setAlertFilter(v); setPage(1); }}
      />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} SKU{totalRows !== 1 ? "s" : ""}
      </span>
    </>
  );

  return (
    <>
      <DataTable<Row>
        columns={columnsWithAdjust}
        data={pageRows}
        keyField="id"
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
        searchQuery={q}
        onSearchChange={(val) => { setQ(val); setPage(1); }}
        searchPlaceholder="Tìm kiếm theo tên sản phẩm, SKU, hoặc nhà cung cấp..."
        toolbarActions={toolbarActions}
        page={page}
        pageSize={pageSize}
        totalRows={totalRows}
        pageSizeOptions={[10, 25, 50]}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        emptyMessage="No inventory items found."
      />
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
    </>
  );
}
