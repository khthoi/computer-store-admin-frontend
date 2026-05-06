"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DocumentDuplicateIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  DataTable,
  RowActions,
  RowActionView,
  RowActionEdit,
  RowActionDelete,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { ConfirmDialog } from "@/src/components/admin/ConfirmDialog";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { useToast } from "@/src/components/ui/Toast";
import { Tooltip } from "@/src/components/ui/Tooltip";
import { duplicatePromotion, deletePromotion, getPromotionList } from "@/src/services/promotion.service";
import type { PromotionSummary, PromotionType, StackingPolicy } from "@/src/types/promotion.types";

type Row = PromotionSummary & Record<string, unknown>;

// ─── Labels ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PromotionType, string> = {
  standard:      "Giảm giá thông thường",
  bxgy:          "Mua X tặng Y",
  bundle:        "Combo / Gói sản phẩm",
  bulk:          "Số lượng lớn / Phân cấp",
  free_shipping: "FreeShip",
};

const STACKING_LABELS: Record<StackingPolicy, string> = {
  exclusive:                "Exclusive",
  stackable:                "Stackable",
  stackable_with_coupons_only: "Coupons Only",
};

const STACKING_STYLES: Record<StackingPolicy, string> = {
  exclusive:                "bg-error-50 text-error-700 border-error-200",
  stackable:                "bg-success-50 text-success-700 border-success-200",
  stackable_with_coupons_only: "bg-warning-50 text-warning-700 border-warning-200",
};

// ─── Filter options ───────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "active",    label: "Đang hoạt động" },
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "draft",     label: "Bản nháp" },
  { value: "paused",    label: "Tạm dừng" },
  { value: "ended",     label: "Đã kết thúc" },
  { value: "cancelled", label: "Đã hủy" },
];

