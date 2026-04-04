"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import {
  DataTable,
  RowActions,
  RowActionView,
  RowActionEdit,
  type ColumnDef,
  type SortDir,
} from "@/src/components/admin/DataTable";
import { StatusBadge } from "@/src/components/admin/StatusBadge";
import { FilterDropdown } from "@/src/components/admin/FilterDropdown";
import { useToast } from "@/src/components/ui/Toast";
import { duplicatePromotion } from "@/src/services/promotion.service";
import type { PromotionSummary, PromotionType, StackingPolicy } from "@/src/types/promotion.types";

type Row = PromotionSummary & Record<string, unknown>;

// ─── Labels ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<PromotionType, string> = {
  standard:     "Standard",
  bxgy:         "Buy X Get Y",
  bundle:       "Bundle",
  bulk:         "Bulk Tiered",
  free_shipping:"Free Shipping",
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
  { value: "active",    label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft",     label: "Draft" },
  { value: "paused",    label: "Paused" },
  { value: "ended",     label: "Ended" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPE_OPTIONS = [
  { value: "standard",      label: "Standard" },
  { value: "bxgy",          label: "Buy X Get Y" },
  { value: "bundle",        label: "Bundle" },
  { value: "bulk",          label: "Bulk Tiered" },
  { value: "free_shipping", label: "Free Shipping" },
];

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionsTable({
  initialPromotions,
  showCoupons = false,
}: {
  initialPromotions: PromotionSummary[];
  showCoupons?: boolean;
}) {
  const { showToast } = useToast();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState("startDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function handleDuplicate(id: string) {
    setDuplicating(id);
    try {
      const copy = await duplicatePromotion(id);
      showToast(`Duplicated as "${copy.name}" (draft).`, "success");
    } catch {
      showToast("Failed to duplicate.", "error");
    } finally {
      setDuplicating(null);
    }
  }

  const COLUMNS: ColumnDef<Row>[] = useMemo(() => [
    {
      key: "id",
      header: "ID",
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/promotions/${row.id as string}`}
          className="font-mono text-sm font-semibold text-primary-600 hover:underline"
        >
          {row.id as string}
        </Link>
      ),
    },
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (_, row) => (
        <div>
          <p className="text-sm font-medium text-secondary-900">{row.name as string}</p>
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
      header: "Type",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm text-secondary-600">
          {TYPE_LABELS[row.type as PromotionType] ?? (row.type as string)}
        </span>
      ),
    },
    {
      key: "scopeDisplay",
      header: "Scope",
      render: (_, row) => (
        <span className="text-sm text-secondary-600">{row.scopeDisplay as string}</span>
      ),
    },
    {
      key: "discountDisplay",
      header: "Discount",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-semibold text-primary-700">{row.discountDisplay as string}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (_, row) => <StatusBadge status={row.status as string} size="sm" />,
    },
    {
      key: "stackingPolicy",
      header: "Stacking",
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
      header: "Period",
      sortable: true,
      render: (_, row) => (
        <span className="whitespace-nowrap text-xs text-secondary-600">
          {formatDate(row.startDate as string)} – {formatDate(row.endDate as string)}
        </span>
      ),
    },
    {
      key: "usageCount",
      header: "Usage",
      sortable: true,
      render: (_, row) => {
        const count = row.usageCount as number;
        const limit = row.totalUsageLimit as number | undefined;
        const pct = limit ? Math.min(100, Math.round((count / limit) * 100)) : null;
        return (
          <div className="min-w-[80px]">
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
      header: "Priority",
      sortable: true,
      render: (_, row) => (
        <span className="text-sm font-mono text-secondary-600">{row.priority as number}</span>
      ),
    },
    {
      key: "_actions",
      header: "",
      render: (_, row) => (
        <RowActions>
          <RowActionView href={`/promotions/${row.id as string}`} />
          <RowActionEdit href={`/promotions/${row.id as string}/edit`} />
          <button
            type="button"
            onClick={() => handleDuplicate(row.id as string)}
            disabled={duplicating === (row.id as string)}
            title="Duplicate"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-secondary-400 hover:bg-secondary-50 hover:text-secondary-700 transition-colors disabled:opacity-40"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
          </button>
        </RowActions>
      ),
    },
  ], [duplicating]);

  const filtered = useMemo(() => {
    let rows = [...initialPromotions] as Row[];
    rows = rows.filter((r) => (showCoupons ? r.isCoupon : !r.isCoupon));
    if (q.trim()) {
      const lower = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.id as string).toLowerCase().includes(lower) ||
          (r.name as string).toLowerCase().includes(lower) ||
          ((r.code as string | undefined) ?? "").toLowerCase().includes(lower)
      );
    }
    if (statusFilter.length > 0) rows = rows.filter((r) => statusFilter.includes(r.status as string));
    if (typeFilter.length > 0)   rows = rows.filter((r) => typeFilter.includes(r.type as string));
    rows.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey] as string | number;
      const bv = (b as Record<string, unknown>)[sortKey] as string | number;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [initialPromotions, showCoupons, q, statusFilter, typeFilter, sortKey, sortDir]);

  const totalRows = filtered.length;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toolbarActions = (
    <>
      <FilterDropdown label="Status" options={STATUS_OPTIONS} selected={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
      <FilterDropdown label="Type"   options={TYPE_OPTIONS}   selected={typeFilter}   onChange={(v) => { setTypeFilter(v);   setPage(1); }} />
      <span className="text-sm text-secondary-400 whitespace-nowrap">
        {totalRows} {showCoupons ? "coupon" : "promotion"}{totalRows !== 1 ? "s" : ""}
      </span>
    </>
  );

  return (
    <DataTable<Row>
      columns={COLUMNS}
      data={pageRows}
      keyField="id"
      sortKey={sortKey}
      sortDir={sortDir}
      onSortChange={(key, dir) => { setSortKey(key); setSortDir(dir); }}
      searchQuery={q}
      onSearchChange={(val) => { setQ(val); setPage(1); }}
      searchPlaceholder={showCoupons ? "Search by ID, name, or code…" : "Search by ID or name…"}
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      pageSizeOptions={[10, 25, 50]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      emptyMessage={showCoupons ? "No coupons found." : "No promotions found."}
    />
  );
}
