"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DataTable, type ColumnDef, type SortDir } from "@/src/components/admin/DataTable";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { formatVND } from "@/src/lib/format";
import { getExportReceipts } from "@/src/services/inventory-exports.service";
import type { ExportReceiptSummaryDto, LoaiPhieuXuat } from "@/src/types/inventory.types";

// ─── Badge ────────────────────────────────────────────────────────────────────

const BADGE: Record<LoaiPhieuXuat, { label: string; cls: string }> = {
  XuatHuy:        { label: "Huỷ hỏng",   cls: "bg-error-100 text-error-700" },
  XuatDieuChinh:  { label: "Điều chỉnh", cls: "bg-warning-100 text-warning-700" },
  XuatNoiBo:      { label: "Nội bộ",     cls: "bg-info-100 text-info-700" },
  XuatBan:        { label: "Xuất bán",   cls: "bg-success-100 text-success-700" },
};

function LoaiBadge({ loai }: { loai: LoaiPhieuXuat }) {
  const b = BADGE[loai] ?? { label: loai, cls: "bg-secondary-100 text-secondary-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.cls}`}>
      {b.label}
    </span>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const LOAI_OPTIONS = [
  { value: "XuatHuy",        label: "Huỷ hỏng" },
  { value: "XuatDieuChinh",  label: "Điều chỉnh" },
  { value: "XuatNoiBo",      label: "Nội bộ" },
  { value: "XuatBan",        label: "Xuất bán" },
];

type Row = ExportReceiptSummaryDto & Record<string, unknown>;

const COLUMNS: ColumnDef<Row>[] = [
  {
    key: "receiptCode",
    header: "Mã phiếu",
    sortable: true,
    render: (_, row) => (
      <Link
        href={`/inventory/exports/${row.id as string}`}
        className="font-mono text-sm font-semibold text-primary-600 hover:underline"
      >
        {row.receiptCode as string}
      </Link>
    ),
  },
  {
    key: "loaiPhieu",
    header: "Loại",
    sortable: true,
    render: (_, row) => <LoaiBadge loai={row.loaiPhieu as LoaiPhieuXuat} />,
  },
  {
    key: "createdBy",
    header: "Nhân viên",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm text-secondary-700">
        {row.createdBy as string}
        {row.createdByCode ? <span className="ml-1 text-xs text-secondary-400">({row.createdByCode as string})</span> : null}
      </span>
    ),
  },
  {
    key: "lyDo",
    header: "Lý do",
    render: (_, row) => (
      <span className="max-w-[240px] truncate text-sm text-secondary-600 block">{row.lyDo as string}</span>
    ),
  },
  {
    key: "totalQty",
    header: "SL",
    render: (_, row) => <span className="text-sm font-medium">{row.totalQty as number}</span>,
  },
  {
    key: "tongGiaVon",
    header: "Giá vốn",
    sortable: true,
    render: (_, row) => (
      <span className="text-sm font-semibold text-secondary-900">{formatVND(row.tongGiaVon as number)}</span>
    ),
  },
  {
    key: "createdAt",
    header: "Ngày xuất",
    sortable: true,
    render: (_, row) => (
      <span className="text-xs text-secondary-500">
        {new Date(row.createdAt as string).toLocaleString("vi-VN", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </span>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  initialData: ExportReceiptSummaryDto[];
  initialTotal: number;
}

export function ExportReceiptsTable({ initialData, initialTotal }: Props) {
  const [items, setItems] = useState<ExportReceiptSummaryDto[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [loaiFilter, setLoaiFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  const prevNonPageKey = useRef(JSON.stringify({ q: "", loaiFilter: [], sortKey: "createdAt", sortDir: "desc", pageSize: PAGE_SIZE }));
  const prevSearchRef = useRef("");
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => { setPage(1); }, [q, loaiFilter, sortKey, sortDir, pageSize]);

  useEffect(() => {
    const nonPageKey = JSON.stringify({ q, loaiFilter, sortKey, sortDir, pageSize });
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
        const result = await getExportReceipts({
          page,
          limit: pageSize,
          search: q.trim() || undefined,
          loaiPhieu: loaiFilter[0] as LoaiPhieuXuat | undefined,
          sortBy: sortKey,
          sortOrder: sortDir as "asc" | "desc",
        });
        setItems(result?.data ?? []);
        setTotal(result?.total ?? 0);
      } catch {
        // keep existing
      } finally {
        setLoading(false);
      }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, loaiFilter, sortKey, sortDir]);

  return (
    <DataTable<Row>
      columns={COLUMNS}
      data={items as Row[]}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={setQ}
      searchPlaceholder="Tìm mã phiếu, nhân viên..."
      toolbarActions={
        <FilterDropdown
          label="Loại phiếu"
          options={LOAI_OPTIONS}
          selected={loaiFilter}
          onChange={setLoaiFilter}
        />
      }
      page={page}
      pageSize={pageSize}
      pageSizeOptions={[10, 25, 50]}
      totalRows={total}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      isLoading={loading}
      emptyMessage="Chưa có phiếu xuất kho nào."
    />
  );
}