const TYPE_OPTIONS = [
  { value: "standard",      label: "Giảm giá thông thường" },
  { value: "bxgy",          label: "Mua X tặng Y" },
  { value: "bundle",        label: "Combo / Gói sản phẩm" },
  { value: "bulk",          label: "Số lượng lớn / Phân cấp" },
  { value: "free_shipping", label: "FreeShip" },
];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialPromotions: PromotionSummary[];
  initialTotal: number;
  showCoupons?: boolean;
  onTotalChange?: (total: number) => void;
}

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsTable({ initialPromotions, initialTotal, showCoupons = false, onTotalChange }: Props) {
  const router = useRouter();
  const { showToast } = useToast();

  // ── Server state ──────────────────────────────────────────────────────────
  const [promotions, setPromotions] = useState<PromotionSummary[]>(initialPromotions);
  const [loading, setLoading] = useState(false);
  const [serverTotal, setServerTotal] = useState(initialTotal);
  const fetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const prevSearchRef = useRef("");
  const nonPageChangedRef = useRef(false);

  // ── Filter / search / sort state ──────────────────────────────────────────
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("startDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // ── Other state ───────────────────────────────────────────────────────────
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Server fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const isSearchChange = q !== prevSearchRef.current;
    prevSearchRef.current = q;
    const isNonPageChange = nonPageChangedRef.current;
    nonPageChangedRef.current = false;

    if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(async () => {
      if (isNonPageChange) setLoading(true);
      try {
        const result = await getPromotionList({
          page,
          limit: pageSize,
          search: q || undefined,
          status: statusFilter[0],
          type: typeFilter[0],
          isCoupon: showCoupons,
          sortBy: sortKey,
          sortOrder: sortDir,
        });
        setPromotions(result.data);
        setServerTotal(result.total);
        onTotalChange?.(result.total);
      } catch { /* keep existing */ }
      finally { setLoading(false); }
    }, isSearchChange ? 300 : 0);

    return () => { if (fetchTimerRef.current) clearTimeout(fetchTimerRef.current); };
  }, [page, pageSize, q, statusFilter, typeFilter, sortKey, sortDir, showCoupons]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSortChange = (key: string, dir: SortDir) => {
    nonPageChangedRef.current = true; setSortKey(key); setSortDir(dir); setPage(1);
  };
  const handleSearchChange = (val: string) => {
    nonPageChangedRef.current = true; setQ(val); setPage(1);
  };
  const handleStatusFilterChange = (v: string[]) => {
    nonPageChangedRef.current = true; setStatusFilter(v); setPage(1);
  };
  const handleTypeFilterChange = (v: string[]) => {
    nonPageChangedRef.current = true; setTypeFilter(v); setPage(1);
  };
  const handlePageSizeChange = (size: number) => {
    nonPageChangedRef.current = true; setPageSize(size); setPage(1);
  };

  async function handleDuplicate(id: string) {
    setDuplicating(id);
    try {
      const copy = await duplicatePromotion(id);
      showToast(`Đã nhân bản thành "${copy.name}".`, "success");
      router.refresh();
    } catch {
      showToast("Nhân bản thất bại.", "error");
    } finally {
      setDuplicating(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePromotion(deleteTarget.id as string);
      showToast(`Đã xoá "${deleteTarget.name as string}".`, "success");
      setDeleteTarget(null);
      router.refresh();
    } catch {
      showToast("Xoá thất bại.", "error");
    } finally {
      setDeleting(false);
    }
  }

  const COLUMNS: ColumnDef<Row>[] = useMemo(() => [
    {
      key: "name",
      header: showCoupons ? "Tên mã giảm giá" : "Tên khuyến mãi",
      width: "w-[21%]",
      sortable: true,
      render: (_, row) => (
        <div>
          <Tooltip content={row.name as string} placement="top" anchorToContent>
            <Link
              href={`/promotions/${row.id as string}`}
              className="block truncate text-sm font-medium text-secondary-900 hover:text-primary-600 hover:underline"
            >
              {row.name as string}
            </Link>
          </Tooltip>
          {(row.isCoupon as boolean) && (
            <span className="inline-block mt-0.5 rounded-md bg-secondary-100 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-wide text-secondary-600">
              {row.code as string}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Loại",
      width: "w-[9%]",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm text-secondary-600">
          {TYPE_LABELS[row.type as PromotionType] ?? (row.type as string)}
        </span>
      ),
    },
    {
      key: "scopeDisplay",
      header: "Phạm vi",
      width: "w-[10%]",
      render: (_, row) => (
        <Tooltip content={row.scopeDisplay as string} placement="top" anchorToContent>
          <span className="block truncate text-sm text-secondary-600 cursor-default">
            {row.scopeDisplay as string}
          </span>
        </Tooltip>
      ),
    },
    {
      key: "discountDisplay",
      header: "Discount",
      width: "w-[9%]",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-semibold text-primary-700">{row.discountDisplay as string}</span>
      ),
    },
    {
      key: "status",
      header: "trạng thái",
      width: "w-[8%]",
      align: "center",
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
    },
    {
      key: "stackingPolicy",
      header: "cộng dồn",
      width: "w-[8%]",
      align: "center",
      render: (_, row) => {
        const policy = row.stackingPolicy as StackingPolicy;
        return (
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STACKING_STYLES[policy]}`}>
            {STACKING_LABELS[policy]}
          </span>
        );
      },
    },
    {
      key: "startDate",
      header: "Thời gian",
      width: "w-[12%]",
      sortable: true,
      render: (_, row) => (
        <span className="whitespace-nowrap text-xs text-secondary-600">
          {formatDate(row.startDate as string)} – {formatDate(row.endDate as string)}
        </span>
      ),
    },
    {
      key: "usageCount",
      header: "lượt dùng",
      width: "w-[8%]",
      sortable: true,
      render: (_, row) => {
        const count = row.usageCount as number;
        const limit = row.totalUsageLimit as number | undefined;
        const pct = limit ? Math.min(100, Math.round((count / limit) * 100)) : null;
        return (
          <div>
            <span className="text-sm text-secondary-600">
              {count}{limit !== undefined ? ` / ${limit}` : ""}
            </span>
            {pct !== null && (
              <div className="mt-1 h-1.5 w-full rounded-full bg-secondary-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 90 ? "bg-error-500" : pct >= 60 ? "bg-warning-500" : "bg-success-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "priority",
      header: "Ưu tiên",
      width: "w-[7%]",
      align: "center",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-mono text-secondary-600">{row.priority as number}</span>
      ),
    },
    {
      key: "_actions",
      header: "",
      width: "w-[8%]",
      render: (_, row) => (
        <RowActions>
          <RowActionView href={`/promotions/${row.id as string}`} />
          <RowActionEdit href={`/promotions/${row.id as string}/edit`} />
          <button
            type="button"
            onClick={() => handleDuplicate(row.id as string)}
            disabled={duplicating === (row.id as string)}
            title="Nhân bản"
            className="flex items-center justify-center w-7 h-7 rounded text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors disabled:opacity-40"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
          <RowActionDelete onClick={() => setDeleteTarget(row)} ariaLabel="Xoá" />
        </RowActions>
      ),
    },
  ], [duplicating, showCoupons]); // eslint-disable-line react-hooks/exhaustive-deps

  const toolbarActions = (
    <>
      <FilterDropdown label="Status" options={STATUS_OPTIONS} selected={statusFilter} onChange={handleStatusFilterChange} />
      <FilterDropdown label="Type"   options={TYPE_OPTIONS}   selected={typeFilter}   onChange={handleTypeFilterChange} />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {serverTotal} {showCoupons ? "coupon" : "promotion"}{serverTotal !== 1 ? "s" : ""}
      </span>
    </>
  );

  return (
    <>
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/70">
            <ArrowPathIcon className="w-6 h-6 animate-spin text-primary-600" />
          </div>
        )}
        <DataTable<Row>
          columns={COLUMNS}
          data={promotions as Row[]}
          keyField="id"
          tableLayout="fixed"
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          searchQuery={q}
          onSearchChange={handleSearchChange}
          searchPlaceholder={showCoupons ? "Search by ID, name, or code…" : "Search by ID or name…"}
          toolbarActions={toolbarActions}
          page={page}
          pageSize={pageSize}
          totalRows={serverTotal}
          pageSizeOptions={[10, 25, 50]}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          emptyMessage={showCoupons ? "No coupons found." : "No promotions found."}
        />
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Xoá khuyến mãi?"
        description={
          deleteTarget
            ? `"${deleteTarget.name as string}" sẽ bị xoá vĩnh viễn cùng toàn bộ điều kiện, hành động và lịch sử sử dụng. Không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xoá vĩnh viễn"
        cancelLabel="Huỷ"
        variant="danger"
        isConfirming={deleting}
      />
    </>
  );
}
