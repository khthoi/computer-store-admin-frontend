"use client";

import Link from "next/link";
import { SparklesIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { LoyaltyRedemptionCatalog } from "@/src/types/loyalty.types";
import { DataTable } from "@/src/components/admin/DataTable";
import type { ColumnDef } from "@/src/components/admin/DataTable";
import { Toggle } from "@/src/components/ui/Toggle";
import { Tooltip } from "@/src/components/ui/Tooltip";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  initialItems: LoyaltyRedemptionCatalog[];
  onEdit: (item: LoyaltyRedemptionCatalog) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
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

export function RedemptionCatalogTable({
  initialItems,
  onEdit,
  onDelete,
  onToggleActive,
}: Props) {
  type Row = LoyaltyRedemptionCatalog & Record<string, unknown>;

  const columns: ColumnDef<Row>[] = [
    {
      key: "name",
      header: "Name",
      width: "w-[18%]",
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
      header: "Points Required",
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
      header: "Coupon",
      width: "w-[18%]",
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
      key: "discountDisplay",
      header: "Discount",
      width: "w-[10%]",
      render: (v) => (
        <span className="text-sm text-secondary-700">{(v as string) ?? "—"}</span>
      ),
    },
    {
      key: "isActive",
      header: "Active",
      width: "w-[8%]",
      align: "center",
      render: (v, row) => (
        <Toggle
          checked={v as boolean}
          onChange={(e) => onToggleActive(row.id as string, e.target.checked)}
          size="sm"
        />
      ),
    },
    {
      key: "redeemedCount",
      header: "Stock",
      width: "w-[10%]",
      align: "center",
      render: (v, row) => (
        <span className="text-sm text-secondary-600">
          {(v as number).toLocaleString("vi-VN")} /{" "}
          {row.stockLimit != null
            ? (row.stockLimit as number).toLocaleString("vi-VN")
            : "∞"}
        </span>
      ),
    },
    {
      key: "validFrom",
      header: "Valid Period",
      width: "w-[14%]",
      render: (v, row) => {
        const from = formatDate(v as string | undefined);
        const until = formatDate(row.validUntil as string | undefined);
        if (!from && !until) return <span className="text-sm text-secondary-400">Always</span>;
        return (
          <span className="text-xs text-secondary-600">
            {from || "—"} – {until || "—"}
          </span>
        );
      },
    },
    {
      key: "id",
      header: "Actions",
      width: "w-[8%]",
      align: "center",
      render: (_, row) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            title="Edit"
            className="rounded p-1 text-secondary-400 hover:bg-secondary-100 hover:text-secondary-700 transition-colors"
            onClick={() => onEdit(row as LoyaltyRedemptionCatalog)}
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            title="Delete"
            className="rounded p-1 text-secondary-400 hover:bg-error-50 hover:text-error-600 transition-colors"
            onClick={() => {
              if (window.confirm(`Delete "${row.name as string}"? This cannot be undone.`)) {
                onDelete(row.id as string);
              }
            }}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={initialItems as Row[]}
      columns={columns}
      keyField="id"
      page={1}
      pageSize={100}
      totalRows={initialItems.length}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      hidePagination
      tableLayout="fixed"
      emptyMessage="No redemption catalog items yet."
    />
  );
}
