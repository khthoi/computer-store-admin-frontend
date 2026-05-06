"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PencilSquareIcon, TrashIcon, EyeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import type { LoyaltyEarnRule } from "@/src/types/loyalty.types";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { useToast } from "@/src/components/ui/Toast";
import { getEarnRules, updateEarnRule, deleteEarnRule } from "@/src/services/loyalty.service";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onTotalChange?: (activeCount: number) => void;
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

const BONUS_LABELS: Record<string, string> = {
  first_order: "Đơn đầu tiên",
  birthday:    "Sinh nhật",
  manual:      "Thủ công",
};

const BONUS_STYLES: Record<string, string> = {
  first_order: "bg-primary-50 text-primary-700 border-primary-200",
  birthday:    "bg-warning-50 text-warning-700 border-warning-200",
  manual:      "bg-secondary-100 text-secondary-600 border-secondary-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function EarnRulesTable({ onTotalChange }: Props) {
  const { showToast } = useToast();

  const [items, setItems]           = useState<LoyaltyEarnRule[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [search, setSearch]         = useState("");
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
        const result = await getEarnRules(page, pageSize, search || undefined);
        setItems(result.data);
        setServerTotal(result.total);
        onTotalChange?.(result.data.filter((r) => r.isActive).length);
      } catch { /* keep existing */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [page, pageSize, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePageSizeChange = (size: number) => {
    nonPageChangedRef.current = true; setPageSize(size); setPage(1);
  };
  const handleSearchChange = (val: string) => {
    nonPageChangedRef.current = true; setSearch(val); setPage(1);
  };

  async function handleToggleActive(id: string, isActive: boolean) {
    const snapshot = items;
    const updated = items.map((r) => (r.id === id ? { ...r, isActive } : r));
    setItems(updated);
    onTotalChange?.(updated.filter((r) => r.isActive).length);
    try {
      await updateEarnRule(id, { isActive });
    } catch {
      setItems(snapshot);
      onTotalChange?.(snapshot.filter((r) => r.isActive).length);
      showToast("Failed to update.", "error");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await deleteEarnRule(deleteTarget.id);
      showToast("Earn rule deleted.", "success");
      nonPageChangedRef.current = true;
      const result = await getEarnRules(page, pageSize, search || undefined);
      setItems(result.data);
      setServerTotal(result.total);
      onTotalChange?.(result.data.filter((r) => r.isActive).length);
    } catch {
      showToast("Failed to delete.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  // ── Columns ───────────────────────────────────────────────────────────────
  type Row = LoyaltyEarnRule & Record<string, unknown>;

  const columns: ColumnDef<Row>[] = [
    {
      key: "name",
      header: "Tên",
      width: "w-[18%]",
      render: (v, row) => (
        <div>
          <Tooltip content={v as string} anchorToContent>
            <Link
              href={`/promotions/earn-rules/${row.id as string}/edit`}
              className="block truncate text-sm font-medium text-primary-600 hover:underline"
            >
              {v as string}
            </Link>
          </Tooltip>
          {row.description && (
            <p className="text-[11px] text-secondary-400 truncate mt-0.5">
              {row.description as string}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "priority",
      header: "Ưu tiên",
      width: "w-[7%]",
      align: "center",
      render: (v) => (
        <span className="inline-flex items-center justify-center rounded-full bg-secondary-100 px-2 py-0.5 text-xs font-semibold text-secondary-700">
          {v as number}
        </span>
      ),
    },
    {
      key: "pointsPerUnit",
      header: "Tỉ lệ",
      width: "w-[12%]",
      render: (v, row) => (
        <span className="text-sm font-semibold text-primary-700 whitespace-nowrap">
          {v as number} pt / {((row.spendPerUnit as number) / 1000).toFixed(0)}k VND
        </span>
      ),
    },
    {
      key: "minOrderValue",
      header: "Đơn tối thiểu",
      width: "w-[10%]",
      align: "right",
      render: (v) => (
        <span className="text-sm text-secondary-600">
          {v != null
            ? `${(v as number).toLocaleString("vi-VN")}₫`
            : <span className="text-secondary-400">—</span>
          }
        </span>
      ),
    },
    {
      key: "scopes",
      header: "Phạm vi",
      width: "w-[16%]",
      render: (v) => {
        const scopes = v as LoyaltyEarnRule["scopes"];
        if (!scopes || scopes.length === 0) {
          return (
            <span className="inline-flex items-center rounded-full border border-secondary-200 bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold text-secondary-500">
              Toàn cục
            </span>
          );
        }
        return (
          <div className="flex flex-wrap gap-1">
            {scopes.map((s) => (
              <Tooltip
                key={s.id}
                content={`${s.scopeType === "category" ? "Danh mục" : s.scopeType === "brand" ? "Thương hiệu" : "Biến thể"}: ${s.scopeRefLabel} — ${s.multiplier}×`}
              >
                <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-2 py-0.5 text-[10px] font-semibold text-primary-700 cursor-default">
                  {s.multiplier}× {s.scopeRefLabel}
                </span>
              </Tooltip>
            ))}
          </div>
        );
      },
    },
    {
      key: "bonusTrigger",
      header: "Điểm thưởng",
      width: "w-[10%]",
      align: "center",
      render: (v, row) => {
        if (!v) return <span className="text-secondary-300 text-sm">—</span>;
        const trigger = v as string;
        return (
          <div className="flex flex-col items-center gap-0.5">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${BONUS_STYLES[trigger] ?? "bg-secondary-100 text-secondary-600 border-secondary-200"}`}>
              {BONUS_LABELS[trigger] ?? trigger}
            </span>
            {row.bonusPoints != null && (
              <span className="text-[10px] text-secondary-500">
                +{(row.bonusPoints as number).toLocaleString("vi-VN")} điểm
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "isActive",
      header: "Kích hoạt",
      width: "w-[7%]",
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
      key: "validFrom",
      header: "Thời hạn",
      width: "w-[12%]",
      render: (v, row) => {
        const from = formatDate(v as string | undefined);
        const until = formatDate(row.validUntil as string | undefined);
        if (!from && !until)
          return <span className="text-sm text-secondary-400">Luôn áp dụng</span>;
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
        <div className="flex items-center justify-center gap-1">
          <Tooltip content="Xem chi tiết">
            <Link
              href={`/promotions/earn-rules/${row.id as string}/edit`}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            >
              <EyeIcon className="w-4 h-4" />
            </Link>
          </Tooltip>
          <Tooltip content="Chỉnh sửa">
            <Link
              href={`/promotions/earn-rules/${row.id as string}/edit?mode=edit`}
              className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </Link>
          </Tooltip>
          <Tooltip content="Xoá">
            <button
              type="button"
              className="rounded p-1 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
              onClick={() => setDeleteTarget({ id: row.id as string, name: row.name as string })}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </Tooltip>
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
          searchPlaceholder="Tìm theo tên quy tắc…"
          tableLayout="fixed"
          emptyMessage="Chưa có quy tắc tích điểm nào."
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá quy tắc tích điểm"
        description={`Bạn có chắc muốn xoá "${deleteTarget?.name ?? ""}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        variant="danger"
      />
    </>
  );
}
