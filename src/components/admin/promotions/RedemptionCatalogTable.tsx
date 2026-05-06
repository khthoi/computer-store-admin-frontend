"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SparklesIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import type { LoyaltyRedemptionCatalog } from "@/src/types/loyalty.types";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { getRedemptionCatalog, updateRedemptionCatalogItem, deleteRedemptionCatalogItem } from "@/src/services/loyalty.service";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  reloadTrigger?: number;
  onEdit: (item: LoyaltyRedemptionCatalog) => void;
  onTotalChange?: (total: number) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RedemptionCatalogTable({ reloadTrigger, onEdit, onTotalChange }: Props) {
  const { showToast } = useToast();

  const [items, setItems]             = useState<LoyaltyRedemptionCatalog[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [loading, setLoading]         = useState(false);
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [search, setSearch]           = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const fetchTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSearchRef     = useRef("");
  const nonPageChangedRef = useRef(true); // first render = show loader

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const isSearchChange = search !== prevSearchRef.current;
    prevSearchRef.current = search;
    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getRedemptionCatalog(page, pageSize, search || undefined);
        setItems(result.data);
        setServerTotal(result.total);
        onTotalChange?.(result.total);
      } catch { /* keep existing */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [page, pageSize, search, reloadTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageSizeChange = (size: number) => {
    nonPageChangedRef.current = true; setPageSize(size); setPage(1);
  };
  const handleSearchChange = (val: string) => {
    nonPageChangedRef.current = true; setSearch(val); setPage(1);
  };

  async function handleToggleActive(id: string, isActive: boolean) {
    const snapshot = items;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isActive } : i)));
    try {
      await updateRedemptionCatalogItem(id, { isActive });
    } catch {
      setItems(snapshot);
      showToast("Failed to update.", "error");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteRedemptionCatalogItem(deleteTarget.id);
      showToast("Deleted.", "success");
      nonPageChangedRef.current = true;
      const result = await getRedemptionCatalog(page, pageSize, search || undefined);
      setItems(result.data);
      setServerTotal(result.total);
      onTotalChange?.(result.total);
    } catch {
      showToast("Failed to delete.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  type Row = LoyaltyRedemptionCatalog & Record<string, unknown>;

  const columns: ColumnDef<Row>[] = [
    {
      key: "name",
      header: "Tên",
      width: "w-[22%]",
      render: (v) => (
        <Tooltip content={v as string} anchorToContent>
          <span className="block truncate text-sm font-medium text-secondary-800">
            {v as string}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "pointsRequired",
      header: "Điểm cần",
      width: "w-[10%]",
      align: "right",
      render: (v) => (
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
          <SparklesIcon className="w-3.5 h-3.5 shrink-0" />
          {(v as number).toLocaleString("vi-VN")}
        </span>
      ),
    },
    {
      key: "promotionCode",
      header: "Mã giảm giá",
      width: "w-[24%]",
      render: (v, row) => (
        <div className="space-y-0.5">
          <Link
            href={`/promotions/${row.promotionId as string}`}
            className="font-mono text-xs bg-secondary-100 px-2 py-0.5 rounded hover:bg-primary-50 hover:text-primary-700 transition-colors"
          >
            {(v as string) ?? "—"}
          </Link>
          {row.promotionName && (
            <p className="text-[11px] text-secondary-500 truncate">
              {row.promotionName as string}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "isActive",
      header: "Kích hoạt",
      width: "w-[8%]",
      align: "center",
      render: (v, row) => (
        <Toggle
          checked={v as boolean}
          onChange={(e) => handleToggleActive(row.id as string, e.target.checked)}
          size="sm"
        />
      ),
    },
    {
      key: "redeemedCount",
      header: "Tồn kho",
      width: "w-[10%]",
      align: "center",
      render: (v, row) => (
        <span className="text-sm text-secondary-600">
          {((v as number) ?? 0).toLocaleString("vi-VN")} /{" "}
          {row.stockLimit != null
            ? (row.stockLimit as number).toLocaleString("vi-VN")
            : "∞"}
        </span>
      ),
    },
    {
      key: "validFrom",
      header: "Thời hạn",
      width: "w-[14%]",
      render: (v, row) => {
        const from = formatDate(v as string | undefined);
        const until = formatDate(row.validUntil as string | undefined);
        if (!from && !until) return <span className="text-sm text-secondary-400">Luôn áp dụng</span>;
        return (
          <span className="text-xs text-secondary-600">
            {from || "—"} – {until || "—"}
          </span>
        );
      },
    },
    {
      key: "id",
      header: "Thao tác",
      width: "w-[8%]",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            title="Chỉnh sửa"
            className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            onClick={() => onEdit(row as LoyaltyRedemptionCatalog)}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Xoá"
            className="rounded p-1 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
            onClick={() => setDeleteTarget({ id: row.id as string, name: row.name as string })}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        )}
        <DataTable
          data={items as Row[]}
          columns={columns}
          keyField="id"
          page={page}
          pageSize={pageSize}
          totalRows={serverTotal}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          searchQuery={search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Tìm theo tên, mã giảm giá…"
          tableLayout="fixed"
          emptyMessage="Chưa có mục đổi điểm nào."
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá mục đổi thưởng"
        description={`Bạn có chắc muốn xoá "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        variant="danger"
      />
    </>
  );
}
