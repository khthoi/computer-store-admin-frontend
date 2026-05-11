"use client";

import { useState } from "react";
import Link from "next/link";
import { formatVND } from "@/src/lib/format";
import {
  DataTable,
  type ColumnDef,
} from "@/src/components/admin/DataTable";
import type { StockBatch } from "@/src/types/inventory.types";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { Badge } from "@/src/components/ui/Badge";

type Row = StockBatch & Record<string, unknown>;

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN");
}

const NOTE_MAX = 40;

type BatchStatus = 'con_hang' | 'da_het';

const STATUS_CONFIG: Record<BatchStatus, { label: string; variant: 'success' | 'error' }> = {
  con_hang: { label: 'Còn hàng', variant: 'success' },
  da_het:   { label: 'Đã hết',   variant: 'error'   },
};

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "maLo",
    header: "Mã lô",
    width: "w-[12%]",
    render: (_, row) => (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-sm font-semibold text-primary-700 max-w-[140px] truncate">{row.maLo as string}</span>
        {row.isNextFifo && (
          <Badge variant="warning" size="sm" className="w-fit">↑ Xuất kế tiếp</Badge>
        )}
      </div>
    ),
  },
  {
    key: "receiptCode",
    header: "Phiếu nhập",
    width: "w-[13%]",
    render: (_, row) => (
      <Link
        href={`/inventory/stock-in/${row.importReceiptId as string}`}
        className="font-mono text-sm text-primary-600 hover:underline max-w-[140px] truncate block"
      >
        {row.receiptCode as string}
      </Link>
    ),
  },
  {
    key: "createdBy",
    header: "Người nhập",
    width: "w-[14%]",
    render: (_, row) => {
      const name = row.createdBy as string | undefined;
      const code = row.createdByCode as string | undefined;
      if (!name) return <span className="text-secondary-300">—</span>;
      if (!code) return <span className="text-sm text-secondary-500">{name}</span>;
      return (
        <Tooltip content={name} placement="top" anchorToContent>
          <Link
            href={`/employees/${code}`}
            className="block max-w-[130px] truncate text-sm text-primary-600 hover:underline"
          >
            {name}
          </Link>
        </Tooltip>
      );
    },
  },
  {
    key: "importedAt",
    header: "Ngày nhập",
    align: "left",
    width: "w-[11%]",
    render: (_, row) => (
      <span className="text-sm text-secondary-600">{formatDate(row.importedAt as string)}</span>
    ),
  },
  {
    key: "costPrice",
    header: "Giá vốn",
    align: "left",
    width: "w-[13%]",
    render: (_, row) => {
      const price = row.costPrice as number | undefined;
      return (
        <span className="tabular-nums text-sm font-medium text-secondary-900">
          {price != null ? formatVND(price) : "—"}
        </span>
      );
    },
  },
  {
    key: "quantityImported",
    header: "Số lượng nhập",
    align: "center",
    width: "w-[12%]",
    render: (_, row) => (
      <span className="tabular-nums text-sm text-secondary-700">{row.quantityImported as number}</span>
    ),
  },
  {
    key: "quantityRemaining",
    header: "Còn lại",
    align: "center",
    render: (_, row) => {
      const rem = row.quantityRemaining as number;
      const imp = row.quantityImported as number;
      const pct = imp > 0 ? Math.round((rem / imp) * 100) : 0;
      const numColor = rem === 0
        ? "text-error-600"
        : rem < imp * 0.2 ? "text-warning-600" : "text-success-700";
      const barColor = rem === 0
        ? "bg-error-400"
        : rem < imp * 0.2 ? "bg-warning-400" : "bg-success-400";
      return (
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-baseline gap-1">
            <span className={`tabular-nums text-sm font-bold ${numColor}`}>{rem}</span>
            <span className="text-xs text-secondary-400">/ {imp}</span>
          </div>
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary-100">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    },
  },
  {
    key: "trangThai",
    header: "Trạng thái",
    align: "center",
    width: "w-[11%]",
    render: (_, row) => {
      const status = (row.trangThai as BatchStatus | undefined) ?? 'con_hang';
      const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['con_hang'];
      return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>;
    },
  },
  {
    key: "note",
    header: "Ghi chú",
    render: (_, row) => {
      const note = (row.note as string) ?? "";
      if (!note) return <span className="text-xs text-secondary-300">—</span>;
      const truncated = note.length > NOTE_MAX;
      return truncated ? (
        <Tooltip content={note} placement="top" multiline maxWidth="300px">
          <span className="cursor-default text-xs text-secondary-500">
            {note.slice(0, NOTE_MAX)}…
          </span>
        </Tooltip>
      ) : (
        <span className="text-xs text-secondary-500">{note}</span>
      );
    },
  },
];

export function BatchTable({ batches }: { batches: StockBatch[] }) {
  const [search, setSearch] = useState("");

  const q = search.trim().toLowerCase();
  const filtered = q
    ? (batches as Row[]).filter(
        (row) =>
          (row.maLo as string)?.toLowerCase().includes(q) ||
          (row.receiptCode as string)?.toLowerCase().includes(q) ||
          (row.createdBy as string | undefined)?.toLowerCase().includes(q) ||
          (row.createdByCode as string | undefined)?.toLowerCase().includes(q),
      )
    : (batches as Row[]);

  return (
    <DataTable<Row>
      columns={COLUMNS}
      data={filtered}
      keyField="id"
      searchQuery={search}
      onSearchChange={setSearch}
      searchPlaceholder="Tìm theo mã lô, phiếu nhập hoặc người nhập..."
      page={1}
      pageSize={filtered.length || 50}
      totalRows={filtered.length}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      hidePagination
      emptyMessage="Không có lô hàng nào."
    />
  );
}
